import React from 'react';
import {
    Button, Progress, Grid
} from "rsuite";

import {randomPicker} from "../../services/RandomGenerator"

const {Line} = Progress;

class OddOnesOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomItems: this.getRandomItems(),
            numPlayed: 0,
            selectedItems: [],
            // placement: 'right',
            show: true
        }
    }

    // Randomly select 4 items
    getRandomItems = () => {
        return randomPicker(this.props.items, 4);
    }

    updateRandomItems = () => {
        this.setState({
            randomItems: this.getRandomItems(),
            // placement: 'right' // need to reset
            show: !this.state.show
            // show: false
        })
        console.log('show is false')
        console.log(this.state.show)
    }

    chooseItem = (item) => {
        // console.log(item)
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            selectedItems: [...this.state.selectedItems, item],
            // placement: 'left',
            show: !this.state.show
            // show: true
        }, this.updateRandomItems)
        // console.log(this.state.selectedItems)
        // console.log(this.state.numPlayed)
        console.log('animation should show')
        console.log(this.state.show)
    }

    render() {
        // console.log(this.state)
        if (this.state.numPlayed < this.props.numRounds) {
            return (
                <Grid>
                    <h1>OddOnesOut</h1>
                    <h3>Round {this.state.numPlayed + 1}</h3>
                    <Line percent={this.state.numPlayed / 5 * 100} status='active'/>
                    <h5>Select the odd one out!</h5>

                    {/* Need to figure out how to make animation persist? Disappear and then reappear? */}

                    {/* <AnimatedButton item='test' index='test2'
                        show={this.state.show} 
                        placement={this.state.placement} 
                        chooseItem= {this.chooseItem}
                        ></AnimatedButton> */}
                    {/* {this.state.RandomItems.map((item, index) =>
                        <AnimatedButton item={item} index={index}/>)} */}

                    {this.state.randomItems.map((item, index) => {
                        console.log(this.props.color(item));
                        return (
                            <Button block key={index} appearance="primary" color={this.props.color(item)}
                                style={{margin: 20, display: 'block'}}
                                onClick={() => this.chooseItem(item)}>{this.props.generateDisplayValue(item)}</Button>)}
                        )
                        
                    }
                        

                    {/* <ul>
                    {this.state.RandomItems.map((item, index) => <li key={index}>{item.title},{item.url}</li>)}
                </ul> */}
                </Grid>
            )           
        } else {
            return (
                <>
                    <h1>OddOnesOut</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are your selected items:</h5>

                    {this.state.selectedItems.map((item, index) =>
                        <Button block key={index} appearance="primary" color={item.color}
                                style={{margin: 20, display: 'block'}}>{this.props.generateDisplayValue(item)}</Button>)}
                </>
            )
        }
    }
}

export default OddOnesOut;
