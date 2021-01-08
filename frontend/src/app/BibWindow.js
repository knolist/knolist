import React from "react";
import {
    Alert,  Loader, Modal
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";
import SourceTitle from "./SourceView"

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceInfo: null
        }
    }

    getCitation = async () => {
        const endpoint = "/sources/";
        const response = await makeHttpRequest(endpoint);
        this.setState({sourceInfo: response.body.source});
    }

    render() {
        const source = this.state.sourceInfo;
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
                        {/*<li>
                            <Citation source={source} getCitation={this.getCitation}/>
                        </li>*/}
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }
}

class Citation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // editMode: false,
            // loading: false,
            newSourceTitleInputId: "new-source-title-input"
        }
    }

    // setLoading = (val) => {
    //     this.setState({loading: val});
    // }

    updateTitle = (callback) => {
        const newTitle = document.getElementById(this.state.newSourceTitleInputId).value;
        // if (newTitle === this.props.source.title) {
        //     callback();
        //     return;
        // }
        // this.setLoading(true);
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "title": newTitle
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.renderNetwork(() => {
                this.props.getCitation().then(() => {
                    this.setLoading(false);
                    callback();
                });
            });
        });
    }

    // setEditMode = (val) => {
    //     if (!val) {
    //         this.updateTitle(() => this.setState({editMode: val}));
    //     } else {
    //         this.setState({editMode: val});
    //     }
    // }

    render() {
        return (
            <div style={{display: "flex"}}>
                <a target="_blank" rel="noopener noreferrer" style={{marginRight: 10}} href={this.props.source.url}>{this.props.source.title}</a>
            </div>
        );
    }
}

export default BibWindow;