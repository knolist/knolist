import React from "react";
import {
    Alert,  Loader
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import bibliography from "./bibliography";
// import SourceView from "./SourceView";
// import NewSourceForm from "./NewSourceForm";
import AppFooter from "./AppFooter";

import makeHttpRequest from "../services/HttpRequest";

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // network: null,
            // visNodes: null,
            // visEdges: null,
            // selectedNode: null,
            // sources: null,
            // loading: false,
            // showNewSourceForm: false,
            // showNewSourceHelperMessage: false,
            // newSourceData: null
            bibWindow: null
        }
    }

    setbibWindow = () => {
    // setSelectedNode = (id) => {
    //     this.setState({selectedNode: id})
        this.setState({bibWindow})
    }

    // Check if the network is in edit mode
    // isEditMode = () => {
    //     const visCloseButton = document.getElementsByClassName("vis-close")[0];
    //     return getComputedStyle(visCloseButton).display === "none"
    // }

    // Set selected node for the detailed view
    // handleClickedNode = (id) => {
    //     this.setSelectedNode(id);
    handleClickedBibGen = () => {
        this.setbibWindow();
        // Only open modal outside of edit mode
        // if (this.isEditMode()) {
        //     this.setSelectedNode(id);
        // }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);

        // TODO: not sure how to update endpoint
        // const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await makeHttpRequest(endpoint);
        this.setLoading(false);
        // TODO: not sure how to update this
        // this.setState({sources: response.body.sources}, callback);
    }

    // disableEditMode = () => {
    //     this.setShowNewSourceHelperMessage(false);
    //     if (this.state.network) this.state.network.disableEditMode()
    // }

    // addSource = (nodeData, callback) => {
    //     this.switchShowNewSourceForm();
    //     this.setShowNewSourceHelperMessage(false);
    //     this.setState({
    //         newSourceData: nodeData
    //     });
    // }

    // setAddSourceMode = () => {
    //     this.setShowNewSourceHelperMessage(true);
    //     if (this.state.network) this.state.network.addNodeMode();
    // }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        this.getSources(() => {
            const [nodes, edges] = this.createNodesAndEdges();

            // create a network
            const container = document.getElementById('mindmap');

            const options = {
                nodes: {
                    shape: "box",
                    size: 16,
                    margin: 10,
                    physics: false,
                    chosen: false,
                    font: {
                        face: "Apple-System",
                        color: "white"
                    },
                    color: {
                        background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
                    },
                    widthConstraint: {
                        maximum: 500
                    }
                },
                edges: {
                    arrows: {
                        to: {
                            enabled: true
                        }
                    },
                    color: "black",
                    physics: false,
                    smooth: false,
                    hoverWidth: 0
                },
                interaction: {
                    selectConnectedEdges: false,
                    hover: true,
                    hoverConnectedEdges: false
                },
                manipulation: {
                    enabled: false,
                    addNode: this.addSource
                }
            };

            // Initialize the network
            const network = new Network(container, options);
            network.fit()

            // Handle click vs drag
            network.on("click", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.handleClickedNode(nodeId);
                }
            });

            // Set cursor to pointer when hovering over a node
            network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
            network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

            // Store the network
            this.setState({network: network}, callback);
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.curProject !== this.props.curProject) {
            // Set sources to null before updating to show loading icon
            this.setState({sources: null}, this.renderNetwork);
        }

        if (prevState.showNewSourceHelperMessage !== this.state.showNewSourceHelperMessage) {
            if (this.state.showNewSourceHelperMessage) {
                Alert.info("Click on an empty space to add your new source.",
                    0, this.disableEditMode);
            } else {
                Alert.close();
            }
        }
    }

    componentDidMount() {
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null || (this.state.loading && this.state.sources === null)) {
            return <Loader size="lg" backdrop center/>
        }

        return (
            <div>
                <div id="mindmap"/>
                <SourceView selectedNode={this.state.selectedNode}
                            setSelectedNode={this.setSelectedNode}
                            renderNetwork={this.renderNetwork}/>
                <NewSourceForm showNewSourceForm={this.state.showNewSourceForm}
                               newSourceData={this.state.newSourceData}
                               curProject={this.props.curProject}
                               renderNetwork={this.renderNetwork}
                               switchShowNewSourceForm={this.switchShowNewSourceForm}/>
                <AppFooter fit={this.fitNetworkToScreen} setAddSourceMode={this.setAddSourceMode}/>
            </div>
        );
    }
}

export default MindMap;