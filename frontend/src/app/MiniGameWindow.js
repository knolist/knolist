import React from "react";
import {
    Modal
} from "rsuite";

class GameWindow extends React.Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props)

        // this.state = {
        //     games: [<OddOnesOut/>, <MiniGames2/>, <MiniGames3/>, <MiniGames4/>, <MiniGames5/>],
        //     selectedGame: null
        // }
    }

    render() {
        if (this.props.sources === null) return null;
        // this.randomizer();
        // console.log(this.state.selectedGame)
        return (
            <Modal full show={this.props.showGame} onHide={() => this.props.setShowGame(false)}>
                <Modal.Header>
                    <Modal.Title>
                        MiniGames
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <> {this.props.selectedGame}</>
                    <ul>
                        {this.props.sources.map((source, index) => <li key={index}>{source.title},{source.url}</li>)}
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

export default GameWindow;