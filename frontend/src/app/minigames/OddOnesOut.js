import React from 'react';
import {
    Button, Progress, Grid
} from "rsuite";

import {randomPicker} from "../../services/RandomGenerator";
import {Network, DataSet} from "vis-network/standalone";

const {Line} = Progress;

class OddOnesOut extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.state = {
            randomItems: this.getRandomItems(),
            numPlayed: 0,
            selectedItems: [],
            show: true,
            network: null,
            visNodes: null,
            visEdges: null,
        }
    }

    componentDidMount() {
        this.renderNetwork();
    }

    // Randomly select 4 items
    getRandomItems = () => {
        return randomPicker(this.props.items, 4);
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.randomItems) {
            let node = this.state.randomItems[index];
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

        const container = document.getElementById('OddOnesOut');

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
            }
        };

        console.log("container", container, "data", data)
        // Initialize the network -- TODO: WHEN REFACTORING, CHANGE DATA and OPTIONS
        const network = new Network(container, data, options);
        network.fit();
        network.on("click", (params) => {
            if (params.nodes !== undefined && params.nodes.length > 0) {
                console.log(params);
                const nodeId = params.nodes[0];
                this.chooseItem(this.state.network.body.data.nodes.get(nodeId));
            }
        });

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({network: network}, callback);

    }

    createFinalNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        let counter = 0;
        console.log(this.state.selectedItems);
        for (let index in this.state.selectedItems) {
            let node = this.state.selectedItems[index];
            let x_position = (index % 2) ? 0 : 500;
            let y_position = (index < 2) ? 0 : 200;

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

        const container = document.getElementById('OddOnesOut');

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
            }
        };

        console.log("container", container, "data", data)
        // Initialize the network -- TODO: WHEN REFACTORING, CHANGE DATA and OPTIONS
        const network = new Network(container, data, options);
        network.fit();

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({network: network}, callback);

    }

    updateRandomItems = () => {

        this.setState({
            randomItems: this.getRandomItems(),
            // placement: 'right' // need to reset
            show: !this.state.show
            // show: false
        });
        console.log('show is false')
        console.log(this.state.show)
    }

    chooseItem = (item) => {
        console.log(item)
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            selectedItems: [...this.state.selectedItems, item],
            // placement: 'left',
            show: !this.state.show
            // show: true
        }, () => {
            this.updateRandomItems();
            console.log(this.state.selectedItems)
        });
        if (this.state.numPlayed < this.props.numRounds) {
            this.renderNetwork();
        } else{
            this.renderFinalNetwork();
        }
        // console.log(this.state.numPlayed)
        console.log('animation should show')
        console.log(this.state.show)
    }

    render() {
        // console.log(this.state)
        if (this.state.numPlayed < this.props.numRounds) {
            return (
                <Grid>
                    <h1>OddOnesOut</h1>
                    <h3>Round {this.state.numPlayed + 1}</h3>
                    <Line percent={this.state.numPlayed / 5 * 100} status='active'/>
                    <h5>Select the odd one out!</h5>
                    <div id='OddOnesOut' style={{height: 300}}/>
                </Grid>
            )           
        } else {
            return (
                <>
                    <h1>OddOnesOut</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are your selected items:</h5>
                    <div id='OddOnesOut' style={{height: 300}}/>
                </>
            )
        }
    }
}

export default OddOnesOut;
