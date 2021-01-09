import React from "react";
import {
    Modal
} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceInfo: null,
            randomNode: 1
        }
    }

    // getCitation = async () => {
    //     // const endpoint = "/sources/" + this.props.selectedNode;
    //     const endpoint = "/sources/" + this.randomNode;
    //     const response = await makeHttpRequest(endpoint);
    //     this.setState({sourceInfo: response.body.source});
    // }
    // 

    render() {
        const source = this.state.sourceInfo;
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

// class Citation extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             newSourceTitleInputId: "new-source-title-input"
//         }
//     }

//     updateTitle = (callback) => {
//         const newTitle = document.getElementById(this.state.newSourceTitleInputId).value;
//         if (newTitle === this.props.source.title) {
//             callback();
//             return;
//         }
//         const endpoint = "/sources/" + this.props.source.id;
//         const body = {
//             "title": newTitle
//         }

//         makeHttpRequest(endpoint, "PATCH", body).then(() => {
//             this.props.renderNetwork(() => {
//                 this.props.getSourceDetails().then(() => {
//                     this.setLoading(false);
//                     callback();
//                 });
//             });
//         });
//     }

//     renderTitle = () => {
//         return <a target="_blank" rel="noopener noreferrer" style={{marginRight: 10}}>href={this.props.source.url}</a>
//     }

//     render() {
//         return (
//             <div style={{display: "flex"}}>
//                 {this.renderTitle()}
//             </div>
//         );
//     }
// }

export default BibWindow;