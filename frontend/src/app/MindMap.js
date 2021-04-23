import React from "react";
import {
    Alert, Loader
} from "rsuite";
import {Network} from "vis-network/standalone";

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
import * as utils from "./MindMapUtils.js";

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
        const isCluster = utils.isCluster(this.state.visNodes.get(nodeId));
        const isItemInCluster = utils.isItemInCluster(this.state.visNodes.get(nodeId));
        if (isCluster || isItemInCluster) {
            const numDisplayedChildNodes = 2;
            let cluster, visClusterId;
            if (isCluster) {
                cluster = this.state.clusters.find(cluster => cluster.id === utils.generateClusterIdFromVisId(nodeId));
                visClusterId = nodeId;
            } else {
                cluster = this.state.clusters.find(cluster => cluster.id === utils.generateClusterIdAndNodeIdFromVisInClusterId(nodeId)[0]);
                visClusterId = utils.generateVisClusterId(cluster);
            }
            const childNodes = cluster.child_items.slice(0, numDisplayedChildNodes);
            const childNodesIds = childNodes.map(node => utils.generateVisInClusterId(cluster, "item", node));
            const clusterTitleId = utils.generateVisInClusterId(cluster, "title");
            const nodesToMove = childNodesIds.concat([visClusterId, clusterTitleId]);
            // Include node count if necessary
            if (cluster.child_items.length > 2) {
                const clusterCountId = utils.generateVisInClusterId(cluster, "count");
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

    // Helper function to setup the nodes for the graph
    createNodes() {
        const nodes = utils.createNodesHelper(this.state.items, this.state.clusters, this.props.curProject);
        this.setState({visNodes: nodes});
        return nodes;
    }

    renderNetwork = (callback) => {
        if (this.props.curProject === null) return;

        this.getItems(() => {
            this.getClusters(() => {
                let nodes = this.createNodes();
                const clusterNodes = utils.createClusters(this.state.clusters);
                clusterNodes.forEach(cluster => {
                    nodes.add(cluster)
                })

                // create a network
                const container = document.getElementById('mindmap');

                // provide the data in the vis format
                const data = {
                    nodes: nodes
                };

                const options = utils.options;
                options.manipulation = {
                    enabled: false,
                    addNode: this.addItem
                }

                // Initialize the network
                const network = new Network(container, data, options);
                network.fit();

                // Handle click vs drag
                network.on("click", (params) => {
                    if (params.nodes !== undefined && params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        if (utils.isItem(this.state.visNodes.get(nodeId))) {
                            this.handleClickedNode(nodeId);
                        } else if (utils.isCluster(this.state.visNodes.get(nodeId)) || utils.isItemInCluster(this.state.visNodes.get(nodeId))) {
                            let clusterId;
                            if (utils.isItemInCluster(this.state.visNodes.get(nodeId))) {
                                clusterId = utils.generateClusterIdAndNodeIdFromVisInClusterId(nodeId)[0];
                            } else {
                                clusterId = utils.generateClusterIdFromVisId(nodeId);
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
                        if (utils.isItem(this.state.visNodes.get(id))) {
                            const boundingBox = network.getBoundingBox(id);
                            let otherNodes = this.state.nonSelectedNodes;
                            if ((!this.state.showNewClusterHelperMessage && !this.state.showAddToClusterHelperMessage)
                                 && otherNodes.length >= 1) {
                                otherNodes.forEach(node => {
                                    if (isOverlap(network.getBoundingBox(node), boundingBox)) {
                                        if (utils.isItem(this.state.visNodes.get(node))) {
                                            this.setState({stationaryClusterItemData: network.getPosition(node)})
                                            this.setState({newClusterIds: {"item1": id, "item2": node}})
                                            this.setShowNewClusterHelperMessage(true)
                                        } else if (utils.isCluster(this.state.visNodes.get(node))) {
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
                                if (this.state.curClusterView && !this.state.raiseLevelButtonHover) {
                                    this.setState({showRemoveItemFromClusterMessage: false});
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
                            const id = utils.generateClusterIdFromVisId(existingCluster);
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
                            if (utils.isItem(this.state.visNodes.get(id))) {
                                utils.updateItemPosition(id, x, y);
                            } else if (utils.isCluster(this.state.visNodes.get(id)) || utils.isItemInCluster(this.state.visNodes.get(id))) {
                                let clusterId;
                                if (utils.isCluster(this.state.visNodes.get(id))) clusterId = utils.generateClusterIdFromVisId(id);
                                else [clusterId,] = utils.generateClusterIdAndNodeIdFromVisInClusterId(id);
                                utils.updateClusterPosition(clusterId, x, y);
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
            <div style={{height:"100%"}}>
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
                          getNodeType={utils.getNodeType}
                          nodeTypes={utils.types}/>
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
                           curProject={this.props.curProject}
                           curCluster={this.state.curClusterView} />
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