///<reference types="jest"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom'
import { mount, shallow, ReactWrapper } from 'enzyme';
import { xpit, pit, pits, xpits } from '../node_modules/jestextensions/index'
import { KeyHandler, KeyHandlerProps, keyHandler, KeyModifiers, keyModifiersAny, ModKey, AndOr, AnyModMatch, ModForKeys, KeyMatches, KeyModifiersEnum } from '../lib/key-handler'
import { AnyModWrapped, ModForKeysWrapped, ArrayModKeysWrapped, expectedModForKeysKeyMatches, expectedArrayModKeysKeyMatches, expectedAnyKeyMatches, KeyMatchesMethodNameSingleAnyMod, KeyMatchesMethodNameMultipleAnyMod, KeyMatchesMethodNameSingleModForKeys, KeyMatchesMethodNameSingleArrayModKeys, expectedKeyMatchesMethodNameSingleAnyKeyMatches, expectedKeyMatchesMethodNameMultipleAnyKeyMatches, expectedModForKeysMethodNameKeyMatches, expectedArrayModKeysMethodNameKeyMatches, WrappedMatchesAAny, Wrapped, KeyProps, CallbackWrappedMatchesAMultiple, CallbackWrappedMatchesAAnySingle, CallbackState, WrappedHasOwnProp } from '../testHelpers/testComponents'

var keyboardEvent: KeyboardEvent;
//why is the typescript definition file not a string union type ( instead of string )

