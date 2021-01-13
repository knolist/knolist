import React from "react";
import {
    Modal
} from "rsuite";

class GameWindow extends React.Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.sources === null) return null;
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
                </Modal.Body>
            </Modal>
        );
    }
}

export default GameWindow;