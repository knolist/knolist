import React from 'react';
import {
    Button, Progress, Input, Form, Grid, Row
} from "rsuite";
// import FlexboxGridItem from 'rsuite/lib/FlexboxGrid/FlexboxGridItem';

import {randomPicker} from "../../services/RandomGenerator"

const {Line} = Progress;

class FindCommonality extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomItems: this.getRandomItems(),
            numPlayed: 0,
            commonality: [],
            commonId: 'common-Id'
        }
    }

    // Randomly select 2 items
    getRandomItems = () => {
        return randomPicker(this.props.items, 2);
    }

    updateRandomItems = () => {
        this.setState({
            randomItems: this.getRandomItems(),
        })
    }

    submitCommon = () => {
        let textarea = document.getElementById(this.state.commonId);
        // console.log(textarea.value);
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            commonality: [...this.state.commonality, textarea.value],
        }, this.updateRandomItems)
        // Clear text area
        textarea.value = "";
    }

    render() {
        if (this.state.numPlayed < this.props.numRounds)
            return (
                <>
                                    
                    <Grid>
                        <Row>
                            <h1>What comes to mind?</h1>
                            <h3>Round {this.state.numPlayed + 1}</h3>
                        </Row>
                        <Row>
                            <Line percent={this.state.numPlayed / 5 * 100} status='active'/>
                        </Row>
                        <Row style={{marginTop: "10px"}}>
                            <h5>What is the commonality between the following?</h5>
                        </Row>
                        {this.state.randomItems.map((item, index) =>
                            <Row style={{marginTop: "20px"}}>
                                <Button block key={index} appearance="primary" color='blue'
                                        style={{display: 'block'}}>{this.props.generateDisplayValue(item)}</Button>
                            </Row>
                            )}
                        <Row style={{marginTop: "20px"}}>                            
                            <Form onSubmit={this.submitCommon}>
                                <Input autoFocus type="text" required componentClass="textarea" id={this.state.commonId}
                                    rows={5} placeholder="Write your thoughts here..."/>
                                <Button appearance="primary" color='blue'
                                        style={{display: 'block', marginTop: "20px"}}
                                        type='submit'>Next</Button>

                            </Form>
                        </Row>  
                    </Grid>
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

                    {/* {this.state.selectedItems.map((item, index) =>
                        <Button block key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block'}}>{item.title}</Button>)} */}
                </>
            )
        }
    }
}

export default FindCommonality;
