import React from "react";
import {Alert, Button, Form, Input, Modal} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class NewClusterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newClusterName: "new-cluster-name",
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
        //onst url = document.getElementById(this.state.newClusterName).value;
        const {x, y} = this.props.stationaryClusterSourceData;
        console.log(x, y)
        //const endpoint = "/projects/" + this.props.curProject.id + "/sources"
        // const body = {
        //     "url": url,
        //     "x_position": x,
        //     "y_position": y
        // }

        // makeHttpRequest(endpoint, "POST", body).then((response) => {
        //     if (response.status === 200) {
        //         // Alert that the source already exists in this project
        //         Alert.info('This URL already exists in this project.');
        //     } else if (response.status === 201) {
        //         // Update sources
        //         this.props.renderNetwork();
        //         Alert.success('Source added successfully.');
        //     }
        //     this.props.switchShowNewSourceForm();
        // });
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
                        <Input autoFocus type="text" required id={this.state.newClusterName}
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