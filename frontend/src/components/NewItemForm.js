import React from "react";
import {Alert, Button, Form, Input, Modal} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class NewItemForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newItemUrlId: "new-item-url",
            newItemNotesId: "new-item-notes",
            loading: false
        };
    }

    close = () => {
        this.props.switchShowNewItemForm()
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    addNewItem = () => {
        this.setLoading(true);
        let url;
        if (!this.props.item) {
            url = document.getElementById(this.state.newItemUrlId).value;
            if (url === "") {
                url = null;
            }
        } else {
            url = this.props.item;
        }
        let content;
        if (this.props.inputType === "Note") {
            content = document.getElementById(this.state.newItemNotesId).value;
        } else {
            content = null;
        }
        const {x, y} = this.props.newItemData;
        const endpoint = "/items";
        const body = {
            "url": url,
            "content": content,
            "x_position": x,
            "y_position": y,
            "is_note": content !== null
        }
        if (this.props.parentCluster !== null) body["parent_cluster"] = this.props.parentCluster;
        else body["parent_project"] = this.props.curProject.id;

        makeHttpRequest(endpoint, "POST", body).then((response) => {
            if (response.status === 200) {
                // Alert that the item already exists in this project
                Alert.info('This item already exists in this project.');
                this.props.switchShowNewItemForm();
            } else if (response.status === 201) {
                // Update items
                this.props.renderNetwork(() => {
                    Alert.success('Item added successfully.');
                    this.props.switchShowNewItemForm();
                });
            }
        });

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showNewItemForm !== this.props.showNewItemForm && this.props.showNewItemForm) {
            this.setLoading(false);
        }
    }

    render() {
        if (!this.props.showNewItemForm) return null;
        let body;
        if (this.props.inputType === "URL") {
            // New URL
            body =
                <Input autoFocus required type="URL" id={this.state.newItemUrlId} placeholder="Add URL"/>;
        } else if (this.props.inputType === "Note" && this.props.item) {
            // New note created from a source node
            body =
                <Input autoFocus type={"Note"} required id={this.state.newItemNotesId}
                       placeholder="Add Note" componentClass="textarea" rows={30}/>;
        } else if (this.props.inputType === "Note" && !this.props.item) {
            // New note without a source passed in
            body =
                <div>
                    <Input autoFocus type="URL" id={this.state.newItemUrlId} placeholder="Add optional URL"/>
                    <Input type={"Note"} required id={this.state.newItemNotesId}
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
                <Form onSubmit={this.addNewItem}>
                    <Modal.Body>
                        {body}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={this.state.loading} appearance="primary">
                            Add Item
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default NewItemForm;