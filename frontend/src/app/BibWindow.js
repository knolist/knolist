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

    // renderBibWindow = (callback) => {
    //     if (this.props.curProject === null) return;

    //     // TODO: Here would be where we'd fetch the sources to display in cited form?
    //     // this.getSources(() => {
    //     //     const [nodes, edges] = this.createNodesAndEdges();

    //     //     // create a network
    //     //     const container = document.getElementById('mindmap');

    //     //     const options = {
    //     //         nodes: {
    //     //             shape: "box",
    //     //             size: 16,
    //     //             margin: 10,
    //     //             physics: false,
    //     //             chosen: false,
    //     //             font: {
    //     //                 face: "Apple-System",
    //     //                 color: "white"
    //     //             },
    //     //             color: {
    //     //                 background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
    //     //             },
    //     //             widthConstraint: {
    //     //                 maximum: 500
    //     //             }
    //     //         },
    //     //         edges: {
    //     //             arrows: {
    //     //                 to: {
    //     //                     enabled: true
    //     //                 }
    //     //             },
    //     //             color: "black",
    //     //             physics: false,
    //     //             smooth: false,
    //     //             hoverWidth: 0
    //     //         },
    //     //         interaction: {
    //     //             selectConnectedEdges: false,
    //     //             hover: true,
    //     //             hoverConnectedEdges: false
    //     //         },
    //     //         manipulation: {
    //     //             enabled: false,
    //     //             addNode: this.addSource
    //     //         }
    //     //     };

    //     //     // Initialize the network
    //     //     const network = new Network(container, options);

    //     //     // Handle click vs drag
    //     //     network.on("click", (params) => {
    //     //         if (params.nodes !== undefined && params.nodes.length > 0) {
    //     //             const nodeId = params.nodes[0];
    //     //             this.handleClickedNode(nodeId);
    //     //         }
    //     //     });

    //     //     // Set cursor to pointer when hovering over a node
    //     //     network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
    //     //     network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

    //     //     // Store the network
    //     //     this.setState({network: network}, callback);
    //     // })
    // }

    // setbibWindow = () => {
    // // setSelectedNode = (id) => {
    // //     this.setState({selectedNode: id})
    //     this.setState({bibWindow})
    // }

    // // Check if the network is in edit mode
    // // isEditMode = () => {
    // //     const visCloseButton = document.getElementsByClassName("vis-close")[0];
    // //     return getComputedStyle(visCloseButton).display === "none"
    // // }

    // // Set selected node for the detailed view
    // // handleClickedNode = (id) => {
    // //     this.setSelectedNode(id);
    // handleClickedBibGen = () => {
    //     this.setbibWindow();
    //     // Only open modal outside of edit mode
    //     // if (this.isEditMode()) {
    //     //     this.setSelectedNode(id);
    //     // }
    // }

    // setLoading = (val) => {
    //     this.setState({loading: val});
    // }

    // getSources = async (callback) => {
    //     if (this.props.curProject === null) return null;
    //     this.setLoading(true);

    //     // TODO: not sure how to update endpoint
    //     // const endpoint = "/projects/" + this.props.curProject.id + "/sources";
    //     const response = await makeHttpRequest(endpoint);
    //     this.setLoading(false);
    //     // TODO: not sure how to update this
    //     // this.setState({sources: response.body.sources}, callback);
    // }

    // // disableEditMode = () => {
    // //     this.setShowNewSourceHelperMessage(false);
    // //     if (this.state.network) this.state.network.disableEditMode()
    // // }

    // // addSource = (nodeData, callback) => {
    // //     this.switchShowNewSourceForm();
    // //     this.setShowNewSourceHelperMessage(false);
    // //     this.setState({
    // //         newSourceData: nodeData
    // //     });
    // // }

    // // setAddSourceMode = () => {
    // //     this.setShowNewSourceHelperMessage(true);
    // //     if (this.state.network) this.state.network.addNodeMode();
    // // }
}

export default BibWindow;