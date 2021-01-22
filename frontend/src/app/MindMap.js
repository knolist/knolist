import React from "react";
import {
    Alert, Loader
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import SourceView from "./ItemView";
import NewSourceForm from "../components/NewItemForm";
import AppFooter from "./AppFooter";
import BibWindow from "./BibWindow";

import makeHttpRequest from "../services/HttpRequest";

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
            [types.PURESOURCE]: "red",
            [types.SOURCEANDNOTE]: "blue",
            [types.SOURCEANDHIGHLIGHT]: "green",
            [types.PURENOTE]: "purple",
            [types.NEITHER]: "orange"
        };
        this.state = {
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            items: null,
            nonSelectedNodes: null,
            sources: null,
            loading: false,
            showNewItemForm: false,
            showNewItemHelperMessage: false,
            newItemData: modes.NULL,
            modes: modes,
            newItemFormType: null,
            item: null,
            types: types,
            nodeColors: nodeColors,
            showColor: nodeColors.NULL
        };
    };

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

    getItems = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);
        const endpoint = "/projects/" + this.props.curProject.id + "/items"
        const response = await makeHttpRequest(endpoint);

        this.setLoading(false);
        this.setState({items: response.body.items}, callback);
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

    setAddItemMode = (newItemFormType, item = null) => {
        this.setState({
            newItemFormType: newItemFormType,
            item: item
        });
        this.setShowNewItemHelperMessage(true);
        if (this.state.network) this.state.network.addNodeMode();
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

    getNodeById = (nodeId) => {
        for (let index in this.state.items) {
            if (nodeId === this.state.items[index].id) {
                return this.state.items[index];
            }
        }
    }

    getNodeType = (nodeId) => {
        if (!nodeId) {
            return;
        }
        let node = this.getNodeById(nodeId);
        if (!node) return;
        //pure note
        if (!node.url) return this.state.types.PURENOTE;
        //source and note
        if (node.url && node.is_note && node.content) return this.state.types.SOURCEANDNOTE;
        //source and highlight
        if (node.url && !node.is_note && node.content) return this.state.types.SOURCEANDHIGHLIGHT;
        //pure source
        if (node.url && !node.content) return this.state.types.PURESOURCE;
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();

        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.items) {
            let node = this.state.items[index];
            let title = node.title;
            const nodeType = this.getNodeType(node.id);
            if (nodeType !== this.state.types.PURESOURCE) {
                title = node.content.substring(0, 100);
            }
            // Deal with positions
            if (node.x_position === null || node.y_position === null) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const [x, y] = this.generateNodePositions(node);
                this.updateItemPosition(node.id, x, y);

                nodes.add({id: node.id, label: title, x: x, y: y, color: this.getColor(node)});
            } else {
                nodes.add({
                    id: node.id,
                    label: title,
                    x: node.x_position,
                    y: node.y_position,
                    color: this.getColor(node)
                });
            }
            // Deal with edges
            for (let nextIndex in node.next_sources) {
                const nextId = node.next_sources[nextIndex];
                edges.add({from: node.id, to: nextId})
            }
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    getColor = (item) => {
        const nodeType = this.getNodeType(item.id); // foo
        return this.state.nodeColors[nodeType];
    }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        this.getItems(() => {
            const [nodes, edges] = this.createNodesAndEdges();

            // create a network
            const container = document.getElementById('mindmap');

            // provide the data in the vis format
            const data = {
                nodes: nodes,
                edges: edges
            };

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
                    // color: {
                    //     border: this.getColor(),
                    //     background: this.getColor()
                    // },
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
                    addNode: this.addItem
                }
            };

            // Initialize the network
            const network = new Network(container, data, options);
            network.fit()
            // Handle click vs drag
            network.on("click", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeID = params.nodes[0];
                    this.handleClickedNode(nodeID);
                }
            });

            network.on("dragStart", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.handleDragStart(nodeId, nodes)
                }
            });

            let dt = 100 //ms
            network.on("dragging", throttle((params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const id = network.getSelectedNodes()[0];
                    const boundingBox = network.getBoundingBox(id)
                    console.log(boundingBox)
                    let otherNodes = this.state.nonSelectedNodes
                    otherNodes.forEach(node => {
                        if (isOverlap(network.getBoundingBox(parseInt(node)), boundingBox)) {
                            console.log('cluster detected between', nodes.get(id).label, `(id=${id})`, 'and', nodes.get(parseInt(node)).label, `(id=${node})`)
                        }
                    })
                }
            }, dt));

            // Update positions after dragging node
            network.on("dragEnd", () => {
                // Only update positions if there is a selected node
                if (network.getSelectedNodes().length !== 0) {
                    const id = network.getSelectedNodes()[0];
                    const position = network.getPosition(id);
                    const x = position.x;
                    const y = position.y;
                    this.updateItemPosition(id, x, y);
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
    }

    componentDidMount() {
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null || (this.state.loading && this.state.items === null)) {
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
                <BibWindow showBib={this.props.showBib} setShowBib={this.props.setShowBib} curProject={this.props.curProject}/>
                <AppFooter fit={this.fitNetworkToScreen} setAddSourceMode={this.setAddSourceMode}/>
            </div>
        );
    }
}

const throttle = (func, ms) => {
    let lastFunc
    let lastRan
    return function () {
        const context = this
        const args = arguments
        if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= ms) {
                    func.apply(context, args)
                    lastRan = Date.now()
                }
            }, ms - (Date.now() - lastRan))
        }
    }
}

const isOverlap = (rectA, rectB) => {
    return (rectA.left < rectB.right && rectA.right > rectB.left &&
        rectA.bottom > rectB.top && rectA.top < rectB.bottom)
}

export default MindMap;