import React, {useState} from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton, Button, Animation, Progress
} from "rsuite";

import {randomPicker} from "../../services/RandomGenerator"

const { Line } = Progress;

const { Slide, Fade } = Animation;

// Try and use hooks?
// const AnimatedButton = ({ source, index }) => (
//     <Slide in={this.state.show} placement={this.state.placement}>
//         <Button block key={index} appearance="primary" color='blue' style={{margin: 20, display: 'block'}} onClick={() => this.chooseSource(source)}>{source.title}</Button>
//     </Slide>
// );
// Button that slides when clicked
class AnimatedButton extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         RandomSources: this.getRandomSources(),
    //         numPlayed: 0,
    //         selectedSources: [],
    //         placement: 'right',
    //         show: true
    //     }
    // }

    render() {
        // console.log(this.props)
        return (
       <Fade in={this.props.show} timeout={300}>
           <Button block key={this.props.index} appearance="primary" color='blue' style={{margin: 20, display: 'block'}} 
           onClick={() => this.props.chooseSource(this.props.source)}>{this.props.source.title}</Button>
       </Fade>
    //    <Slide in={this.props.show} placement={this.props.placement}>
    //        <Button block key={this.props.index} appearance="primary" color='blue' style={{margin: 20, display: 'block'}} 
    //        onClick={() => this.props.chooseSource(this.props.source)}>{this.props.source.title}</Button>
    //    </Slide>
        )
    }

}

class OddOnesOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomSources: this.getRandomSources(),
            numPlayed: 0,
            selectedSources: [],
            // placement: 'right',
            show: true
        }
    }
    
    // Randomly select 4 sources
    getRandomSources = () => {
        return randomPicker(this.props.sources, 4);
    }

    updateRandomSources = () => {
        this.setState({
            randomSources: this.getRandomSources(),
            // placement: 'right' // need to reset
            show: !this.state.show
            // show: false
        })
        console.log('show is false')
        console.log(this.state.show)
    }
    
    chooseSource = (source) => {
        // console.log(source)
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            selectedSources: [...this.state.selectedSources, source],
            // placement: 'left',
            show: !this.state.show
            // show: true
        }, this.updateRandomSources)
        // console.log(this.state.selectedSources)
        // console.log(this.state.numPlayed)
        console.log('animation should show')
        console.log(this.state.show)
        
    }

    render() {
        // console.log(this.state)
        if (this.state.numPlayed < 5)
            return (
                <>
                    <h1>OddOnesOut</h1>
                        <h3>Round {this.state.numPlayed + 1}</h3>
                        <Line percent={this.state.numPlayed / 5 * 100} status='active' />
                        <h5>Select the odd one out!</h5>

                        {/* Need to figure out how to make animation persist? Disappear and then reappear? */}

                        {/* <AnimatedButton source='test' index='test2' 
                        show={this.state.show} 
                        placement={this.state.placement} 
                        chooseSource= {this.chooseSource}
                        ></AnimatedButton> */}
                        {/* {this.state.RandomSources.map((source, index) => 
                        <AnimatedButton source={source} index={index}/>)} */}
                            
                        {this.state.randomSources.map((source, index) => 
                        <Button block key={index} appearance="primary" color='blue' style={{margin: 20, display: 'block'}} onClick={() => this.chooseSource(source)}>{source.title}</Button>)}
                    
                {/* <ul>
                    {this.state.RandomSources.map((source, index) => <li key={index}>{source.title},{source.url}</li>)}
                </ul> */}
                </>          
            )
            else {
                return (
                    <>
                    <h1>OddOnesOut</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are your selected sources:</h5>

                    {this.state.selectedSources.map((source, index) =>
                        <Button block key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block'}}>{source.title}</Button>)}
                </>
            )
        }
    }
}

export default OddOnesOut;
