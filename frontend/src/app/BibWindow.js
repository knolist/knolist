import React from "react";
import {
    Alert,  Loader, Modal
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {

    render() {
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header>
                    <Modal.Title>
                    Bibliography
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* TODO: this is where source/citation interactions would be*/}
                    <ul>
                        <li>Citation</li>
                        <li>Citation</li>
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;