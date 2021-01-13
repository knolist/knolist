import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton, Button
} from "rsuite";

class OddOnesOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            RandomSources: this.getRandomSources(),
            numPlayed: 0,
            selectedSources: []
        }
    }
    
    // Randomly select 4 sources
    getRandomSources = () => {
        // Shuffle array
        const sources = this.props.sources;
        for (let i = sources.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sources[i], sources[j]] = [sources[j], sources[i]]
        }

        // Get subarray of first 4 sources
        return sources.slice(0, 4);
        
    }

    updateRandomSources = () => {
        this.setState({
            RandomSources: this.getRandomSources()
        })
    }
    
    chooseSource = (source) => {
        // console.log(source)
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            selectedSources: [...this.state.selectedSources, source]
        })
        // console.log(this.state.selectedSources)
        // console.log(this.state.numPlayed)
        this.updateRandomSources()
    }

    render() {
        console.log(this.state)
        if (this.state.numPlayed < 5)
            return (
                <>
                <h1>OddOnesOut</h1>
                    <h5>Select the odd one out!</h5>
                    
                    {this.state.RandomSources.map((source, index) => 
                    <Button key={index} appearance="primary" color='blue' style={{margin: 20, display: 'block'}} onClick={() => this.chooseSource(source)}>{source.title}</Button>)}
                {/* <ul>
                    {this.state.RandomSources.map((source, index) => <li key={index}>{source.title},{source.url}</li>)}
                </ul> */}
                </>          
            )
        else {
            return (
                <>
                    <h1>OddOnesOut</h1>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are your selected sources:</h5>

                    {this.state.selectedSources.map((source, index) =>
                        <Button key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block' }}>{source.title}</Button>)}
                </>
            )
        }
    }
}

export default OddOnesOut;
