import React from 'react';
import {
<<<<<<< HEAD
    Alert, Button, Progress, Input, Form, FlexboxGrid, Grid, Row, ButtonToolbar
} from "rsuite";
import FlexboxGridItem from 'rsuite/lib/FlexboxGrid/FlexboxGridItem';
import {Network, DataSet} from "vis-network/standalone";
=======
    Button, Progress, Input, Form, Grid, Row
} from "rsuite";
// import FlexboxGridItem from 'rsuite/lib/FlexboxGrid/FlexboxGridItem';
>>>>>>> dev

import {randomPicker} from "../../services/RandomGenerator";

import {randomSimilarPicker} from "../../services/RandomGenerator"

const {Line} = Progress;

class FindCommonality extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.state = {
            randomItems: this.getRandomItems(),
            numPlayed: 0,
            commonality: [],
            commonId: 'common-Id',
            network: null,
            visNodes: null,
            visEdges: null,
        }
    }

    componentDidMount() {
        this.renderNetwork();
    }

    // Randomly select 2 items
    getRandomItems = () => {
        // return randomSimilarPicker(this.props.items, 2, this.props.similarity);
        return randomPicker(this.props.items, 2);
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

    updateRandomItems = () => {
        this.setState({
            randomItems: this.getRandomItems(),
        }, () => {
            if (this.state.numPlayed < this.props.numRounds) {
                this.renderNetwork();
            }
        })
    }

    submitCommon = () => {
        let textarea = document.getElementById(this.state.commonId);
        // console.log(textarea.value);
        this.setState({
            numPlayed: this.state.numPlayed + 1,
            commonality: [...this.state.commonality, textarea.value],
        }, this.updateRandomItems)
        // Clear text area
        textarea.value = "";
    }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        const [nodes, edges] = this.createNodesAndEdges();

        // create a network
        const container = this.container.current;

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
        this.setState({network: network}, callback);

    }

    render() {
        if (this.state.numPlayed < this.props.numRounds)
            return (
                <>
                                    
                    <Grid>
                        <Row>
                            <h1>What comes to mind?</h1>
                            <h3>Round {this.state.numPlayed + 1}</h3>
                        </Row>
                        <Row>
                            <Line percent={this.state.numPlayed / 5 * 100} status='active'/>
                        </Row>
                        <Row style={{marginTop: "10px"}}>
                            <h5>What is the commonality between the following?</h5>
                        </Row>
                        <div ref={this.container} />
                        <Row style={{marginTop: "20px"}}>                            
                            <Form onSubmit={this.submitCommon}>
                                <Input autoFocus type="text" required componentClass="textarea" id={this.state.commonId}
                                    rows={5} placeholder="Write your thoughts here..."/>
                                <Button appearance="primary" color='blue'
                                        style={{display: 'block', marginTop: "20px"}}
                                        type='submit'>Next</Button>

                            </Form>
                        </Row>  
                    </Grid>
                </>
            )
        else {
            return (
                <>
                    <h1>What comes to mind?</h1>
                    <h3>Well Done!</h3>
                    <h5>Hope you found some inspirations to explore more!</h5>
                    <h5>Here are the common themes you have identified:</h5>
                    <ul>
                        {this.state.commonality.map((common, index) => <li key={index}>{common}</li>)}
                    </ul>
                </>
            )
        }
    }
}

export default FindCommonality;
