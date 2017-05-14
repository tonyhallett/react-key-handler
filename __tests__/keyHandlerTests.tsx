///<reference types="jest"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom'
import { mount, shallow, ReactWrapper } from 'enzyme';
import { xpit, pit, pits } from '../node_modules/jestextensions/index'
import { KeyHandler, KeyHandlerProps, keyHandler } from '../lib/key-handler'
import { WrappedTest, CallbackWrappedTest } from '../testHelpers/testComponents'

//why is the typescript definition file not a string union type ( instead of string )
function triggerKeyEvent(eventName, keyCode, keyValue = undefined) {
    //const event = new window.KeyboardEvent(eventName, { keyCode, key: keyValue });
    //document.dispatchEvent(event);

    //**********code:keyCode does not work !!!!! it appears that jsdom is using deprecated keyCode instead
    document.dispatchEvent(new KeyboardEvent(eventName, { keyCode: keyCode, key: keyValue } as KeyboardEventInit));
    
}
var handler = jest.fn();
//remember not to be null and undefined !
xdescribe('<KeyHandler/>', () => {
    beforeEach(() => {
        handler.mockReset();//might be mock clear
    })
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
    it('should handle multiple keycodes and keypresses', () => {
        //backspace and tab - want the keyCodes and keyValues to not be the same items
        var keyCodes = [8, 9];
        var keyValues = ["a", "b", "c"];
        //if do not want to specify the modifiers and be all then ["a","b"] will be sufficient
        //if want a modifier to apply to all then
        //{modifiers:'',keys:[]}
        //otherwise {modifier:'mod',key:''}

        //have to consider from the hoc to make life easier for mapping



        ReactDOM.render(<KeyHandler keyEventName="keypress" keyCodes={keyCodes} keyValues={keyValues} onKeyHandle={handler} />,
            document.body);
        keyCodes.forEach(keyCode => {
            triggerKeyEvent("keypress", keyCode);
        });
        triggerKeyEvent("keypress", 10);
        keyValues.forEach(keyValue => {
            triggerKeyEvent("keypress", null, keyValue);
        });
        //will get more precise but for now
        expect(handler).toHaveBeenCalledTimes(5);
    })
});

describe('keyHandler hoc', () => {
    describe('when no callback specified', () => {
        describe('should pass keyCode and keyValue to wrapped when key matching keyValues keyCodes', () => {
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

