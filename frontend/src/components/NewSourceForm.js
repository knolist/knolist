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
        const url = document.getElementById(this.state.newSourceUrlId).value;
        const content = "This is a note lol";
        const {x, y} = this.props.newSourceData;
        const endpoint = "/projects/" + this.props.curProject.id + "/sources"
        const body = {
            "url": url,
            "content":content,
            "x_position": x,
            "y_position": y
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
        
        return (
            <Modal show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        Insert the {this.props.inputType} you'd like to add.
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.addNewSource}>
                    <Modal.Body>
                        <Input autoFocus required={this.props.inputType === "URL"} type="URL" id={this.state.newSourceUrlId} placeholder="Add URL"/>
                        {
                            (this.props.inputType === "Note") &&
                            <Input type={"Note"} required id={this.state.newSourceNotesId}
                                placeholder="Add Note" componentClass="textarea" rows={30}/>
                        }
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