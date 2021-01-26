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
// import Minigames from "./Minigames";

import RaiseLevelButton from "../components/RaiseLevelButton"

import makeHttpRequest, {constructHttpQuery} from "../services/HttpRequest";

import throttle from "../util/throttle";
import isOverlap from "../util/isOverlap"

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
            newClusterIDs: null,
            existingClusterID: null,
            curClusterView: null
        };
    };

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
        this.setState({curClusterView: id})
    }

    handleDragStart = (id, nodes) => {
        this.setNonSelectedNodes(id, nodes);
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
            const cur = this.state.curClusterView
            const endpoint = "/clusters/" + cur.substring(
                cur.lastIndexOf("c") + 1,
                cur.lastIndexOf("_")
            )
            const response = await makeHttpRequest(endpoint)
            const children = response.body.cluster.child_items.map(child => makeHttpRequest('/items/' + child))
            Promise.all(children).then(values => {
                this.setLoading(false);
                this.setState({items: values.map(child => child.body.item)}, callback)
            })
        }
    }

    getClusters = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true)
        if (this.state.curClusterView === null) {
            const endpoint = "/projects/" + this.props.curProject.id + "/clusters"
            const response = await makeHttpRequest(endpoint)
            this.setLoading(false)
            this.setState({clusters: response.body.clusters}, callback)
        } else {
            const cur = this.state.curClusterView
            const endpoint = "/clusters/" + cur.substring(
                cur.lastIndexOf("c") + 1,
                cur.lastIndexOf("_")
            )
            const response = await makeHttpRequest(endpoint)
            const children = response.body.cluster.child_clusters.map(child => makeHttpRequest('/clusters/' + child))
            Promise.all(children).then(values => {
                this.setLoading(false);
                this.setState({clusters: values.map(child => child.body.cluster)}, callback)
            })
        }
    }

    updateItemPosition = async (itemId, x, y) => {
        const endpoint = "/items/" + itemId;
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
        this.setShowNewItemHelperMessage(false);
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

    setshowAddToClusterHelperMessage = (val) => {
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

    addItemToCluster = async (clusterId, itemId) => {
        const endpoint = "/clusters/" + clusterId + "/items/" + itemId
        await makeHttpRequest(endpoint, "PATCH", {});
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
                .filter(cluster => cluster.child_items.includes(parseInt(this.state.items[index].id))).length === 0) {
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
        let clusterNodes = new DataSet()
        if (this.state.clusters.length === 0) {
            return clusterNodes
        }
        // let projectClusters = this.state.clusters.filter(
        //         cluster => (cluster.project_id === this.props.curProject.id))
        let projectClusters = this.state.clusters
        console.log('ok', this.state.items)
        projectClusters.forEach(cluster => {
            console.log(cluster)
            clusterNodes.add({
                group: 'clusters',
                id: "c" + cluster.id + "_" + cluster.name,
                label: '-----------------------------------------------------', // :(
                x: cluster.x_position,
                y: cluster.y_position
            })
            // TODO: render title
            if (cluster.child_items.length > 2) {
                // TODO: render +2, +3, etc. below cluster
            }
            let count = 0;
            console.log(cluster.child_items)
            cluster.child_items.forEach(child => {
                const title = this.state.items.filter(item => item.id === child)[0].title
                if (count === 0) {
                    clusterNodes.add({
                        group: 'inCluster',
                        id: "i" + child,
                        label: title,
                        x: cluster.x_position,
                        y: cluster.y_position - 40,
                        widthConstraint: {
                            maximum: 170
                        }
                    })
                } else if (count === 1) {
                    clusterNodes.add({
                        group: 'inCluster',
                        id: "i" + child,
                        label: title,
                        x: cluster.x_position,
                        y: cluster.y_position + 40,
                        widthConstraint: {
                            maximum: 170
                        }
                    })
                }
                count = count + 1
            })
        })
        return clusterNodes
    }

    renderNetwork = (callback) => {
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
                                border: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"],
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
                            color: {
                                background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
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
                            color: {
                                background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
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
                        if (typeof nodeId === "number") {
                            this.handleClickedNode(nodeId);
                        } else if (typeof nodeId === "string" && nodeId.includes('c')) {
                            this.handleClickedCluster(nodeId)
                        }
                    }
                });

                network.on("dragStart", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        if (typeof nodeId === "string" && nodeId.includes('c')) {
                            network.selectNodes(this.state.clusters.filter(cluster =>
                                cluster.project_id === this.props.curProject.id
                                && nodeId.includes(cluster.name))[0].child_items.slice(0, 2).map(nodeId => 'i' + nodeId).concat([nodeId]))
                        } else if (typeof nodeId === "string" && nodeId.includes('i')) {
                            const cluster = this.state.clusters.filter(cluster => cluster.project_id === this.props.curProject.id &&
                                cluster.child_items.includes(parseInt(nodeId.replace('i', ''))))[0]
                            network.selectNodes(cluster.child_items.slice(0, 2).map(nodeId => 'i' + nodeId).concat(['c' + cluster.id + '_' + cluster.name]))

                        } else {
                            this.handleDragStart(nodeId, nodes)
                        }
                    }
                });
                let dt = 100 //ms
                network.on("dragging", throttle((params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const id = network.getSelectedNodes()[0];
                        if (typeof id === "number") {
                            const boundingBox = network.getBoundingBox(id)
                            let otherNodes = this.state.nonSelectedNodes
                            if ((!this.state.showNewClusterHelperMessage && !this.state.showAddToClusterHelperMessage)
                                && otherNodes.length >= 1) {
                                otherNodes.forEach(node => {
                                    if (typeof node === "number" && isOverlap(network.getBoundingBox(node), boundingBox)) {
                                        this.setState({stationaryClusterItemData: network.getPosition(node)})
                                        this.setState({newClusterIDs: {"item1": id, "item2": node}})
                                        this.setShowNewClusterHelperMessage(true)
                                    } else if (typeof node === "string" && node.includes('c') && isOverlap(network.getBoundingBox(node), boundingBox)) {
                                        this.setState({existingClusterID: node})
                                        this.setshowAddToClusterHelperMessage(true)
                                    }
                                })
                            } else {
                                if (this.state.newClusterIDs && !isOverlap(boundingBox, network.getBoundingBox(this.state.newClusterIDs.item2))) {
                                    this.setShowNewClusterHelperMessage(false)
                                }
                                if (this.state.existingClusterID && !isOverlap(boundingBox, network.getBoundingBox(this.state.existingClusterID))) {
                                    this.setshowAddToClusterHelperMessage(false)
                                }
                            }
                        }
                    }
                }, dt));

                // Update positions after dragging node
                network.on("dragEnd", () => {
                    // Only update positions if there is a selected node
                    if (network.getSelectedNodes().length !== 0) {
                        if (this.state.showNewClusterHelperMessage) {
                            this.setState({showNewClusterForm: true})
                        }
                        if (this.state.showAddToClusterHelperMessage) {
                            const existingCluster = this.state.existingClusterID
                            const id = existingCluster.substring(
                                existingCluster.lastIndexOf("c") + 1,
                                existingCluster.lastIndexOf("_")
                            )
                            this.addItemToCluster(id, network.getSelectedNodes()[0])
                            this.setshowAddToClusterHelperMessage(false)
                            this.renderNetwork()
                        }
                        const id = network.getSelectedNodes()[0];
                        if (typeof id === "number") {
                            const position = network.getPosition(id);
                            const x = position.x;
                            const y = position.y;
                            this.updateItemPosition(id, x, y);
                        } else if (typeof id === "string" && id.includes('c')) {
                            // TODO: update cluster position on backend
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

        if (prevState.showNewClusterForm !== this.state.showNewClusterForm) {
            if (this.state.showNewClusterForm) {
                Alert.close()
            }
        }

        if (prevState.curClusterView !== this.state.curClusterView) {
            localStorage.setItem("curClusterView", JSON.stringify(this.state.curClusterView))
            this.renderNetwork()
        }
    }

    componentDidMount() {
        if (this.state.curClusterView === null) {
            localStorage.setItem("curClusterView", JSON.stringify(null))
        }
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null || (this.state.loading && this.state.items === null)) {
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
                <BibWindow showBib={this.props.showBib} setShowBib={this.props.setShowBib}
                           curProject={this.props.curProject}/>
                <RaiseLevelButton isRoot={this.state.curClusterView === null}/>
                <AppFooter fit={this.fitNetworkToScreen} setAddItemMode={this.setAddItemMode}/>
            </div>
        );
    }
}

export default MindMap;