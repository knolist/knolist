import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Import all minigames
import OddOnesOut from "./minigames/OddOnesOut"
import FindCommonality from "./minigames/FindCommonality"
import MakePairs from "./minigames/MakePairs"
import MiniGames2 from "./minigames/minigame2"
import MiniGames3 from "./minigames/minigame3"
import MiniGames4 from "./minigames/minigame4"
import MiniGames5 from "./minigames/minigame5"

// Import Game window
import GameWindow from "./MiniGameWindow"

// Primarily pulled from app header

class MiniGames extends React.Component {
    constructor(props) {
        super(props);
        // Cannot define the games as a state here due to lack of update
        this.state = {
            loading: false,
            selectedGame: null,
            numRounds: 5
        }
    }

    randomizer = () => {
        this.setState({
            selectedGame: this.state.games[Math.floor(Math.random() *
                this.state.games.length)],
            numRounds: Math.ceil(Math.random() * 6)
        })
    }

    updateGames= () => {
        console.log("num sources", this.props.sources.length);
        const validGames = [];
        // Have different length boundaries for different games
        if (this.props.sources.length > 4) { 
            validGames.push(<MakePairs sources={this.props.sources} numRounds={this.state.numRounds}/>);
        }
        // Games need to be loaded here to have the most recent sources, randomizer needs to be called after the games is updated
        this.setState({
            // games: [<FindCommonality sources={this.props.sources} />, <OddOnesOut sources={this.props.sources} />] // For testing Find Commonality specifically
            // games: [<OddOnesOut sources={this.props.sources} />] // For testing OddOnesOut specifically
            games: validGames
            // games: [<OddOnesOut sources={this.props.sources} />, <MiniGames2 />, <MiniGames3 />, <MiniGames4 />, <MiniGames5 />],
        },
        this.randomizer)
    }

    setShowGame = (clicked) => {
        // Keeps track if Game Generation Button clicked and Window should open
        if (this.props.network) { // Check that the network exists
            this.setState({
                showGame: clicked
            });
        }
    }
    
    handleClick = () => {
        this.setShowGame(true);
        this.updateGames();
        // console.log(this.state.selectedGame)
        // console.log(this.state.games)
        // console.log(this.props.sources)
    }

    render() {

        return (
            <>
            <GameWindow showGame={this.state.showGame} 
            setShowGame={this.setShowGame} sources={this.props.sources} 
            selectedGame={this.state.selectedGame}/>
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Mini Games</Tooltip>}
                placement="topEnd">
                <IconButton appearance="primary" icon={<Icon icon="gamepad" />} circle
                    size="lg" onClick={this.handleClick}
                    style={{
                        top: '50%',
                        position: "absolute",
                        right: 5,
                        zIndex: 1
                    }} />
            </Whisper>
            </>
        );
    }
}

export default MiniGames;
