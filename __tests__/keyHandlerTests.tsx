///<reference types="jest"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom'
import { mount, shallow, ReactWrapper } from 'enzyme';
import { xpit, pit, pits, xpits } from '../node_modules/jestextensions/index'
import { KeyHandler, KeyHandlerProps, keyHandler, KeyModifiers, keyModifiersAny, ModKey, AndOr } from '../lib/key-handler'
import { WrappedTest, CallbackWrappedTest } from '../testHelpers/testComponents'

//why is the typescript definition file not a string union type ( instead of string )
function triggerKeyEvent(eventName, keyCode, keyValue = undefined, altKey=false,ctrlKey=false,shiftKey=false) {
    //const event = new window.KeyboardEvent(eventName, { keyCode, key: keyValue });
    //document.dispatchEvent(event);

    //**********code:keyCode does not work !!!!! it appears that jsdom is using deprecated keyCode instead
    document.dispatchEvent(new KeyboardEvent(eventName, { keyCode: keyCode, key: keyValue, altKey: altKey, ctrlKey:ctrlKey,shiftKey:shiftKey } as KeyboardEventInit));
    
}
var handler = jest.fn();
//remember not to be null and undefined !
describe('<KeyHandler/>', () => {
    beforeEach(() => {
        handler.mockReset();//might be mock clear
    })
    describe('when matches should callback with the KeyboardEvent', () => {

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

    //when matched should callback with the event*****************
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
        describe('specified for all', () => {
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
            var matchIdModKeys: Array<ModKey> = [{
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

            it('should return the id of the matched', () => {
                ReactDOM.render(<KeyHandler keyEventName="keypress" keyMatches={matchIdModKeys} onKeyHandle={handler} />,
                    document.body);
                triggerKeyEvent("keypress", null, "A", true, false, false);
                expect(handler.mock.calls[0][1]).toBe(modKeyId);

            });
            //MAJOR FUCK UP ? - THE WAY THAT HAVE IT AT THE MOMENT THERE COULD BE MULTIPLE THAT MATCH
            //THEN SHOULD RETURN THE CALLBACKS FOR ALL 

            pit('when or and none is false, must match  ')
            //note that have not tested none false with or
            xpits((triggerKey: string, modKeys:Array<ModKey>, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, expectMatched: boolean) => {
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
        
        //care that will exit loop as soon as finds one - implications will be for the set up from the hoc
    });
    xdescribe('should pass the event and id if makes sense', () => {

    });
    
});

xdescribe('keyHandler hoc', () => {
    xdescribe('when no callback specified', () => {
        //HAVE TO CHANGE _ NO MORE KEYVALUES?KEYCODES
        xdescribe('should pass keyCode and keyValue to wrapped when key matching keyValues keyCodes', () => {
            //do I get a fresh dom on each it ?
            pit('match 0', 48, "0", true);
            pit('match 1', 49, "1", true);
            pit('no match 2', 50, "2", false);
            pit('match A', 65, "A", true);
            pit('match B', 66, "B", true);
            pit('no match C',67 , "C", false);
            pits((keyCode: number, keyValue: string, expectedMatch:true) => {
                ReactDOM.render(<WrappedTest />,
                    document.body);
                triggerKeyEvent("keypress", keyCode, keyValue);
                var keyCodeElement = document.body.getElementsByClassName('keyCode')[0] as HTMLElement;
                var keyValueElement = document.body.getElementsByClassName('keyValue')[0] as HTMLElement;
                var expectedKeyCodeInnerText = expectedMatch ? keyCode.toString() : "";
                var expectedKeyValueInnerText = expectedMatch ? keyValue.toString() : "";
            })           
        })
    });
    xdescribe('when specifying a callback', () => {
        it('should call it when any matching key and event type', () => {

        });
        it('should not call it when not matching key and event type', () => {

        })
    });
})