function triggerKeyEvent(eventName, keyCode, keyValue = undefined, altKey=false,ctrlKey=false,shiftKey=false) {
    //const event = new window.KeyboardEvent(eventName, { keyCode, key: keyValue });
    //document.dispatchEvent(event);

    //**********code:keyCode does not work !!!!! it appears that jsdom is using deprecated keyCode instead
    keyboardEvent = new KeyboardEvent(eventName, { keyCode: keyCode, key: keyValue, altKey: altKey, ctrlKey: ctrlKey, shiftKey: shiftKey } as KeyboardEventInit);
    document.dispatchEvent(keyboardEvent);
    
}
var handler = jest.fn();
//remember not to be null and undefined !
describe('<KeyHandler/>', () => {
    beforeEach(() => {
        handler.mockReset();
    })
    it('should callback with the KeyboardEvent when matches', () => {
        ReactDOM.render(<KeyHandler keyEventName="keypress" keyCode={9} onKeyHandle={handler} />,
            document.body);
        triggerKeyEvent("keypress", 9);
        expect(handler.mock.calls[0][0]).toBe(keyboardEvent);
    });
    describe('singular - old way', () => {
        it('should handle single key from keyCode', () => {
            ReactDOM.render(<KeyHandler keyEventName="keypress" keyCode={9} onKeyHandle={handler} />,
                document.body);
            triggerKeyEvent("keypress", 9);
            expect(handler).toHaveBeenCalled();
        });
        it('should not handle single key codes it is not interested in', () => {
            ReactDOM.render(<KeyHandler keyEventName="keypress" keyCode={9} onKeyHandle={handler} />,
                document.body);
            triggerKeyEvent("keypress", 8);
            expect(handler).not.toHaveBeenCalled();
        });
        it('should handle single key from keyValue', () => {
            ReactDOM.render(<KeyHandler keyEventName="keypress" keyValue="A" onKeyHandle={handler} />,
                document.body);
            triggerKeyEvent("keypress", null, "A");
            expect(handler).toHaveBeenCalled();
        });
        it('should not handle single key values it is not interested in', () => {
            ReactDOM.render(<KeyHandler keyEventName="keypress" keyValue="A" onKeyHandle={handler} />,
                document.body);
            triggerKeyEvent("keypress", null, "B");
            expect(handler).not.toHaveBeenCalled();
        });
    })
    describe('can multiple keyValue match with modifiers', () => {
        describe('implicit any - none or one of the modifiers matches', () => {
            //any means none will match, otherwise all need is one of the modifiers to be set
            pit('any no modifiers match A', "A", false, false, false, true);
            pit('any no modifiers match B', "B", false, false, false, true);
            pit('any mismatch letter', "C", false, false, false, false);
            pit('any with single modifier match', "A", false, true, false, true);
            pit('any with two modifiers match', "A", false, true, true, true);
            pit('any with three modifiers match', "A", true, true, true, true);
            
            pits((triggerKey: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, expectMatched: boolean) => {
                ReactDOM.render(<KeyHandler keyEventName="keypress" keyMatches={["A", "B"]} onKeyHandle={handler} />,
                    document.body);
                triggerKeyEvent("keypress", null, triggerKey, altKey, ctrlKey, shiftKey);
                if (expectMatched) {
                    expect(handler).toHaveBeenCalled();
                } else {
                    expect(handler).not.toHaveBeenCalled();
                }
                
            });
        });
        describe('specified for all, all provided keys should match the same on modifiers', () => {
            var modifiers: KeyModifiers={
                altKey: true,
                shiftKey: true,
                ctrlKey: true,
                andOr: AndOr.AndExact,
                none:false
            }
            
            pit('a matches', "A", true, true, true, true);
            pit('b matches', "B", true, true, true, true);

            pit('a does not match', "A", false, false, false, false);
            pit('b does not match', "B", false, false, false, false);

            pits((triggerKey: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, expectMatched: boolean) => {
                ReactDOM.render(<KeyHandler keyEventName="keypress" keyMatches={{modifiers:modifiers, keys: ["A", "B"] }} onKeyHandle={handler} />,
                    document.body);
                triggerKeyEvent("keypress", null, triggerKey, altKey, ctrlKey, shiftKey);
                if (expectMatched) {
                    expect(handler).toHaveBeenCalled();
                } else {
                    expect(handler).not.toHaveBeenCalled();
                }

            });
        });
        describe('individual basis', () => {
            //need to ensure that just because fail on one letter/mod combo does not break
            var modKeyId = { id: 1 };
            var modKeyId2 = { id: 2 };
            var singularMatchModKeys: Array<ModKey> = [{
                id: modKeyId,
                key: "A",
                modifiers: {
                    altKey: true,
                    ctrlKey: false,
                    shiftKey: false,
                    andOr: AndOr.AndExact,
                    none: false
                }
            }];
            var multipleMatchModKeys: Array<ModKey> = [{
                id: modKeyId,
                key: "A",
                modifiers: {
                    altKey: true,
                    ctrlKey: false,
                    shiftKey: false,
                    andOr: AndOr.AndExact,
                    none: false
                }
            },
                {
                    id: modKeyId2,
                    key: "A",
                    modifiers: {
                        altKey: true,
                        ctrlKey: false,
                        shiftKey: false,
                        andOr: AndOr.AndExact,
                        none: false
                    }
            }];
            describe('should return the ids of the matched in the callback', () => {
                pit('singular', singularMatchModKeys, [modKeyId]);
                pit('multiple', multipleMatchModKeys, [modKeyId,modKeyId2]);
                pits((modKeys:ModKey[],expectedMatchIds:any[]) => {
                    ReactDOM.render(<KeyHandler keyEventName="keypress" keyMatches={modKeys} onKeyHandle={handler} />,
                        document.body);
                    triggerKeyEvent("keypress", null, "A", true, false, false);
                    expect(handler.mock.calls[0][1]).toEqual(expectedMatchIds);

                });
            })
            var notNoneOrModKeys: Array<ModKey> = [{
                id: modKeyId,
                key: "A",
                modifiers: {
                    altKey: true,
                    ctrlKey: false,
                    shiftKey: false,
                    andOr: AndOr.Or,
                    none: false
                }
            }];
            var andLooseModKeys: Array<ModKey> = [{
                id: modKeyId,
                key: "A",
                modifiers: {
                    altKey: true,
                    ctrlKey: true,
                    shiftKey: false,
                    andOr: AndOr.AndLoose,
                    none: false
                }
            }];
            var andExactModKeys: Array<ModKey> = [{
                id: modKeyId,
                key: "A",
                modifiers: {
                    altKey: true,
                    ctrlKey: true,
                    shiftKey: false,
                    andOr: AndOr.AndLoose,
                    none: false
                }
            }];
            pit('when or and none is false, must not match when no modifiers', "A", notNoneOrModKeys, false, false, false, false);

            pit('and loose matches when specified modifiers are pressed', "A", andLooseModKeys, true, true, false, true);
            pit('and loose does not match when specified modifiers are not pressed', "A", andLooseModKeys,true,false,false,false )
            pit('and loose matches with additional modifiers', andLooseModKeys, true, true, true, true);

            pit('and exact matches when specified modifiers are pressed', "A", andExactModKeys, true, true, false, true);
            pit('and exact does not match when specified modifiers are not pressed', "A", andExactModKeys, true, false, false, false)
            pit('and exact does not match with additional modifiers', andExactModKeys, true, true, true, false);
            pits((triggerKey: string, modKeys:Array<ModKey>, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, expectMatched: boolean) => {
                ReactDOM.render(<KeyHandler keyEventName="keypress" keyMatches={modKeys} onKeyHandle={handler} />,
                    document.body);
                triggerKeyEvent("keypress", null, triggerKey, altKey, ctrlKey, shiftKey);
                if (expectMatched) {
                    expect(handler).toHaveBeenCalled();
                } else {
                    expect(handler).not.toHaveBeenCalled();
                }

            });
        })
    });
});

