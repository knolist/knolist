import React, {useState} from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton, Button, Animation, Progress, Input, Form, FormControl, Schema, FormGroup
} from "rsuite";

import {randomPicker} from "../../services/RandomGenerator"

const { Line } = Progress;

const { Slide } = Animation;

// const model = Schema.Model({
//     common: Schema.Types.StringType().isRequired('This field is required')
// });

class FindCommonality extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomSources: this.getRandomSources(),
            numPlayed: 0,
            commonality: [],
            commonId: 'common-Id'
        }
    }
    
    // Randomly select 2 sources
    getRandomSources = () => {
        return randomPicker(this.props.sources, 2);
    }

    updateRandomSources = () => {
        this.setState({
            randomSources: this.getRandomSources(),
        })
    }
    
    submitCommon = () => {
        let textarea = document.getElementById(this.state.commonId);
        // console.log(textarea.value);
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            commonality: [...this.state.commonality, textarea.value],
        }, this.updateRandomSources)
        // Clear text area
        textarea.value = "";
    }

    render() {
        console.log(this.state)
        if (this.state.numPlayed < 5)
            return (
                <>
                    <h1>What comes to mind?</h1>
                        <h3>Round {this.state.numPlayed + 1}</h3>
                        <Line percent={this.state.numPlayed / 5 * 100} status='active' />
                        <h5>What is the commonality between the following?</h5>
                        {this.state.randomSources.map((source, index) =>
                            <Button block key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block'}}>{source.title}</Button>)}
                    <Form onSubmit={this.submitCommon}>
                        <Input autoFocus type="text" required componentClass="textarea" id={this.state.commonId}
                        rows={5} placeholder="Write your thoughts here..."/>
                        <Button appearance="primary" color='blue' 
                        style={{margin: 20, display: 'block'}} 
                        type='submit'>Next</Button>
                    </Form>
                </>          
            )
            else {
                return (
                    <>
                    <h1>What comes to mind?</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are the common themes you have identified:</h5>
                    <ul>
                        {this.state.commonality.map((common, index) => <li key={index}>{common}</li>)}
                    </ul>

                    {/* {this.state.selectedSources.map((source, index) =>
                        <Button block key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block'}}>{source.title}</Button>)} */}
                </>
            )
        }
    }
}

export default FindCommonality;
