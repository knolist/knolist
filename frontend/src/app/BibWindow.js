import React from "react";
import {
    Modal
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceInfo: null,
            randomNode: 1
        }
    }

    render() {
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header>
                    <Modal.Title>
                    Bibliography
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        <li>Citation</li>
                        <li>Citation</li>
                        {this.props.sources.map((source,index) => <li key={index}>{source.title},{source.url}</li>)}
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;