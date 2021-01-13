import React from "react";
import {
    Modal
} from "rsuite";

class GameWindow extends React.Component {

    render() {
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showGame} onHide={() => this.props.setShowGame(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Game liography
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        <li>Citation</li>
                        <li>Citation</li>
                        {this.props.sources.map((source, index) => <li key={index}>{source.title},{source.url}</li>)}
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

export default GameWindow;