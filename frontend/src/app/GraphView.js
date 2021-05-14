import React from 'react';
import {
    Button, Progress, Grid
} from "rsuite";

import {randomPicker} from "../services/RandomGenerator";

import {randomSimilarPicker} from "../services/RandomGenerator";
import {Network, DataSet} from "vis-network/standalone";
import ClusterTitle from "../components/ClusterTitle.js";

const {Line} = Progress;

class GraphView extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.state = {
            numPlayed: 0,
            selectedItems: [],
            show: true,
            network: null,
            visNodes: null,
            visEdges: null,
            clusters: null,
            curCluster: null,
            curClusterView: null
        }
    }

    componentDidMount() {
        this.setState({
            clusters: this.props.clusters,
            curCluster: this.props.curCluster,
            curProject: this.props.curProject
        }, this.renderNetwork());
 
    }

    isItem = (id) => {
        const node = this.state.visNodes.get(id);
        if (node) return node.group === "items";
        return false;
    }

    handleClickedCluster = (id) => {
        this.setCurClusterView(this.state.visNodes.find(x => x.id === id))
    }

    setCurClusterView = (cluster) => {
        this.setState({curClusterView: cluster})
    }

    componentDidUpdate(prevProps) {
        if (prevProps.clusters !== this.props.clusters) {
            this.setState({
                clusters: this.props.clusters
            }, this.renderNetwork());
        }
        if (prevProps.curCluster !== this.props.curCluster) {
            this.setState({
                curCluster: this.props.curCluster
            }, this.renderNetwork());
        }
        if (prevProps.curProject !== this.props.curProject) {
            this.setState({
                curProject: this.props.curProject
            }, this.renderNetwork());
        }
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        nodes.add({id: -1, label: this.props.curProject.title, color: 'orange'});
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.clusters) {
            let node = this.state.clusters[index];

            nodes.add({id: node.id, label: node.name});
            edges.add([{from: -1, to: node.id}]);
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        // this.getItems(() => {
        // TODO?
        const [nodes, edges] = this.createNodesAndEdges();

        const container = document.getElementById('GraphView');

        // provide the data in the vis format
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {
            nodes: {
                shape: "circle",
                size: 16,
                margin: 10,
                physics: true,
                chosen: false,
                font: {
                    face: "Apple-System",
                    color: "white"
                },
                // color: {
                //     background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
                // },
                widthConstraint: {
                    maximum: 500
                }
            },
            edges: {
                color: "black",
                physics: true,
                smooth: false,
                length: 200,
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
                const nodeId = params.nodes[0];
                console.log(params.nodes)
                this.props.handleClickedCluster(nodeId)
            }
        });

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({network: network}, callback);

    }

    render() {
        // console.log(this.state)
        return (
            <>
                <div id='GraphView' style={{height: 300}}/>
            </>
        )           
    }
}

export default GraphView;
