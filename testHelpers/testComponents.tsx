import { keyHandler, AndOr, KeyMatchesMethodName, ModKey, keyModifiersAny, ModForKeys, KeyModifiers, KeyModifiersEnum, KeyHandleDecoratorState} from '../lib/key-handler'
import * as React from "react";

export interface KeyProps {
    keyValue: string,
    keyCode: Number,
    modifiers: KeyModifiersEnum
}
export interface CallbackState extends KeyProps {
    keyboardEventPassed: boolean,
    keyCallbackCalled: boolean,
    keyCallback2Called:boolean
}
export class Wrapped extends React.Component<KeyProps & KeyHandleDecoratorState, undefined> {

    render() {
        return <div></div>
    }
}

export class CallbackWrapped extends React.Component<undefined, CallbackState> {
    constructor(props) {
        super(props);
        this.state = { keyCallbackCalled: false, keyCallback2Called: false, keyboardEventPassed: false, keyCode: 0, keyValue: "", modifiers: KeyModifiersEnum.none } as CallbackState;
    }
    keyCallback = (keyboardEvent: KeyboardEvent, keyValue: string, keyCode: number, modifiers: KeyModifiersEnum) => {
        var keyboardEventPassed = false;
        if (keyboardEvent && keyboardEvent instanceof KeyboardEvent) {
            keyboardEventPassed = true;
        }
        this.setState({ keyValue: keyValue, keyCode: keyCode, modifiers: modifiers, keyboardEventPassed: keyboardEventPassed,keyCallbackCalled:true })
    }
    keyCallback2 = (keyboardEvent: KeyboardEvent, keyValue: string, keyCode: number, modifiers: KeyModifiersEnum) => {
        var keyboardEventPassed = false;
        if (keyboardEvent && keyboardEvent instanceof KeyboardEvent) {
            keyboardEventPassed = true;
        }
        this.setState({ keyValue: keyValue, keyCode: keyCode, modifiers: modifiers, keyboardEventPassed: keyboardEventPassed,keyCallback2Called:true })
    }
    
    render() {
        return <div>
            <div className='keyValue'>{this.state.keyValue}</div>
            <div className='keyCode'>{this.state.keyCode}</div>
            <div className='modifiers'>{this.state.modifiers}</div>
            <div className='keyboardEventPassed'>{this.state.keyboardEventPassed.toString()}</div>
            <div className='keyCallbackCalled'>{this.state.keyCallbackCalled.toString()}</div>
            <div className='keyCallbackCalled2'>{this.state.keyCallback2Called.toString()}</div>
        </div>
    }
    
}

export interface OwnProps {
    stringProp:string
}
export class WrappedWithProp extends React.Component<OwnProps & KeyHandleDecoratorState, undefined>{
    render() {
        return <div>{this.props.stringProp}</div>
    }
}

export var expectedAnyKeyMatches = ["A", "B", "C"];
export var AnyModWrapped = keyHandler({ keyEventName: "keypress", keyMatches: expectedAnyKeyMatches })(Wrapped);
export var expectedModForKeysKeyMatches = {
    modifiers: {
        altKey: true,
        andOr: AndOr.Or,
        ctrlKey: true,
        shiftKey: true,
        none: true
    }, keys: ["A", "B", "C"]
}
export var ModForKeysWrapped = keyHandler({
    keyEventName: "keypress", keyMatches: expectedModForKeysKeyMatches
})(Wrapped);
export var expectedArrayModKeysKeyMatches = [{
    modifiers: {
        altKey: false,
        none: true,
        ctrlKey: false,
        shiftKey: false,
        andOr: AndOr.Or
    },
    key: "A"
}, {
    modifiers: {
        altKey: false,
        none: true,
        ctrlKey: false,
        shiftKey: false,
        andOr: AndOr.Or
    },
    key: "B"
}] 
export var ArrayModKeysWrapped = keyHandler({
    keyEventName: "keypress", keyMatches: expectedArrayModKeysKeyMatches })(Wrapped);
//-------------------------------------------------------------------------------------------------------------
var keyMatchesMethodName: KeyMatchesMethodName  = {
    methodName: "abc",
    keyMatches:["A","B","C"] 
}
var keyMatchesMethodName2: KeyMatchesMethodName  = {
    methodName: "def",
    keyMatches: ["D", "E", "F"]
}

