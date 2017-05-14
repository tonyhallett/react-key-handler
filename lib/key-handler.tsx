/* @flow */

import * as React from 'react';
//import {canUseDOM} from 'exenv';


import { KEYDOWN, KEYPRESS, KEYUP } from './constants';

import { isInput, matchesKeyboardEvent, eventKey, KeyboardKey } from './utils';

type KeyEventNames = "keydown" | "keypress" | "keyup";

/**
 * KeyHandler component.
 */

export type AllModMatch = string[];


export enum KeyModifiers {
    alt=1,
    ctrl = 2,
    shift = 4,
    all=8
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
export type KeyMatches = AllModMatch | ModForKeys | Array<ModKey>;






export interface KeyHandlerProps {
    keyValue?: string,
    keyCode?: number,
    keyCodes?: number[],//will delete 
    keyValues?: string[],//will delete
    keyMatches?:KeyMatches,
    keyEventName?: KeyEventNames,
    onKeyHandle?: (event: KeyboardEvent) => void,
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

  handleKey = (event: KeyboardEvent): void => {
      const { keyValue, keyCode, keyCodes, keyValues, onKeyHandle } = this.props;
    if (!onKeyHandle) {
      return;
    }

    const {target} = event;
      if (target instanceof HTMLElement && isInput(target as HTMLElement)) {
         return;
    }
      //might as well remove the singular;
      var matches = matchesKeyboardEvent(event, { keyValue, keyCode } as KeyboardKey);
      if (!matches) {
          if (keyCodes) {
              for (let i = 0; i < keyCodes.length; i++) {
                  var keyC = keyCodes[i];
                  matches = matchesKeyboardEvent(event, { keyCode: keyC } as KeyboardKey); 
                  if (matches) {
                        break;
                  }
              }
          }
          if (!matches && keyValues) {
              for (let i = 0; i < keyValues.length; i++) {
                  var keyV = keyValues[i]
                  matches = matchesKeyboardEvent(event, { keyValue:keyV } as KeyboardKey)
                  if (matches) {
                      break;
                  }
              }
          }
      }
      //if (!matchesKeyboardEvent(event, { keyValue, keyCode } as KeyboardKey)) {
      //  return;
    
      if (matches) {
          onKeyHandle(event);
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
