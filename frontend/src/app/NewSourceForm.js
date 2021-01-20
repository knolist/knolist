import React from "react";
import {Alert, Button, Form, Input, Modal} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";
//import urlToCitation from "../../../app/main/urlToCitation.py";

class NewSourceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSourceUrlId: "new-source-url",
            loading: false
        }
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
        const {x, y} = this.props.newSourceData;
        const endpoint = "/projects/" + this.props.curProject.id + "/sources"
    
        /*
        const citation = urlToCitation(url);
        const title = citation["title"]
        const author = citation["author"]
        const publishDate = citation["publishDate"]
        const siteName = citation["siteName"]
        const accessDate = citation["accessDate"]
        */

        const body = {
            "url": url,
            "x_position": x,
            "y_position": y,
            /*
            "access_date": accessDate,
            "author": author,
            "published_date": publishDate,
            "site_name": siteName,
            "title": title
            */
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
                        Insert the URL of the source you'd like to add
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.addNewSource}>
                    <Modal.Body>
                        <Input autoFocus type="url" required id={this.state.newSourceUrlId}
                               placeholder="New Source URL"/>
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