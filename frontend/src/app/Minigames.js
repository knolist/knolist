import React from 'react';
import {
    Tooltip, Whisper, Icon, IconButton
} from "rsuite";

// Import all minigames
import OddOnesOut from "./minigames/OddOnesOut";
import FindCommonality from "./minigames/FindCommonality";
import MakePairs from "./minigames/MakePairs";

// Import Game window
import GameWindow from "./MiniGameWindow"

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

    updateGames = () => {
        console.log("num items", this.props.items.length);
        const validGames = [];
        // Have different length boundaries for different games
        const customProps = {
            items: this.props.items,
            numRounds: this.state.numRounds,
            generateDisplayValue: this.props.generateDisplayValue,
            color: this.props.color
        }
        validGames.push(<OddOnesOut {...customProps}/>);
        validGames.push(<FindCommonality {...customProps}/>);
        if (this.props.items.length > 4) {
            validGames.push(<MakePairs {...customProps}/>);
        }
        // Games need to be loaded here to have the most recent items, randomizer needs to be called after the games is updated
        this.setState({games: validGames}, this.randomizer)
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
    }

    render() {
        return (
            <>
                <GameWindow showGame={this.state.showGame}
                            setShowGame={this.setShowGame} items={this.props.items}
                            selectedGame={this.state.selectedGame}/>
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Minigames</Tooltip>}
                         placement="topEnd">
                    <IconButton appearance="primary" icon={<Icon icon="gamepad"/>} circle
                                size="lg" onClick={this.handleClick}
                                style={{
                                    top: '50%',
                                    position: "absolute",
                                    right: 5,
                                    zIndex: 1
                                }}/>
                </Whisper>
            </>
        );
    }
}

export default MiniGames;