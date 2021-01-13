import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Primarily pulled from app header

class OddOnesOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // newSourceUrlId: "new-source-url",
            loading: false
        }
    }
    render() {
        console.log(this.props)
        return (
            <>
            <h1>OddOnesOut</h1>
            <ul>
                {this.props.sources.map((source, index) => <li key={index}>{source.title},{source.url}</li>)}
            </ul>
            </>          
        );
    }
}

export default OddOnesOut;

