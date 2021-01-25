import React from "react";
import {
    Modal
} from "rsuite";

class GameWindow extends React.Component {
    render() {
        // TODO: Not checking if undefined? Does not work on empty projects?
        if (this.props.sources === null) return null;
        
        // console.log(this.state.selectedGame)
        return (
            <div id='GameWindow'>
            <Modal full show={this.props.showGame} onHide={() => this.props.setShowGame(false)}>
                <Modal.Header>
                    <Modal.Title>
                        MiniGames
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.selectedGame}
                </Modal.Body>
            </Modal>
            </div>
        );
    }
}

export default GameWindow;