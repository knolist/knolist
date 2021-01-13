import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Import all minigames
import OddOnesOut from "./minigames/OddOnesOut"
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
        this.state = {
            games: [<OddOnesOut />, <MiniGames2 />, <MiniGames3 />, <MiniGames4 />, <MiniGames5 />],
            // newSourceUrlId: "new-source-url",
            loading: false,
            selectedGame: null
        }
    }
    //     // TODO: make backend endpoint to return the filter categories
    //     // const filterCategories = [
    //     //     "Page Content",
    //     //     "URL",
    //     //     "Title",
    //     //     "Next Connections",
    //     //     "Previous Connections",
    //     //     "Highlights",
    //     //     "Notes"
    //     // ]
    //     // this.state = {
    //     //     indeterminate: false,
    //     //     checkAll: true,
    //     //     value: filterCategories,
    //     //     filterCategories: filterCategories
    //     // };
    // }

    // if (!this.props.showNewSourceForm) return null;

    // return (
    //     <Modal show onHide={this.close}>
    //         <Modal.Header>
    //             <Modal.Title>
    //                 Insert the URL of the source you'd like to add
    //             </Modal.Title>
    //         </Modal.Header>
    //         <Form onSubmit={this.addNewSource}>
    //             <Modal.Body>
    //                 <Input autoFocus type="url" required id={this.state.newSourceUrlId}
    //                     placeholder="New Source URL" />
    //             </Modal.Body>
    //             <Modal.Footer>
    //                 <Button type="submit" loading={this.state.loading} appearance="primary">
    //                     Add Source
    //                 </Button>
    //             </Modal.Footer>
    //         </Form>
    //     </Modal>
    // );
    randomizer = () => {
        this.setState({
            // clicked: true,
            selectedGame: this.state.games[Math.floor(Math.random() *
                this.state.games.length)]
        })
    }

    
    // See if need to be be modified like above?
    setShowGame = (clicked) => {
        // Keeps track if Game Generation Button clicked and Window should open
        if (this.props.network) { // Check that the network exists
            this.setState({
                showGame: clicked
            });
            console.log('Show Game should be shown?')
            console.log(this.state.showGame)
        }
    }
    
    handleClick = () => {
        this.setShowGame(true);
        this.randomizer();
        console.log(this.state.selectedGame)
    }

    render() {

        console.log(this.state.showGame)

        return (
            <>
            <GameWindow showGame={this.state.showGame} setShowGame={this.setShowGame} sources={this.props.sources} 
            selectedGame={this.state.selectedGame}/>
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Mini Games</Tooltip>}
                placement="topEnd">
                <IconButton appearance="primary" icon={<Icon icon="gamepad" />} circle
                    size="lg" onClick={this.handleClick}
                    // size="lg" onClick={() => this.props.setShowGame(true)}
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