var anyMod = keyModifiersAny();
export var expectedKeyMatchesMethodNameSingleAnyKeyMatches: ModKey[] = [
    {
        key: "A",
        modifiers: anyMod,
        id:"abc"
    },
    {
        key: "B",
        modifiers: anyMod,
        id: "abc"
    },
    {
        key: "C",
        modifiers: anyMod,
        id: "abc"
    },
]
var second: ModKey[] = [
    {
        key: "D",
        modifiers: anyMod,
        id: "def"
    },
    {
        key: "E",
        modifiers: anyMod,
        id: "def"
    },
    {
        key: "F",
        modifiers: anyMod,
        id: "def"
    },
]
export var expectedKeyMatchesMethodNameMultipleAnyKeyMatches = expectedKeyMatchesMethodNameSingleAnyKeyMatches.concat(second);//**expected
export var KeyMatchesMethodNameSingleAnyMod = keyHandler({ keyEventName: "keypress", keyMatches: [keyMatchesMethodName] })(Wrapped);
export var KeyMatchesMethodNameMultipleAnyMod = keyHandler({ keyEventName: "keypress", keyMatches: [keyMatchesMethodName, keyMatchesMethodName2] })(Wrapped);

var modForKeysModifiers: KeyModifiers = {
    altKey: true,
    ctrlKey: false,
    shiftKey: false,
    none: false,
    andOr: AndOr.AndLoose
}
var modForKeys: ModForKeys = {
    keys: ["G","H","I"],
    modifiers: modForKeysModifiers
}
var modForKeysMethodName: KeyMatchesMethodName  = {
    methodName: "modForKeys",
    keyMatches:modForKeys
}
export var expectedModForKeysMethodNameKeyMatches: ModKey[] = [{
    id: "modForKeys",
    key: "G",
    modifiers: modForKeysModifiers
    },
    {
        id: "modForKeys",
        key: "H",
        modifiers: modForKeysModifiers
    }, {
        id: "modForKeys",
        key: "I",
        modifiers: modForKeysModifiers
    }]
export var KeyMatchesMethodNameSingleModForKeys = keyHandler({ keyEventName: "keypress", keyMatches: [modForKeysMethodName] })(Wrapped);

var arrayKeyModifiers1: KeyModifiers = {
    altKey: true,
    ctrlKey: true,
    shiftKey: false,
    andOr: AndOr.Or,
    none:false
}
var arrayKeyModifiers2: KeyModifiers={
    altKey: false,
    ctrlKey: false,
    shiftKey: true,
    andOr: AndOr.AndLoose,
    none: false
}
var arrayModKeys: Array<ModKey> = [{
    key: "J",
    modifiers: arrayKeyModifiers1
    },
    {
    key: "K",
    modifiers: arrayKeyModifiers2
}];
var arrayModKeysMethodName: KeyMatchesMethodName = {
    methodName: "arrayModKeys",
    keyMatches: arrayModKeys
}
export var expectedArrayModKeysMethodNameKeyMatches: ModKey[] = [
    {
        key: "J",
        modifiers: arrayKeyModifiers1,
        id:"arrayModKeys"
    },
    {
        key: "K",
        modifiers: arrayKeyModifiers2,
        id:"arrayModKeys"
    }]
export var KeyMatchesMethodNameSingleArrayModKeys = keyHandler({ keyEventName: "keypress", keyMatches: [arrayModKeysMethodName] })(Wrapped);

export var WrappedMatchesAAny = keyHandler({ keyEventName: "keypress", keyMatches: ["A"] })(Wrapped);
export var CallbackWrappedMatchesAAnySingle = keyHandler({ keyEventName: "keypress", keyMatches: [{ methodName: "keyCallback", keyMatches: ["A"] }] })(CallbackWrapped);
export var CallbackWrappedMatchesAMultiple = keyHandler({
    keyEventName: "keypress", keyMatches: [
        {
            methodName: "keyCallback",
            keyMatches: [{
                key: "A",
                modifiers: {
                    altKey: true,
                    shiftKey: true,
                    ctrlKey: false,
                    none: false,
                    andOr: AndOr.AndLoose
                }
            }]
        },
        {
            methodName: "keyCallback2",
            keyMatches: [{
                key: "A",
                modifiers: {
                    altKey: true,
                    shiftKey: true,
                    ctrlKey: true,
                    none: true,
                    andOr: AndOr.Or
                }
            }]
        }
        
    ]
})(CallbackWrapped);

export var WrappedHasOwnProp = keyHandler({ keyEventName: "keypress", keyMatches: ["A"] })(WrappedWithProp);