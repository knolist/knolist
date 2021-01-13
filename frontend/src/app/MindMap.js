import React from "react";
import {
    Alert,  Loader
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";

import SourceView from "./SourceView";
import NewSourceForm from "../components/NewSourceForm";
import AppFooter from "./AppFooter";

import makeHttpRequest from "../services/HttpRequest";

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        const modes = {
            NULL:null,
            URL:"url",
            NOTES:"notes"
        };
        const types = {
            NULL:null,
            PURESOURCE: "pureSource",
            SOURCEANDNOTE: "sourceAndNote",
            SOURCEANDHIGHLIGHT: "sourceAndHighlight",
            PURENOTE: "pureNote"
        }
        const colors = {
            NULL:null,
            RED:"red",
            BLUE:"blue",
            GREEN:"green",
            PURPLE:"purple",
            ORANGE:"orange"
    };
        this.state = {
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            sources: null,
            loading: false,
            showNewSourceForm: false,
            showNewSourceHelperMessage: false,
            newSourceData: modes.NULL,
            modes:modes,
            newSourceFormType: null,
            source: null,
            types: types,
            typeOfSource: types.NULL,
            colors:colors,
            showColor:colors.NULL
        };
    };

    setSelectedNode = (id) => {
        this.setState({selectedNode: id})
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

    setLoading = (val) => {
        this.setState({loading: val});
    }

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        // const response = await makeHttpRequest(endpoint);
        const pureSource = {
            id: 1,
            next_sources: [],
            prev_sources: [],
            url: "https://en.wikipedia.org/wiki/Main_Page",
            title: "wiki1",
            project_id: 1,
            is_note: false,
            is_highlight: false,
            content: null,
            x_position: 150,
            y_position: -30
        }
        const sourceAndNote = {
            id: 2,
            next_sources: [],
            prev_sources: [],
            url: "https://en.wikipedia.org/wiki/Main_Page",
            title: "wiki2",
            project_id: 1,
            is_note: true,
            is_highlight: false,
            content: "This is a note",
            x_position: 10,
            y_position: -100
        }
        const sourceAndHighlight = {
            id: 3,
            next_sources: [],
            prev_sources: [],
            url: "https://en.wikipedia.org/wiki/Main_Page",
            title:"wiki3",
            project_id: 1,
            is_note: false,
            is_highlight: true,
            content: "This is a highlight",
            x_position: 50,
            y_position: -30
        }
        const pureNote = {
            id: 4,
            next_sources: [],
            prev_sources: [],
            url: null,
            title:"wiki4",
            project_id: 1,
            is_note: true,
            is_highlight: false,
            content: "This is a pure note",
            x_position: 250,
            y_position: -10
        }
        const sources = [pureSource, sourceAndNote, sourceAndHighlight, pureNote];
        const response = {
            body: {
                sources: sources
            },
            status: 200
        }
        this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
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

    switchShowNewSourceForm = () => {
        this.setState({showNewSourceForm: !this.state.showNewSourceForm}, () => {
            // Get out of edit mode if necessary
            if (!this.state.showNewSourceForm) {
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

    setAddSourceMode = (newSourceFormType, source = null) => {
        this.setState({
            newSourceFormType: newSourceFormType,
            source: source
        });
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

    getNodeType = (node) => {
        if (node.url === null) return this.state.types.PURESOURCE;
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.sources) {
            let node = this.state.sources[index];
            // Deal with positions
            if (node.x_position === null || node.y_position === null) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const [x, y] = this.generateNodePositions(node);
                this.updateSourcePosition(node.id, x, y);
                
                // const nodeType = this.getNodeType(node);
                // if (nodeType === this.state.nodeTypes.PURESOURCE) {
                //     let title = node.content.trim(100);
                // }
                nodes.add({id: node.id, label: node.title, x: x, y: y, color:this.getColor(node)});
            } else {
                nodes.add({id: node.id, label: node.title, x: node.x_position, y: node.y_position, color:this.getColor(node)});
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

    getColor = (source) => {
        let color = this.state.colors.ORANGE;
        if (source.url && !source.is_highlight && !source.is_note) {
            // pure source
            color = this.state.colors.RED;
        } else if (source.url && !source.is_highlight && source.is_note) {
            //note and source
            color = this.state.colors.BLUE;
        } else if (source.url && source.is_highlight && !source.is_note) {
            //highlight and source
            color = this.state.colors.PURPLE;
        } else if (!source.url && !source.is_highlight && source.is_note) {
            //pure note
            color = this.state.colors.GREEN;
        }
        return color;
     }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        this.getSources(() => {
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
                    addNode: this.addSource
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

            // Update positions after dragging node
            network.on("dragEnd", () => {
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
                            renderNetwork={this.renderNetwork}
                            setAddSourceMode={this.setAddSourceMode}/>
                <NewSourceForm showNewSourceForm={this.state.showNewSourceForm}
                            curProject={this.props.curProject}
                            renderNetwork={this.renderNetwork}
                            switchShowNewSourceForm={this.switchShowNewSourceForm}
                            inputType={this.state.newSourceFormType}
                            newSourceData={this.state.newSourceData}
                            source={this.state.source} />
                <AppFooter fit={this.fitNetworkToScreen} setAddSourceMode={this.setAddSourceMode}/>
            </div>
        );
    }
}

export default MindMap;