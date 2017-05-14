/* @flow */

import * as React from 'react';
//import {canUseDOM} from 'exenv';


import { KEYDOWN, KEYPRESS, KEYUP } from './constants';

import { isInput, matchesKeyboardEvent, eventKey, KeyboardKey } from './utils';

type KeyEventNames = "keydown" | "keypress" | "keyup";

/**
 * KeyHandler component.
 */

export type AnyModMatch = string[];

export function keyModifiersAny():KeyModifiers {
    return {
        altKey: true,
        ctrlKey: true,
        shiftKey: true,
        none: true,
        andOr: AndOr.Or
    }
}
export enum AndOr {
    Or, AndLoose, AndExact

}
export interface KeyModifiers {
    altKey:boolean,
    ctrlKey:boolean,
    shiftKey: boolean,
    none:boolean,
    andOr: AndOr
}
export interface ModForKeys {
    modifiers: KeyModifiers,
    keys:string[]
}
export interface ModKey {
    modifiers: KeyModifiers,
    key: string,
    id?:any//when used from the HOC the id will be set to the callback string name
}
//used by the KeyHandler component
export type KeyMatches = AnyModMatch | ModForKeys | Array<ModKey>;






export interface KeyHandlerProps {
    keyValue?: string,
    keyCode?: number,
    keyMatches?:KeyMatches,
    keyEventName?: KeyEventNames,
    onKeyHandle?: (event: KeyboardEvent,matchingIds:any[]) => void,
}
export class KeyHandler extends React.Component<KeyHandlerProps,null> {
  static defaultProps = {
    keyEventName: KEYUP,
  };

  shouldComponentUpdate(): boolean {
    return false;
  }

  constructor(props) {
      super(props);
    /* eslint-disable no-console */

    if (!props.keyValue && !props.keyCode) {
      console.error('Warning: Failed propType: Missing prop `keyValue` or `keyCode` for `KeyHandler`.');
    }

    /* eslint-enable */
  }

  componentDidMount(): void {
    //if (!canUseDOM) return;
    window.document.addEventListener(this.props.keyEventName, this.handleKey);
  }

  componentWillUnmount(): void {
    //if (!canUseDOM) return;

    window.document.removeEventListener(this.props.keyEventName, this.handleKey);
  }

  render(): null {
    return null;
  }
  isModifierMatch = (event: KeyboardEvent, modifiers: KeyModifiers) => {
      var match = true;
      var modKeys = {
          altKey: modifiers.altKey,
          ctrlKey: modifiers.ctrlKey,
          shiftKey: modifiers.shiftKey
      }
      var none = modifiers.none;
      if (modifiers.andOr !== AndOr.Or) {
          if (none) {
              throw new Error("cannot have none and and");
          }
          for (var modKey in modKeys) {
              if (modKeys[modKey]) {
                  match = event[modKey];
                  if (!match) {
                      break;
                  }
              }
          }
      } else {

          //console.log("in or")//these needs to change to cater for none 
          var noModifiers = true;
          for (var modKey in modKeys) {
              if (modKeys[modKey]) {
                  //console.log("Looking at event " + modKey);
                  match = event[modKey];
                  if (noModifiers) {
                      noModifiers = !match;
                  }
                  
                  if (match) {
                      //console.log("match key: " + modKey);
                      break;
                  }
              }
          }
          if (!match && noModifiers&&none) {
              //console.log('no modifiers and none');
              match = true;
          }
      }
      //console.log('is match: ' + match)
      return match;
  }
  handleKey = (event: KeyboardEvent): void => {
      //console.log("in handle key");
      const { keyValue, keyCode, keyMatches, onKeyHandle } = this.props;
    if (!onKeyHandle) {
      return;
    }

    const {target} = event;
      if (target instanceof HTMLElement && isInput(target as HTMLElement)) {
         return;
    }
      //console.log("Before keyMatches");
      var matchingIds: any[] = [];
      var matches: boolean;
      if (keyMatches) {
          //console.log("In key matches");
          if (keyMatches instanceof Array) {
              for (var i = 0; i < keyMatches.length; i++) {
                  var keyOrModKey = keyMatches[i];
                  var key: string;
                  var mod = keyModifiersAny();
                  var id: any;
                  if (typeof keyOrModKey === 'string') {
                      key = keyOrModKey;
                  } else {
                      key = keyOrModKey.key;
                      mod = keyOrModKey.modifiers;
                      id = keyOrModKey.id;
                  }
                  var kbKey: KeyboardKey = { keyValue: key, keyCode: null } as KeyboardKey;

                  var possibleMatch = matchesKeyboardEvent(event, kbKey );
                  if (possibleMatch) {//dependent on which one we break - todo------------------- have a temp matches as if have a match if the next is not then still have a match
                      //console.log(key + " is possible match");
                      matches = this.isModifierMatch(event, mod);
                      if (matches) {
                          matchingIds.push(id);
                          break;
                      }
                  }
              }
          } else {
              var keys = keyMatches.keys;
              for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];
                  var possibleMatch = matchesKeyboardEvent(event, { keyValue:key, keyCode:null } as KeyboardKey);
                  if (possibleMatch) {
                      matches = this.isModifierMatch(event, keyMatches.modifiers);
                      break;//we break here as is matching on keys with the same modifiers
                      
                  }
              }
          }
      } else {
          matches = matchesKeyboardEvent(event, { keyValue, keyCode } as KeyboardKey);
      }

      if (matches) {
          //will add a test that this passes the identifier of matched
          onKeyHandle(event,matchingIds);
      }
    
  };
}

/**
 * Types.
 */

export interface KeyMatchesMethodName {
    keyMatches: KeyMatches,
    methodName: string
}
type DecoratorProps = {
  keyValue?: string,
  keyCode?: number,
  keyEventName?: KeyEventNames,//**************************** not sure if this can be optional
  keyValues?: string[],//will delete
  keyCodes?: number[],//will delete
  keyMatches?: Array<KeyMatchesMethodName> | KeyMatches
}

type State = {
  keyValue?: string,
  keyCode?: number,
};

/**
 * KeyHandler decorators.
 */


//will need to change component to React.Component<any,any>| the type of a stateless
function keyHandleDecorator(matcher?: typeof matchesKeyboardEvent): (props?: DecoratorProps)=>(component:any)=>any  {
    return (props?: DecoratorProps): (component: any) => any => {
        const { keyValue, keyCode, keyEventName, keyCodes, keyValues } = props || {} as DecoratorProps;

    return (Component) => (
      class KeyHandleDecorator extends React.Component<null,State> {
        state: State = { keyValue: null, keyCode: null };

        render() {
          return (
              <div>
                  <KeyHandler keyValue={keyValue} keyCode={keyCode} keyCodes={keyCodes} keyValues={keyValues} keyEventName={keyEventName} onKeyHandle={this.handleKey} />
                  <Component {...this.props} {...this.state} />
            </div>
          );
        }

        handleKey = (event: KeyboardEvent): void => {
          if (matcher && matcher(event, this.state)) {
            this.setState({ keyValue: null, keyCode: null });
            return;
          }

          this.setState({ keyValue: eventKey(event), keyCode: event.keyCode });
        };
      }
    );
  };
}

export const keyHandler = keyHandleDecorator();
export const keyToggleHandler = keyHandleDecorator(matchesKeyboardEvent);

/**
 * Constants
 */

export * from './constants';
