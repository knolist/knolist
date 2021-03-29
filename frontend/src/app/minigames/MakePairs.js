import React from 'react';
import {
    Button, Progress, Form, Divider, Grid, Alert
} from "rsuite";
import {Network, DataSet} from "vis-network/standalone";


import {randomPicker} from "../../services/RandomGenerator"

const {Line} = Progress;

class MakePairs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            randomItems: this.getRandomItems(),
            numPlayed: 0,
            // numRounds: 5,
            connections: [],
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            items: null,
            loading: false,
            pairCount: 0,
            finalNetwork: false
        }
        console.log("numRounds", this.props.numRounds)
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.randomItems) {
            let node = this.state.randomItems[index];
            // Positions should be fixed 
            // [0] [1]
            // [2] [3]
            let x_position = (index % 2) ? 0 : 500;
            let y_position = (index < 2) ? 0 : 200;

            nodes.add({id: node.id, label: this.props.generateDisplayValue(node), x: x_position, y: y_position, color: this.props.color(node)});
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }


    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        // this.getItems(() => {
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
                color: "black",
                physics: false,
                smooth: false,
                hoverWidth: 0
            },
            interaction: {
                selectConnectedEdges: false,
                hover: true,
                hoverConnectedEdges: false,
                zoomView: false,
                dragView: false
            },
            manipulation: {
                enabled: false,
                // TODO
                addEdge: (data, callback) => {
                    console.log('add edge', data);
                    if (data.from != data.to) {
                        callback(data);
                        this.addEdgeConnection(data.from, data.to);
                        network.addEdgeMode();
                    }
                    // after each adding you will be back to addEdge mode
                    
                }
            },
        };

        console.log("container", container, "data", data)
        // Initialize the network -- TODO: WHEN REFACTORING, CHANGE DATA and OPTIONS
        const network = new Network(container, data, options);
        network.addEdgeMode();
        network.fit()

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({network: network}, callback);

    }

    createFinalNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        let counter = 0;
        // Iterate through each node in the graph and build the arrays of nodes and edges
        console.log(this.state.connections);
        const offset = 100;
        for (let index in this.state.connections) {
            let node = this.state.connections[index];
            // Positions should be fixed 
            // [0] [1]
            // [2] [3]
            let x_position = (index % 2) ? 0 : 500;
            let y_position = offset * Math.floor(counter/2);
            if (counter % 2 == 1) {
                edges.add([{from: counter, to: counter - 1}])
            }
            nodes.add({id: counter, label: node.label, x: x_position, y: y_position, color: node.color});

            counter += 1;
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }


    renderFinalNetwork = (callback) => {
        if (this.props.curProject === null) return;
        

        // this.getItems(() => {
        // TODO?
        const [nodes, edges] = this.createFinalNodesAndEdges();
        console.log(nodes, edges);

        // create a network
        const container = document.getElementById('MakePairs');

        // provide the data in the vis format
        const data = {
            nodes: nodes,
            edges: edges
        };
        console.log(data);
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
                color: "black",
                physics: false,
                smooth: false,
                hoverWidth: 0
            },
            interaction: {
                selectConnectedEdges: false,
                hover: true,
                hoverConnectedEdges: false,
                zoomView: false,
                dragView: false
            },
            manipulation: {
                enabled: false,
                // TODO
            },
        };

        console.log("container", container, "data", data)
        // Initialize the network -- TODO: WHEN REFACTORING, CHANGE DATA and OPTIONS
        const network = new Network(container, data, options);
        network.fit()

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({finalNetwork: true, network: network}, callback);

    }

    addEdgeConnection = (from_id, to_id) => {
        let pairCountCurr = this.state.pairCount + 1;
        this.state.network.body.data.edges.add([{from: from_id, to: to_id}])
        // Add connections to state
        console.log(this.state.network.body.data);
        const fromLabel = this.state.network.body.data.nodes.get(from_id);
        const toLabel = this.state.network.body.data.nodes.get(to_id);
        this.setState({
            connections: [...this.state.connections, fromLabel, toLabel],
            pairCount: pairCountCurr
        }, () => {
            if (this.state.pairCount == 2) {
                this.submitItems();
            }
        })
    }

    // Randomly select 4 items
    getRandomItems = () => {
        return randomPicker(this.props.items, 4);
    }

    updateRandomItems = () => {
        this.setState({
            randomItems: this.getRandomItems(),
        }, () => {
            if (this.state.numPlayed < this.props.numRounds) {
                this.renderNetwork();
            } else {
                this.renderFinalNetwork();
            }
        })
    }

    submitItems = () => {
        console.log("network", this.state.network);
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            pairCount: 0
        }, this.updateRandomItems)
    }

    componentDidMount() {
        this.renderNetwork();
    }

    render() {
        if (this.state.numPlayed < this.props.numRounds)
            return (
                <Grid>
                    <h1>Make Pairs</h1>
                    <h3>Round {this.state.numPlayed + 1}</h3>
                    <Line percent={this.state.numPlayed / 5 * 100} status='active'/>
                    <div id='MakePairs' style={{height: 300}}/>

                </Grid>
            )
        else {
            const height = 50 * this.state.connections.length;
            return (
                <>
                    <h1>Make Pairs</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are the connections you have identified:</h5>
                    <div id='MakePairs' style={{height: height}}/>
                </>
            )
        }
    }
}

export default MakePairs;
