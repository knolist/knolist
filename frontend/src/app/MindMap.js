import React from "react";
import {
    Alert,  Loader
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import SourceView from "./SourceView";
import NewSourceForm from "./NewSourceForm";
import NewClusterForm from "./NewClusterForm"
import AppFooter from "./AppFooter";

import makeHttpRequest from "../services/HttpRequest";

import throttle from "../util/throttle";
import isOverlap from "../util/isOverlap"

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            nonSelectedNodes: null,
            sources: null,
            clusters: null,
            loading: false,
            showNewSourceForm: false,
            showNewClusterForm : false,
            showNewSourceHelperMessage: false,
            newSourceData: null,
            stationaryClusterSourceData: null,
            newClusterIDs: null,
        }
    }

    setSelectedNode = (id) => {
        this.setState({selectedNode: id})
    }

    setNonSelectedNodes = (id, nodes) => {
        this.setState({nonSelectedNodes: nodes.getIds().filter(element => element !== id)})
    }

    // Check if the network is in edit mode
    // isEditMode = () => {
    //     const visCloseButton = document.getElementsByClassName("vis-close")[0];
    //     return getComputedStyle(visCloseButton).display === "none"
    // }

    // Set selected node for the detailed view
    handleClickedNode = (id) => {
        this.setSelectedNode(id);
        // Only open modal outside of edit mode
        // if (this.isEditMode()) {
        //     this.setSelectedNode(id);
        // }
    }

    handleDragStart = (id, nodes) => {
        this.setNonSelectedNodes(id, nodes);
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await makeHttpRequest(endpoint);
        this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
    }

    getClusters = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true)

        const endpoint = "/projects/" + this.props.curProject.id + "/clusters"
        const response = await makeHttpRequest(endpoint)
        this.setLoading(false)
        this.setState({clusters: response.body.clusters}, callback)
    }

    updateSourcePosition = async (sourceId, x, y) => {
        const endpoint = "/sources/" + sourceId;
        const body = {
            "x_position": x,
            "y_position": y
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    fitNetworkToScreen = () => {
        if (this.state.network !== null) {
            this.state.network.fit()
        }
    }

    disableEditMode = () => {
        this.setShowNewSourceHelperMessage(false);
        if (this.state.network) this.state.network.disableEditMode()
    }

    enableInteraction = (network) => {
        network.setOptions({interaction: {dragNodes: true}})
        network.setOptions({interaction: {dragView: true}})
    }

    disableInteraction = (network) => {
        network.setOptions({interaction: {dragNodes: false}})
        network.setOptions({interaction: {dragView: false}})
    }
 
    switchShowNewSourceForm = () => {
        this.setState({showNewSourceForm: !this.state.showNewSourceForm}, () => {
            // Get out of edit mode if necessary
            if (!this.state.showNewSourceForm) {
                this.disableEditMode()
            }
        });
    }

    switchShowNewClusterForm = () => {
        this.setState({showNewClusterForm: !this.state.showNewClusterForm}, () => {
            // Get out of edit mode if necessary
            if (!this.state.showNewClusterForm) {
                this.disableEditMode()
            }
        });
    }

    setShowNewSourceHelperMessage = (val) => {
        this.setState({showNewSourceHelperMessage: val});
    }

    addSource = (nodeData, callback) => {
        this.switchShowNewSourceForm();
        this.setShowNewSourceHelperMessage(false);
        this.setState({
            newSourceData: nodeData
        });
    }

    setAddSourceMode = () => {
        this.setShowNewSourceHelperMessage(true);
        if (this.state.network) this.state.network.addNodeMode();
    }

    /* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
    generateNodePositions(node) {
        let xOffset = 0;
        let yOffset = 0;
        // Update the offset if the node has a parent
        if (node.prev_sources.length !== 0) {
            const prevId = node.prev_sources[0];
            const prevNode = this.state.sources.find(x => x.id === prevId);
            // Check if the previous node has defined coordinates
            if (prevNode.x_position !== null && prevNode.y_position !== null) {
                xOffset = prevNode.x_position;
                yOffset = prevNode.y_position;
            }
        }
        // Helper variable to generate random positions
        const rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
        // Generate random positions
        const xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
        const yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

        // Return positions with offset
        return [xRandom + xOffset, yRandom + yOffset];
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.sources) {
            if (this.state.clusters.filter(cluster => cluster.project_id === this.props.curProject.id)
                .filter(cluster => cluster.child_items.includes(parseInt(this.state.sources[index].id))).length === 0) {
                let node = this.state.sources[index];
                // Deal with positions
                if (node.x_position === null || node.y_position === null) {
                    // If position is still undefined, generate random x and y in interval [-300, 300]
                    const [x, y] = this.generateNodePositions(node);
                    this.updateSourcePosition(node.id, x, y);
                    nodes.add({group: 'sources', id: node.id, label: node.title, x: x, y: y});
                } else {
                    nodes.add({group: 'sources', id: node.id, label: node.title, x: node.x_position, y: node.y_position});
                }
                // Deal with edges
                for (let nextIndex in node.next_sources) {
                    const nextId = node.next_sources[nextIndex];
                    edges.add({from: node.id, to: nextId})
                }
            }
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    createClusters() {
        let clusterNodes = new DataSet()
        let projectClusters = this.state.clusters.filter(cluster => cluster.project_id === this.props.curProject.id)
        projectClusters.forEach(cluster => {
            clusterNodes.add({group: 'clusters', label: cluster.name, x: cluster.x_position, y: cluster.y_position})
            if (cluster.child_items.length > 2) {

            } else {
                let count = 0;
                cluster.child_items.forEach(child => {
                    const title = this.state.sources.filter(source => source.id === child)[0].title
                    if (count === 0) {
                        clusterNodes.add({group: 'sources', id: child, label: title, x: cluster.x_position, y: cluster.y_position - 70})
                    } else {
                        clusterNodes.add({group: 'sources', id: child, label: title, x: cluster.x_position, y: cluster.y_position + 70})
                    }
                    count = count + 1
                })
            }
        })
        return clusterNodes
    }

    // TODO: need to clean up
    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        this.getSources(function() {
            this.getClusters(function() {
                let [nodes, edges] = this.createNodesAndEdges();
                const clusterNodes = this.createClusters();

                clusterNodes.forEach(cluster => {
                    nodes.add(cluster)
                })
                // create a network
                const container = document.getElementById('mindmap');

                // provide the data in the vis format
                const data = {
                    nodes: nodes,
                    edges: edges
                };
                const options = {
                    groups: {
                        clusters: { 
                            chosen: {
                                label: function (values, id, selected, hovering) {
                                    values.color = 'black';
                                }
                            },
                            shape: 'circle',
                            font: {
                                face: "Apple-System",
                                color: "ffffff00"
                            },
                            color: {
                                border: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"],
                                background: '#ffffff00'
                            },
                            scaling: {
                                label: {
                                    enabled: true,
                                    min: 125,
                                    max: 125
                                }
                            },
                            value: 1
                        },
                        sources: {
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
                const network = new Network(container, data, options);
                network.fit()

                // Handle click vs drag
                network.on("click", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.handleClickedNode(nodeId);
                    }
                });

                network.on("dragStart", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.handleDragStart(nodeId, nodes)
                    }
                });

                let check_cluster
                let delay_disable
                let dt = 100 //ms
                let hold_time = 500 //ms
                network.on("dragging", throttle((params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        clearTimeout(check_cluster)
                        clearTimeout(delay_disable)
                        const id = network.getSelectedNodes()[0];
                        const boundingBox = network.getBoundingBox(id)
                        let otherNodes = this.state.nonSelectedNodes
                        check_cluster = setTimeout(function() {
                            if (!this.state.showNewClusterForm && otherNodes.length > 2) {
                                otherNodes.forEach(node => {
                                    if (isOverlap(network.getBoundingBox(parseInt(node)), boundingBox)) {
                                        delay_disable = setTimeout(this.disableInteraction.bind(null, network), 100)
                                        this.setState({ showNewClusterForm: true });
                                        this.setState({ stationaryClusterSourceData: network.getPosition(parseInt(node)) })
                                        this.setState({ newClusterIDs: { "item1": id, "item2": parseInt(node) } })
                                        // console.log('cluster detected between', nodes.get(id).label, `(id=${id})`, 'and', nodes.get(parseInt(node)).label, `(id=${node})`)
                                    }
                                })
                            }
                        }.bind(this), hold_time)
                    }
                }, dt));

                // Update positions after dragging node
                network.on("dragEnd", () => {
                    this.enableInteraction(network)
                    // Only update positions if there is a selected node
                    if (network.getSelectedNodes().length !== 0) {
                        const id = network.getSelectedNodes()[0];
                        const position = network.getPosition(id);
                        const x = position.x;
                        const y = position.y;
                        this.updateSourcePosition(id, x, y);
                    }
                });

                // Set cursor to pointer when hovering over a node
                network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
                network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

                // Store the network
                this.setState({ network: network }, callback);

            }.bind(this))
        }.bind(this))
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
                <NewClusterForm showNewClusterForm={this.state.showNewClusterForm}
                                stationaryClusterSourceData={this.state.stationaryClusterSourceData}
                                curProject={this.props.curProject}
                                renderNetwork={this.renderNetwork}
                                newClusterIDs={this.state.newClusterIDs}
                                switchShowNewClusterForm={this.switchShowNewClusterForm}/>
                <AppFooter fit={this.fitNetworkToScreen} setAddSourceMode={this.setAddSourceMode}/>
            </div>
        );
    }
}

export default MindMap;