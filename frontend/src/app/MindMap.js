import React from "react";
import {
    Alert, Loader
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import ItemView from "./ItemView";
import NewItemForm from "../components/NewItemForm";
import NewClusterForm from "./NewClusterForm"
import AppFooter from "./AppFooter";
import BibWindow from "./BibWindow";
import SharedProject from "./SharedProject";
// import Minigames from "./Minigames";

import RaiseLevelButton from "./RaiseLevelButton"
import ClusterTitle from "../components/ClusterTitle.js";

import makeHttpRequest, {constructHttpQuery} from "../services/HttpRequest";

import throttle from "../services/throttle";
import isOverlap from "../services/isOverlap"

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        const modes = {
            NULL: null,
            URL: "url",
            NOTES: "notes"
        };
        const types = {
            NULL: null,
            PURESOURCE: "pureSource",
            SOURCEANDNOTE: "sourceAndNote",
            SOURCEANDHIGHLIGHT: "sourceAndHighlight",
            PURENOTE: "pureNote",
            NEITHER: "neither"
        }
        const nodeColors = {
            NULL: null,
            [types.PURESOURCE]: "#00c0de",
            [types.SOURCEANDNOTE]: "#f36170",
            [types.SOURCEANDHIGHLIGHT]: "#45c786",
            [types.PURENOTE]: "#f5a94b",
            [types.NEITHER]: "#000000"
        };
        this.state = {
            network: null,
            visNodes: null,
            selectedItem: null,
            items: null,
            nonSelectedNodes: null,
            clusters: null,
            loading: false,
            showNewItemForm: false,
            showNewItemHelperMessage: false,
            newItemData: modes.NULL,
            modes: modes,
            newItemFormType: null,
            item: null,
            types: types,
            nodeColors: nodeColors,
            showColor: nodeColors.NULL,
            showNewClusterForm: false,
            showNewClusterHelperMessage: false,
            showAddToClusterHelperMessage: false,
            stationaryClusterItemData: null,
            newClusterIds: null,
            existingClusterId: null,
            curClusterView: JSON.parse(localStorage.getItem("curClusterView")), // Set to the cluster object if inside a cluster
            showRemoveItemFromClusterMessage: false,
            raiseLevelButtonHover: false,
        };
    };

    generateVisClusterId = (cluster) => "c" + cluster.id;

    generateClusterIdFromVisId = (visClusterId) => parseInt(visClusterId.substring(visClusterId.indexOf("c") + 1));

    generateVisInClusterId = (cluster, type, node) => {
        let firstPart = "c" + cluster.id;
        let secondPart;
        if (type === "item") secondPart = "i" + node.id;
        else if (type === "title") secondPart = "t";
        else if (type === "count") secondPart = "n";
        return firstPart + secondPart;
    }

    generateClusterIdAndNodeIdFromVisInClusterId = (visInClusterId) => {
        let nodeId;
        let index = visInClusterId.indexOf("i");
        if (index >= 0) {
            nodeId = parseInt(visInClusterId.substring(index + 1));
        } else {
            index = visInClusterId.indexOf("t");
            if (index === -1) index = visInClusterId.indexOf("n");
        }

        const clusterId = parseInt(visInClusterId.substring(visInClusterId.indexOf("c") + 1, index));
        return [clusterId, nodeId];
    }

    isItem = (id) => {
        const node = this.state.visNodes.get(id);
        if (node) return node.group === "items";
        return false;
    }

    isCluster = (id) => {
        const node = this.state.visNodes.get(id);
        if (node) return node.group === "clusters";
        return false;
    }

    isItemInCluster = (id) => {
        const node = this.state.visNodes.get(id);
        if (node) return node.group === "inCluster";
        return false;
    }

    setSelectedItem = (item) => {
        this.setState({selectedItem: item})
    }

    getSelectedItemDetails = async () => {
        const endpoint = "/items/" + this.state.selectedItem.id;
        const response = await makeHttpRequest(endpoint);
        this.setSelectedItem(response.body.item);
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
        this.setSelectedItem(this.state.items.find(x => x.id === id));
    }

    handleClickedCluster = (id) => {
        this.setCurClusterView(this.state.clusters.find(x => x.id === id))
    }

    setCurClusterView = (cluster) => {
        this.setState({curClusterView: cluster})
    }

    handleDragStart = (nodeId, nodes, network) => {
        const isCluster = this.isCluster(nodeId);
        const isItemInCluster = this.isItemInCluster(nodeId);
        if (isCluster || isItemInCluster) {
            const numDisplayedChildNodes = 2;
            let cluster, visClusterId;
            if (isCluster) {
                cluster = this.state.clusters.find(cluster => cluster.id === this.generateClusterIdFromVisId(nodeId));
                visClusterId = nodeId;
            } else {
                cluster = this.state.clusters.find(cluster => cluster.id === this.generateClusterIdAndNodeIdFromVisInClusterId(nodeId)[0]);
                visClusterId = this.generateVisClusterId(cluster);
            }
            const childNodes = cluster.child_items.slice(0, numDisplayedChildNodes);
            const childNodesIds = childNodes.map(node => this.generateVisInClusterId(cluster, "item", node));
            const clusterTitleId = this.generateVisInClusterId(cluster, "title");
            const nodesToMove = childNodesIds.concat([visClusterId, clusterTitleId]);
            // Include node count if necessary
            if (cluster.child_items.length > 2) {
                const clusterCountId = this.generateVisInClusterId(cluster, "count");
                nodesToMove.push(clusterCountId);
            }
            network.selectNodes(nodesToMove);
        } else {
            this.setNonSelectedNodes(nodeId, nodes);
        }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    getItems = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);

        if (this.props.filters.length === 0) {
            this.setLoading(false);
            this.setState({items: []}, callback);
            return;
        }

        if (this.state.curClusterView === null) {
            let endpoint = "/projects/" + this.props.curProject.id + "/items";

            if (this.props.searchQuery !== '' && this.props.filters.length !== 0) {
                endpoint = constructHttpQuery(endpoint, this.props.searchQuery, this.props.filters)
            }

            const response = await makeHttpRequest(endpoint);

            this.setLoading(false);
            this.setState({items: response.body.items}, callback);
        } else {
            const endpoint = "/clusters/" + this.state.curClusterView.id;
            const response = await makeHttpRequest(endpoint);
            this.setLoading(false);
            this.setState({items: response.body.cluster.child_items}, callback);
        }
    }

    getClusters = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true)
        if (this.state.curClusterView == null) {
            const endpoint = "/projects/" + this.props.curProject.id + "/clusters";
            const response = await makeHttpRequest(endpoint);
            this.setLoading(false);
            this.setState({clusters: response.body.clusters}, callback);
        } else {
            const endpoint = "/clusters/" + this.state.curClusterView.id;
            const response = await makeHttpRequest(endpoint);
            const children = response.body.cluster.child_clusters.map(child => makeHttpRequest('/clusters/' + child));
            Promise.all(children).then(values => {
                this.setLoading(false);
                this.setState({clusters: values.map(child => child.body.cluster)}, callback);
            })
        }
    }

    updateItemPosition = (itemId, x, y) => {
        const endpoint = "/items/" + itemId;
        const body = {
            "x_position": x,
            "y_position": y
        }
        makeHttpRequest(endpoint, "PATCH", body).then();
    }

    updateClusterPosition = (clusterId, x, y) => {
        const endpoint = "/clusters/" + clusterId;
        const body = {
            "x": x,
            "y": y
        }
        makeHttpRequest(endpoint, "PATCH", body).then();
    }

    fitNetworkToScreen = () => {
        if (this.state.network !== null) {
            this.state.network.fit()
        }
    }

    disableEditMode = () => {
        this.setShowNewItemHelperMessage(false);
        this.setShowNewClusterHelperMessage(false);
        if (this.state.network) this.state.network.disableEditMode()
    }

    switchShowNewItemForm = () => {
        this.setState({showNewItemForm: !this.state.showNewItemForm}, () => {
            // Get out of edit mode if necessary
            if (!this.state.showNewItemForm) {
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

    setShowNewItemHelperMessage = (val) => {
        this.setState({showNewItemHelperMessage: val});
    }

    addItem = (nodeData, callback) => {
        this.switchShowNewItemForm();
        this.setShowNewItemHelperMessage(false);
        this.setState({
            newItemData: nodeData
        });
    }

    setShowNewClusterHelperMessage = (val) => {
        this.setState({showNewClusterHelperMessage: val});
    }

    setShowAddToClusterHelperMessage = (val) => {
        this.setState({showAddToClusterHelperMessage: val});
    }

    setAddItemMode = (newItemFormType, item = null) => {
        this.setState({
            newItemFormType: newItemFormType,
            item: item
        });
        this.setShowNewItemHelperMessage(true);
        if (this.state.network) this.state.network.addNodeMode();
    }

    addItemToCluster = (clusterId, itemId) => {
        this.setLoading(true);
        const endpoint = "/clusters/" + clusterId + "/items/" + itemId;
        makeHttpRequest(endpoint, "POST").then(response => {
            this.setLoading(false);
            if (response.body.success) Alert.success("This item was successfully added");
            else Alert.error("This item could not be added");
            this.renderNetwork();
        });

    }

    moveItemFromClusterToHigherLevel = (itemId, clusterId) => {
        this.setLoading(true);
        const endpoint = "/clusters/" + clusterId + "/items/" + itemId;
        makeHttpRequest(endpoint, "DELETE").then(response => {
            this.setLoading(false);
            if (response.body.success) Alert.success("The item was successfully moved");
            else Alert.error("This item could not be moved");
            this.renderNetwork();
        });
    }

    /* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
    generateNodePositions(node) {
        let xOffset = 0;
        let yOffset = 0;
        // // Update the offset if the node has a parent
        // if (node.prev_sources.length !== 0) {
        //     const prevId = node.prev_sources[0];
        //     const prevNode = this.state.items.find(x => x.id === prevId);
        //     // Check if the previous node has defined coordinates
        //     if (prevNode.x_position !== null && prevNode.y_position !== null) {
        //         xOffset = prevNode.x_position;
        //         yOffset = prevNode.y_position;
        //     }
        // }
        // Helper variable to generate random positions
        const rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
        // Generate random positions
        const xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
        const yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

        // Return positions with offset
        return [xRandom + xOffset, yRandom + yOffset];
    }

    getNodeType = (node) => {
        if (!node) return this.state.types.NULL;
        //pure note
        if (!node.url) return this.state.types.PURENOTE;
        //source and note
        if (node.url && node.is_note && node.content) return this.state.types.SOURCEANDNOTE;
        //source and highlight
        if (node.url && !node.is_note && node.content) return this.state.types.SOURCEANDHIGHLIGHT;
        //pure source
        if (node.url && !node.content) return this.state.types.PURESOURCE;
    }

    getNodeLabel = (node, nodeType) => {
        const types = this.state.types;
        const contentLength = 100;
        let nodeContent;
        if (node.content) {
            nodeContent = node.content;
            if (nodeContent.length > contentLength) nodeContent = nodeContent.substring(0, contentLength) + "...";
        }
        if (nodeType === types.PURESOURCE)
            return node.title;
        if (nodeType === types.SOURCEANDNOTE || nodeType === types.SOURCEANDHIGHLIGHT)
            return node.title + "\n" + nodeContent;
        if (nodeType === types.PURENOTE)
            return nodeContent;
    }

    getNodePosition = (node) => {
        let x = node.x_position;
        let y = node.y_position;
        if (x === null || y === null) {
            // If position is still undefined, generate random x and y in interval [-300, 300]
            [x, y] = this.generateNodePositions(node);
            this.updateItemPosition(node.id, x, y);
        }
        return [x, y];
    }

    // Helper function to setup the nodes for the graph
    createNodes() {
        let nodes = new DataSet();

        // Iterate through each node in the graph and build the arrays of nodes
        for (let index in this.state.items) {
            if (this.state.clusters.length === 0 || this.state.clusters.filter(cluster => cluster.project_id === this.props.curProject.id)
                .filter(cluster => cluster.child_items.some(e => e.id === this.state.items[index].id)).length === 0) {
                const node = this.state.items[index];
                const nodeType = this.getNodeType(node);
                const label = this.getNodeLabel(node, nodeType);
                const [x, y] = this.getNodePosition(node);
                nodes.add({group: "items", id: node.id, label: label, x: x, y: y, color: this.getColor(node)});
            }
        }
        this.setState({visNodes: nodes});
        return nodes;
    }

    getColor = (item) => {
        const nodeType = this.getNodeType(item);
        return this.state.nodeColors[nodeType];
    }

    createClusters() {
        //console.log("createClusters()");
        let clusterNodes = new DataSet();
        if (this.state.clusters.length === 0) {
            return clusterNodes;
        }
        // let projectClusters = this.state.clusters.filter(
        //         cluster => (cluster.project_id === this.props.curProject.id))
        let projectClusters = this.state.clusters;
        projectClusters.forEach(cluster => {
            clusterNodes.add({
                group: "clusters",
                id: this.generateVisClusterId(cluster),
                label: '-----------------------------------------------------', // :(
                x: cluster.x_position,
                y: cluster.y_position
            });
            // Add node to serve as cluster title
            const helperDataOffset = 120;
            clusterNodes.add({
                group: "inCluster",
                id: this.generateVisInClusterId(cluster, "title"),
                label: cluster.name,
                x: cluster.x_position,
                y: cluster.y_position - helperDataOffset,
                font: {
                    color: "black",
                    size: 18
                },
                color: {
                    background: "#ffffff",
                    border: "#00c0de"
                }
            })
            if (cluster.total_items > 2) {
                const totalNodes = cluster.total_items - 2;
                let numLabel = " items";
                if (totalNodes < 2) numLabel = " item";
                clusterNodes.add({
                    group: "inCluster",
                    id: this.generateVisInClusterId(cluster, "count"),
                    label: "+" + totalNodes + numLabel,
                    x: cluster.x_position,
                    y: cluster.y_position + helperDataOffset,
                    font: {
                        color: "black",
                        size: 18
                    },
                    color: {
                        background: "rgba(0, 0, 0, 0)",
                        border: "rgba(0, 0, 0, 0)"
                    }
                })
            }
            let count = 0;
            cluster.child_items.forEach(child => {
                const nodeType = this.getNodeType(child);
                const label = this.getNodeLabel(child, nodeType);
                let yOffset = -40;
                if (count === 1) {
                    yOffset = 40;
                }
                if (count > 1) return;

                clusterNodes.add({
                    group: 'inCluster',
                    id: this.generateVisInClusterId(cluster, "item", child),
                    label: label,
                    x: cluster.x_position,
                    y: cluster.y_position + yOffset,
                    widthConstraint: {
                        maximum: 170
                    },
                    color: this.getColor(child)
                })
                count++;
            })
        })
        return clusterNodes
    }

    renderNetwork = (callback) => {
        //console.log("renderNetwork()");
        if (this.props.curProject === null) return;

        this.getItems(() => {
            this.getClusters(() => {
                let nodes = this.createNodes();
                const clusterNodes = this.createClusters();
                clusterNodes.forEach(cluster => {
                    nodes.add(cluster)
                })

                // create a network
                const container = document.getElementById('mindmap');

                // provide the data in the vis format
                const data = {
                    nodes: nodes
                };

                const options = {
                    groups: {
                        clusters: {
                            chosen: {
                                label: (values, id, selected, hovering) => {
                                    values.color = '#ffffff00';
                                },
                                node: (values, id, selected, hovering) => {
                                    values.color = '#ffffff00';
                                }
                            },
                            shape: 'circle',
                            font: {
                                face: "Apple-System",
                                color: "#ffffff00"
                            },
                            color: {
                                border: "#00c0de",
                                background: '#ffffff00'
                            },
                            physics: false
                        },
                        items: {
                            shape: "box",
                            size: 16,
                            margin: 10,
                            physics: false,
                            chosen: false,
                            font: {
                                face: "Apple-System",
                                color: "white"
                            },
                            widthConstraint: {
                                maximum: 500
                            }
                        },
                        inCluster: {
                            shape: "box",
                            size: 16,
                            margin: 10,
                            physics: false,
                            chosen: false,
                            font: {
                                face: "Apple-System",
                                color: "white"
                            },
                            widthConstraint: {
                                maximum: 500
                            }
                        }
                    },
                    interaction: {
                        selectConnectedEdges: false,
                        hover: true,
                        hoverConnectedEdges: false
                    },
                    manipulation: {
                        enabled: false,
                        addNode: this.addItem
                    }
                };

                // Initialize the network
                const network = new Network(container, data, options);
                network.fit()

                // Handle click vs drag
                network.on("click", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        if (this.isItem(nodeId)) {
                            this.handleClickedNode(nodeId);
                        } else if (this.isCluster(nodeId) || this.isItemInCluster(nodeId)) {
                            let clusterId;
                            if (this.isItemInCluster(nodeId)) {
                                clusterId = this.generateClusterIdAndNodeIdFromVisInClusterId(nodeId)[0];
                            } else {
                                clusterId = this.generateClusterIdFromVisId(nodeId);
                            }
                            this.handleClickedCluster(clusterId)
                        }
                    }
                });

                network.on("dragStart", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        this.handleDragStart(nodeId, nodes, network);
                    }
                });

                let dt = 100 //ms
                network.on("dragging", throttle((params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const id = network.getSelectedNodes()[0];
                        if (this.isItem(id)) {
                            const boundingBox = network.getBoundingBox(id);
                            let otherNodes = this.state.nonSelectedNodes;
                            if ((!this.state.showNewClusterHelperMessage && !this.state.showAddToClusterHelperMessage)
                                 && otherNodes.length >= 1) {
                                otherNodes.forEach(node => {
                                    if (isOverlap(network.getBoundingBox(node), boundingBox)) {
                                        if (this.isItem(node)) {
                                            this.setState({stationaryClusterItemData: network.getPosition(node)})
                                            this.setState({newClusterIds: {"item1": id, "item2": node}})
                                            this.setShowNewClusterHelperMessage(true)
                                        } else if (this.isCluster(node)) {
                                            this.setState({existingClusterId: node})
                                            this.setShowAddToClusterHelperMessage(true)
                                        }
                                    }
                                });
                                if (this.state.curClusterView && this.state.raiseLevelButtonHover) {
                                    this.setState({showRemoveItemFromClusterMessage: true});
                                } else if (this.state.curClusterView && !this.state.raiseLevelButtonHover) {
                                    this.setState({showRemoveItemFromClusterMessage: false});
                                }
                            } else {
                                if (this.state.newClusterIds && !isOverlap(boundingBox, network.getBoundingBox(this.state.newClusterIds.item2))) {
                                    this.setShowNewClusterHelperMessage(false)
                                }
                                if (this.state.existingClusterId && !isOverlap(boundingBox, network.getBoundingBox(this.state.existingClusterId))) {
                                    this.setShowAddToClusterHelperMessage(false)
                                }
                            }
                        }
                    }
                }, dt));

                // Update positions after dragging node
                network.on("dragEnd", (eventData) => {
                    // Only update positions if there is a selected node
                    if (network.getSelectedNodes().length !== 0) {
                        if (this.state.showNewClusterHelperMessage) {
                            this.setState({showNewClusterForm: true})
                        } else if (this.state.showAddToClusterHelperMessage) {
                            // Add item to existing cluster
                            const existingCluster = this.state.existingClusterId;
                            const id = this.generateClusterIdFromVisId(existingCluster);
                            this.addItemToCluster(id, network.getSelectedNodes()[0]);
                            this.setShowAddToClusterHelperMessage(false);
                            this.renderNetwork();
                        } else if (this.state.showRemoveItemFromClusterMessage && this.state.raiseLevelButtonHover) {
                            this.moveItemFromClusterToHigherLevel(network.getSelectedNodes()[0], this.state.curClusterView.id);
                            this.setState({showRemoveItemFromClusterMessage: false});
                            this.renderNetwork();
                        } else {
                            // Update position of item or cluster
                            const id = network.getSelectedNodes()[0];
                            const position = network.getPosition(id);
                            const x = position.x;
                            const y = position.y;
                            if (this.isItem(id)) {
                                this.updateItemPosition(id, x, y);
                            } else if (this.isCluster(id) || this.isItemInCluster(id)) {
                                let clusterId;
                                if (this.isCluster(id)) clusterId = this.generateClusterIdFromVisId(id);
                                else [clusterId,] = this.generateClusterIdAndNodeIdFromVisInClusterId(id);
                                this.updateClusterPosition(clusterId, x, y);
                            }
                        }
                    }
                });

                // Set cursor to pointer when hovering over a node
                network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
                network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

                // Store the network
                this.setState({network: network}, callback);
            })
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.curProject !== this.props.curProject) {
            // Set items to null before updating to show loading icon
            this.setState({items: null}, this.renderNetwork);
            this.setCurClusterView(null);
        }

        if (prevState.showNewItemHelperMessage !== this.state.showNewItemHelperMessage) {
            if (this.state.showNewItemHelperMessage) {
                Alert.info("Click on an empty space to add your new item.",
                    0, this.disableEditMode);
            } else {
                Alert.close();
            }
        }

        if (prevProps.searchQuery !== this.props.searchQuery || prevProps.filters !== this.props.filters) {
            this.renderNetwork(null);
        }

        if (prevState.showNewClusterHelperMessage !== this.state.showNewClusterHelperMessage) {
            if (this.state.showNewClusterHelperMessage) {
                Alert.info("Release to create new cluster.",
                    0, this.disableEditMode);
            } else {
                Alert.close();
            }
        }

        if (prevState.showAddToClusterHelperMessage !== this.state.showAddToClusterHelperMessage) {
            if (this.state.showAddToClusterHelperMessage) {
                Alert.info("Release to add to cluster.",
                    0, this.disableEditMode);
            } else {
                Alert.close();
            }
        }

        if (prevState.showRemoveItemFromClusterMessage !== this.state.showRemoveItemFromClusterMessage) {
            if (this.state.showRemoveItemFromClusterMessage) {
                Alert.info("Release to move node to previous level.",
                    0, this.disableEditMode);
            } else {
                Alert.close();
            }
        }

        if (prevState.showNewClusterForm !== this.state.showNewClusterForm) {
            if (this.state.showNewClusterForm) {
                Alert.close()
            }
        }

        if (prevState.curClusterView !== this.state.curClusterView) {
            localStorage.setItem("curClusterView", JSON.stringify(this.state.curClusterView));
            // Set items and clusters to null to trigger loading spinner
            this.setState({items: null, clusters: null}, this.renderNetwork);
        }
    }

    componentDidMount() {
        if (this.state.curClusterView === null) {
            localStorage.setItem("curClusterView", JSON.stringify(null))
        }
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null || (this.state.loading && (this.state.items === null || this.state.clusters === null))) {
            return <Loader size="lg" backdrop center/>
        }
        return (
            <div>
                <div id="mindmap"/>
                {/*<Minigames*/}
                {/*    curProject={this.props.curProject}*/}
                {/*    items={this.state.items}*/}
                {/*    network={this.state.network}/>*/}
                <ItemView selectedItem={this.state.selectedItem}
                          setSelectedItem={this.setSelectedItem}
                          getSelectedItemDetails={this.getSelectedItemDetails}
                          renderNetwork={this.renderNetwork}
                          setAddItemMode={this.setAddItemMode}
                          getNodeType={this.getNodeType}
                          nodeTypes={this.state.types}/>
                <NewItemForm showNewItemForm={this.state.showNewItemForm}
                             curProject={this.props.curProject}
                             renderNetwork={this.renderNetwork}
                             switchShowNewItemForm={this.switchShowNewItemForm}
                             inputType={this.state.newItemFormType}
                             newItemData={this.state.newItemData}
                             item={this.state.item}
                             parentCluster={this.state.curClusterView}/>
                <NewClusterForm showNewClusterForm={this.state.showNewClusterForm}
                                stationaryClusterItemData={this.state.stationaryClusterItemData}
                                curProject={this.props.curProject}
                                renderNetwork={this.renderNetwork}
                                newClusterIds={this.state.newClusterIds}
                                switchShowNewClusterForm={this.switchShowNewClusterForm}
                                disableEditMode={this.disableEditMode}/>
                <BibWindow showBib={this.props.showBib} setShowBib={this.props.setShowBib}
                           curProject={this.props.curProject}/>
                <SharedProject showSharedProject={this.props.showSharedProject}
                               setShowSharedProject={this.props.setShowSharedProject}
                               curProject={this.props.curProject} updateProjects={this.props.updateProjects}/>
                <ClusterTitle curClusterView={this.state.curClusterView} setCurClusterView={this.setCurClusterView}/>
                <div onMouseOver={() => this.setState({raiseLevelButtonHover: true})}
                     onMouseOut={() => this.setState({raiseLevelButtonHover: false})}>
                        <RaiseLevelButton curClusterView={this.state.curClusterView}
                                  setCurClusterView={this.setCurClusterView} />
                </div>
                <AppFooter fit={this.fitNetworkToScreen} setAddItemMode={this.setAddItemMode}/>
            </div>
        );
    }
}

export default MindMap;