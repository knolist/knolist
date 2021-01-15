import React from "react";
import {Alert, Button, Form, Input, Modal} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class NewSourceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSourceUrlId: "new-source-url",
            newSourceNotesId: "new-source-notes",
            loading: false
        };
    }
    close = () => {
        this.props.switchShowNewSourceForm()
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    addNewSource = () => {
        this.setLoading(true);
        let url;
        if (!this.props.source) {
            url = document.getElementById(this.state.newSourceUrlId).value;
            if (url === "") {
                url = null;
            }
        } else {
            url = this.props.source;
        }
        let content;
        if (this.props.inputType === "Note") {
            content = document.getElementById(this.state.newSourceNotesId).value;
        } else {
            content = null;
        }
        const {x, y} = this.props.newSourceData;
        const endpoint = "/items";
        const body = {
            "url": url,
            "content": content,
            "x_position": x,
            "y_position": y,
            "project_id": this.props.curProject.id,
        }

        makeHttpRequest(endpoint, "POST", body).then((response) => {
            if (response.status === 200) {
                // Alert that the source already exists in this project
                Alert.info('This URL already exists in this project.');
            } else if (response.status === 201) {
                // Update sources
                this.props.renderNetwork();
                Alert.success('Source added successfully.');
            }
            this.props.switchShowNewSourceForm();
        });

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showNewSourceForm !== this.props.showNewSourceForm && this.props.showNewSourceForm) {
            this.setLoading(false);
        }
    }

    render() {
        if (!this.props.showNewSourceForm) return null;
        console.log(this.props.source);
        let body;
        if (this.props.inputType === "URL") {
            // New URL
            body =
                <Input autoFocus required type="URL" id={this.state.newSourceUrlId} placeholder="Add URL"/>;
        } else if (this.props.inputType === "Note" && this.props.source) {
            // New note created from a source node
            body = 
                <Input autoFocus type={"Note"} required id={this.state.newSourceNotesId}
                    placeholder="Add Note" componentClass="textarea" rows={30}/>;
        } else if (this.props.inputType === "Note" && !this.props.source) {
            // New note without a source passed in
            body = 
                <div>
                    <Input autoFocus type="URL" id={this.state.newSourceUrlId} placeholder="Add optional URL"/>
                    <Input type={"Note"} required id={this.state.newSourceNotesId}
                        placeholder="Add Note" componentClass="textarea" rows={30}/>
                </div>;
        }

        return (
            <Modal show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        Insert the {this.props.inputType} you'd like to add.
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.addNewSource}>
                    <Modal.Body>
                        {body}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={this.state.loading} appearance="primary">
                            Add Source
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default NewSourceForm;