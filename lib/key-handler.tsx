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
export enum KeyModifiersEnum {
    none=0,
    alt = 1 << 0,
    ctrl=1<<1,
    shift = 1 << 2,
    all = KeyModifiersEnum.alt | KeyModifiersEnum.ctrl | KeyModifiersEnum.shift
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

    //if (!props.keyValue && !props.keyCode) {
    //  console.error('Warning: Failed propType: Missing prop `keyValue` or `keyCode` for `KeyHandler`.');
    //}

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
          //could have mapped all to Array<ModKey> but then would have had unnecessary looping
          if (keyMatches instanceof Array) {
              for (var i = 0; i < keyMatches.length; i++) {
                  var keyOrModKey = keyMatches[i];
                  var key: string;
                  var mod = keyModifiersAny();
                  var id: any = null;
                  if (typeof keyOrModKey === 'string') {
                      key = keyOrModKey;
                  } else {
                      key = keyOrModKey.key;
                      mod = keyOrModKey.modifiers;
                      id = keyOrModKey.id;
                  }
                  var kbKey: KeyboardKey = { keyValue: key, keyCode: null } as KeyboardKey;
                  var possibleMatch = matchesKeyboardEvent(event, kbKey );
                  if (possibleMatch) {
                      var isMatch = this.isModifierMatch(event, mod);
                      if (!matches) {
                          matches = isMatch;
                      }
                      if (matches&&id) {
                          matchingIds.push(id);
                      }
                      if (!id) {
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
                      break;
                  }
              }
          }
      } else {
          matches = matchesKeyboardEvent(event, { keyValue, keyCode } as KeyboardKey);
      }

      if (matches) {
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
  keyMatches?: Array<KeyMatchesMethodName> | KeyMatches
}

type KeyHandleDecoratorState = {
  keyValue?: string,
  keyCode?: number,
  modifiers?: KeyModifiersEnum
};

/**
 * KeyHandler decorators.
 */


function keyHandleDecorator<P>(matcher?: typeof matchesKeyboardEvent) {
    return (props?: DecoratorProps): (component: new (...any: any[]) => React.Component<P & KeyHandleDecoratorState, any>) => new (...any: any[]) => React.Component<P & KeyHandleDecoratorState, KeyHandleDecoratorState>  => {
        const { keyValue, keyCode, keyEventName, keyMatches } = props || {} as DecoratorProps;

        return (Component) => (
            class KeyHandleDecorator extends React.Component<P & KeyHandleDecoratorState, KeyHandleDecoratorState> {
                state: KeyHandleDecoratorState = { keyValue: null, keyCode: null, modifiers:null };

        wrappedInstance: any;
        
        render() {
            function isKeyMatchesMethodName(toDetermine: string | ModKey | KeyMatchesMethodName): toDetermine is KeyMatchesMethodName {
                return (toDetermine as KeyMatchesMethodName).methodName !== undefined;
            }
            var mappedKeyMatches = keyMatches as KeyMatches;
            
            if (keyMatches) {
                if (keyMatches instanceof Array) {
                    var testEntry = keyMatches[0];
                    if (isKeyMatchesMethodName(testEntry)) {
                        var keyMatchesMethodNameArray = keyMatches as KeyMatchesMethodName[];
                        var allModKeys: ModKey[]=[]
                        keyMatchesMethodNameArray.forEach(keyMatchesMethodName => {
                            var methodName = keyMatchesMethodName.methodName;
                            var kMatches = keyMatchesMethodName.keyMatches;
                            var modKeys: ModKey[];
                            if (kMatches instanceof Array) {
                                var tEntry = kMatches[0];
                                if (typeof tEntry === 'string') {
                                    var anyKeyModifiers = keyModifiersAny();
                                    modKeys = (kMatches as string[]).map(kMatch => {
                                        var modKey: ModKey = {
                                            key: kMatch,
                                            modifiers: anyKeyModifiers
                                        }
                                        return modKey;
                                    });
                                } else {
                                    modKeys = kMatches as ModKey[];
                                }

                            } else {
                                var modifiers = kMatches.modifiers;
                                modKeys = kMatches.keys.map(key => {
                                    var modKey: ModKey = {
                                        key: key,
                                        modifiers: modifiers
                                    }
                                    return modKey;
                                })
                            }
                            modKeys.forEach(modKey => modKey.id = methodName);
                            allModKeys = allModKeys.concat(modKeys);

                        });
                        mappedKeyMatches = allModKeys;
                    }
                } 
            }
            

          return (
              <div>
                  <KeyHandler keyValue={keyValue} keyCode={keyCode} keyMatches={mappedKeyMatches} keyEventName={keyEventName} onKeyHandle={this.handleKey} />
                  <Component ref={(instance) => { this.wrappedInstance = instance; }} {...this.props} {...this.state} />
            </div>
          );
        }

        handleKey = (event: KeyboardEvent, ids: any[]): void => {
          if (matcher && matcher(event, this.state)) {
            this.setState({ keyValue: null, keyCode: null });
            return;
            }
          var modifiers = KeyModifiersEnum.none;
          if (event.altKey) {
              modifiers |= KeyModifiersEnum.alt;
          }
          if (event.ctrlKey) {
              modifiers |= KeyModifiersEnum.ctrl;
          }
          if (event.shiftKey) {
              modifiers |= KeyModifiersEnum.shift;
          }
          var keyValue = eventKey(event);
          var keyCode = event.keyCode;
          if (ids.length > 0) {
              ids.forEach(methodName => {
                  this.wrappedInstance[methodName](event, keyValue, keyCode, modifiers);
              })

          }
          this.setState({ keyValue: keyValue, keyCode: keyCode, modifiers: modifiers });
          
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
