import React from "react";
import {Alert, Button, Form, Input, Modal} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class NewClusterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newClusterNameId: "new-cluster-name",
            loading: false
        }
    }

    close = () => {
        this.props.switchShowNewClusterForm()
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    addNewCluster = () => {
        this.setLoading(true);
        const item1_id = this.props.newClusterIDs.item1
        const item2_id = this.props.newClusterIDs.item2
        const name = document.getElementById(this.state.newClusterNameId).value
        const {x, y} = this.props.stationaryClusterSourceData;
        const endpoint = "/clusters/create_new"
        const body = {
            "item1_id": item1_id,
            "item2_id": item2_id,
            "x_position": x,
            "y_position": y,
            "name": name,
        }

        makeHttpRequest(endpoint, "POST", body).then((response) => {
            if (response.status === 200) {
                this.props.renderNetwork();
                Alert.success('Cluster created successfully.');
            }
            this.props.switchShowNewClusterForm();
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showNewClusterForm !== this.props.showNewClusterForm && this.props.showNewClusterForm) {
            this.setLoading(false);
        }
    }

    render() {
        if (!this.props.showNewClusterForm) return null;

        return (
            <Modal show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        Enter the name of the cluster you'd like to create
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.addNewCluster}>
                    <Modal.Body>
                        <Input autoFocus type="text" required id={this.state.newClusterNameId}
                               placeholder="New Cluster Name"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={this.state.loading} appearance="primary">
                            Add Cluster
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default NewClusterForm;