describe('keyHandler hoc', () => {
    describe('should pass keyMatches to KeyHandler component if not callbacks', () => {
        pit('any mod match', <AnyModWrapped />, expectedAnyKeyMatches);
        pit('modForKeys', <ModForKeysWrapped />, expectedModForKeysKeyMatches);
        pit('arrayModKeys', <ArrayModKeysWrapped />, expectedArrayModKeysKeyMatches);
        pits((componentToRender: React.ReactElement<{}>, keyMatches: KeyMatches) => {
            var wrapper = mount(componentToRender);
            var keyHandlerWrapper = wrapper.find(KeyHandler) as ReactWrapper<KeyHandlerProps, any>;
            var actualKeyMatches = keyHandlerWrapper.prop('keyMatches');
            expect(actualKeyMatches).toEqual(keyMatches);
        })
    });
    describe('with callbacks should create Array<ModKey> with methodName for KeyHandler component', () => {

        pit('any mod match single', <KeyMatchesMethodNameSingleAnyMod />, expectedKeyMatchesMethodNameSingleAnyKeyMatches);
        pit('any mod match multiple', <KeyMatchesMethodNameMultipleAnyMod />, expectedKeyMatchesMethodNameMultipleAnyKeyMatches);
        pit('modForKeys', <KeyMatchesMethodNameSingleModForKeys />, expectedModForKeysMethodNameKeyMatches);
        pit('arrayModKeys', <KeyMatchesMethodNameSingleArrayModKeys />, expectedArrayModKeysMethodNameKeyMatches);
        pits((componentToRender: React.ReactElement<{}>, keyMatches: KeyMatches) => {
            var wrapper = mount(componentToRender);
            var keyHandlerWrapper = wrapper.find(KeyHandler) as ReactWrapper<KeyHandlerProps, any>;
            var actualKeyMatches = keyHandlerWrapper.prop('keyMatches');
            expect(actualKeyMatches).toEqual(keyMatches);
        })
    })
    it('should pass keyValue and keyCode as props to wrapped', () => {
        var wrapper = mount(<WrappedMatchesAAny />);
        var instance = wrapper.instance() as any;//could have exported with an interface for testing
        instance.handleKey(new KeyboardEvent("keypress", { keyCode: 65, key: "A" } as KeyboardEventInit),[]);
        var wrapped = wrapper.find(Wrapped).first() as ReactWrapper<KeyProps, any>;
        var props = wrapped.props();
        expect(props.keyCode).toBe(65);
        expect(props.keyValue).toBe("A");
        
    })
    describe('should pass modifiers enum as props to wrapped', () => {
        pit('none enum', false, false, false, KeyModifiersEnum.none);
        pit('alt enum', true, false, false, KeyModifiersEnum.alt);
        pit('ctrl enum', false, true, false, KeyModifiersEnum.ctrl);
        pit('shift enum', false, false, true, KeyModifiersEnum.shift);
        pit('alt & ctrl enum', true, true, false, KeyModifiersEnum.alt | KeyModifiersEnum.ctrl);
        pit('alt & shift enum', true, false, true, KeyModifiersEnum.alt | KeyModifiersEnum.shift);
        pit('ctrl & shift enum', false, true, true, KeyModifiersEnum.ctrl | KeyModifiersEnum.shift);
        pit('alt & ctrl & shift enum', true, true, true, KeyModifiersEnum.all);
        pits((altKey: boolean, ctrlKey: boolean, shiftKey: boolean, modifiers: KeyModifiersEnum) => {
            var wrapper = mount(<WrappedMatchesAAny />);
            var instance = wrapper.instance() as any;
            instance.handleKey(new KeyboardEvent("keypress", { keyCode: 65, key: "A", altKey: altKey, ctrlKey: ctrlKey, shiftKey: shiftKey } as KeyboardEventInit), []);
            var wrapped = wrapper.find(Wrapped).first() as ReactWrapper<KeyProps, any>;
            expect(wrapped.props().modifiers).toBe(modifiers);
        });
        
    })
    describe('should call all matching callbacks with the KeyboardEvent, keyValue and  modifiers enum', () => {
        it('single match', () => {
            
            ReactDOM.render(<CallbackWrappedMatchesAAnySingle/>,
                document.body);
            triggerKeyEvent("keypress", 65, "A");
            var keyValueElement = document.body.getElementsByClassName('keyValue')[0] as HTMLElement;
            var keyCodeElement = document.body.getElementsByClassName('keyCode')[0] as HTMLElement;
            var keyboardEventPassedElement = document.body.getElementsByClassName('keyboardEventPassed')[0] as HTMLElement;
            var keyCallbackCalledElement = document.body.getElementsByClassName('keyCallbackCalled')[0] as HTMLElement;
            var keyCallbackCalled2Element = document.body.getElementsByClassName('keyCallbackCalled2')[0] as HTMLElement;
            expect(keyValueElement.innerHTML).toBe("A");
            expect(keyCodeElement.innerHTML).toBe("65");
            expect(keyboardEventPassedElement.innerHTML).toBe("true");
            expect(keyCallbackCalledElement.innerHTML).toBe("true");
            expect(keyCallbackCalled2Element.innerHTML).toBe("false");

            
        });
        it('multiple matches', () => {
            ReactDOM.render(<CallbackWrappedMatchesAMultiple />,
                document.body);
            triggerKeyEvent("keypress", 65, "A", true,false,true);
            var keyValueElement = document.body.getElementsByClassName('keyValue')[0] as HTMLElement;
            var keyCodeElement = document.body.getElementsByClassName('keyCode')[0] as HTMLElement;
            var keyboardEventPassedElement = document.body.getElementsByClassName('keyboardEventPassed')[0] as HTMLElement;
            var keyCallbackCalledElement = document.body.getElementsByClassName('keyCallbackCalled')[0] as HTMLElement;
            var keyCallbackCalled2Element = document.body.getElementsByClassName('keyCallbackCalled2')[0] as HTMLElement;
            expect(keyValueElement.innerHTML).toBe("A");
            expect(keyCodeElement.innerHTML).toBe("65");
            expect(keyboardEventPassedElement.innerHTML).toBe("true");
            expect(keyCallbackCalledElement.innerHTML).toBe("true");
            expect(keyCallbackCalled2Element.innerHTML).toBe("true");
        })
    })

})

