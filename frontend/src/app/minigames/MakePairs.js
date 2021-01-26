import React, {useState} from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton, Button, Animation, Progress, Input, Form, FormControl, Schema, FormGroup, Divider
} from "rsuite";
import { Network, DataSet } from "vis-network/standalone";


import {randomPicker} from "../../services/RandomGenerator"

const { Line } = Progress;

const { Slide } = Animation;

// const model = Schema.Model({
//     common: Schema.Types.StringType().isRequired('This field is required')
// });

class MakePairs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomSources: this.getRandomSources(),
            numPlayed: 0,
            // numRounds: 5,
            connections: [],
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            sources: null,
            loading: false,
        }
        console.log("numRounds", this.props.numRounds)
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.randomSources) {
            let node = this.state.randomSources[index];
            // Positions should be fixed 
            // [0] [1]
            // [2] [3]
            let x_position = (index % 2) ? 0 : 500;
            let y_position = (index < 2) ? 0 : 200;

            nodes.add({ id: node.id, label: node.title, x: x_position, y: y_position });
            // // Deal with positions
            // if (node.x_position === null || node.y_position === null) {
            //     // If position is still undefined, generate random x and y in interval [-300, 300]
            //     const [x, y] = this.generateNodePositions(node);
            //     this.updateSourcePosition(node.id, x, y);
            //     nodes.add({ id: node.id, label: node.title, x: x, y: y });
            // } else {
            //     nodes.add({ id: node.id, label: node.title, x: node.x_position, y: node.y_position });
            // }
            // // Deal with edges
            // for (let nextIndex in node.next_sources) {
            //     const nextId = node.next_sources[nextIndex];
            //     edges.add({ from: node.id, to: nextId })
            // }
        }
        this.setState({ visNodes: nodes, visEdges: edges });
        return [nodes, edges];
    }

    
    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        // this.getSources(() => {
            // TODO? 
            const [nodes, edges] = this.createNodesAndEdges();

            // create a network
            const container = document.getElementById('MakePairs');

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
                    widthConstraint: {
                        maximum: 500
                    }
                },
                edges: {
                    // arrows: {
                    //     to: {
                    //         enabled: true
                    //     }
                    // },
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
                    // TODO
                    addEdge: this.addEdgeConnection
                }
            };

            console.log("container", container, "data", data)
            // Initialize the network -- TODO: WHEN REFACTORING, CHANGE DATA and OPTIONS
            const network = new Network(container, data, options);
            network.fit()

            // Handle click vs drag
            network.on("click", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    // console.log("PARAM NODES:", params.nodes);
                    // this.handleClickedNode(nodeId);
                    // console.log("nodeId", nodeId);
                    if (this.state.from_id === null || this.state.from_id === nodeId) {
                        this.setState({from_id: nodeId});
                    } else {
                        this.addEdgeConnection(this.state.from_id, nodeId); // Node Id will be to!
                        this.setState({from_id: null});
                    }
                    // Network.addEdgeMode();
                }
            });

            // // Update positions after dragging node
            // network.on("dragEnd", () => {
            //     // Only update positions if there is a selected node
            //     if (network.getSelectedNodes().length !== 0) {
            //         const id = network.getSelectedNodes()[0];
            //         const position = network.getPosition(id);
            //         const x = position.x;
            //         const y = position.y;
            //         this.updateSourcePosition(id, x, y);
            //     }
            // });

            // Set cursor to pointer when hovering over a node
            network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
            network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

            // Store the network
            this.setState({ network: network }, callback);

    }

    addEdgeConnection = (from_id, to_id) => {
        this.state.network.body.data.edges.add([{ from: from_id, to: to_id }])
        // Add connections to state
        const fromLabel = this.state.network.body.data.nodes.get(from_id).label;  
        const toLabel = this.state.network.body.data.nodes.get(to_id).label;
        // console.log("from", fromLabel)
        // console.log("to", toLabel)
        this.setState({
            connections: [...this.state.connections, {from: fromLabel, to: toLabel}]
        })
    }

    // Randomly select 4 sources
    getRandomSources = () => {
        return randomPicker(this.props.sources, 4);
    }

    updateRandomSources = () => {
        this.setState({
            randomSources: this.getRandomSources(),
        })
    }
    
    submitSources = () => {
        console.log("network", this.state.network);
        this.setState({
            numPlayed: this.state.numPlayed + 1,
        }, this.updateRandomSources)
        if (this.state.numPlayed < this.props.numRounds)
            this.renderNetwork();
    }

    componentDidMount() {
        // const container = document.getElementById('MakePairs');
        // console.log(container)
        this.renderNetwork();
    }

    render() {
        console.log(this.state)
        if (this.state.numPlayed < this.props.numRounds)
            return (
                <>
                    <h1>Make Pairs</h1>
                        <h3>Round {this.state.numPlayed + 1}</h3>
                        <Line percent={this.state.numPlayed / 5 * 100} status='active' />
                        <h5>Click on the sources you think are related to make a connection!</h5>
                <div id='MakePairs' style={{height: 480}}/>
                {/* <div id='MakePairs'>  */}
                    <Form onSubmit={this.submitSources}>
                        <Button appearance="primary" color='blue' 
                        style={{margin: 20, display: 'block'}} 
                        type='submit'>Next</Button>
                    </Form> 

                </>          
            )
            else {
                return (
                    <>
                    <h1>Make Pairs</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are the connections you have identified:</h5>
                        {this.state.connections.slice(1, this.state.connections.length).map((connection, index) => [
                        <Button key={index} appearance="primary" color='blue' style={{ margin: 20}}>{connection.from}</Button>,
                        // <Button key={index} appearance="primary" color='blue' style={{ margin: 20, display: 'block' }}>{connection.from}</Button>,
                        // <p key={index + 50}>is related to</p>,
                        <Divider key={index + 50}>is related to</Divider>,
                        <Button key={index + 100} appearance="primary" color='blue' style={{ margin: 20}}>{connection.to}</Button>,
                        <Divider key={index + 200}/>])}
                </>
            )
        }
    }
}

export default MakePairs;
