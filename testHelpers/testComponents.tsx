import {keyHandler} from '../lib/key-handler'
import * as React from "react";

interface WrappedKeyValueCode {
    keyValue: string,
    keyCode:Number
}
class Wrapped extends React.Component<WrappedKeyValueCode, undefined> {

    render() {
        return <div>
            <div className='keyValue'>{this.props.keyValue}</div>
            <div className='keyCode'>{this.props.keyCode}</div>
        </div>
    }
}

class CallbackWrapped extends React.Component<undefined, WrappedKeyValueCode> {
    keyCallback = (keyValue: string,keyCode:number) => {
        this.setState({keyValue:keyValue,keyCode:keyCode})
    }
    render() {
        return <div>
            <div className='keyValue'>{this.state.keyValue}</div>
            <div className='keyCode'>{this.state.keyCode}</div>
        </div>
    }
}

export var WrappedTest = keyHandler({ keyEventName: "keypress", keyValues: ['A,', 'B'], keyCodes:[48,49] })(Wrapped);
export var CallbackWrappedTest = keyHandler({ keyEventName: "keypress", keyValues: ['A,', 'B'], keyCodes: [48,49] })(Wrapped);