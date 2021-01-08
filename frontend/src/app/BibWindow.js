import React from "react";
import {
    Modal
} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         sourceInfo: null,
    //         randomNode: 1
    //     }
    // }

    // getCitation = async () => {
    //     // const endpoint = "/sources/" + this.props.selectedNode;
    //     const endpoint = "/sources/" + this.randomNode;
    //     const response = await makeHttpRequest(endpoint);
    //     this.setState({sourceInfo: response.body.source});
    // }

    render() {
        // const source = this.state.sourceInfo;
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
                        <li>
                            {/*<a source={source} getCitation={this.getCitation}>{source}</a>*/}
                        </li>
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;