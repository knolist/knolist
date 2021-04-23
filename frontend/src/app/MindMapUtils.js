import makeHttpRequest from "../services/HttpRequest";
import { DataSet } from "vis-network/standalone";

const generateVisClusterId = (cluster) => "c" + cluster.id;


const generateClusterIdFromVisId = (visClusterId) =>
  parseInt(visClusterId.substring(visClusterId.indexOf("c") + 1));


const generateVisInClusterId = (cluster, type, node) => {
  let firstPart = "c" + cluster.id;
  let secondPart;
  if (type === "item") secondPart = "i" + node.id;
  else if (type === "title") secondPart = "t";
  else if (type === "count") secondPart = "n";
  return firstPart + secondPart;
}


const generateClusterIdAndNodeIdFromVisInClusterId = (visInClusterId) => {
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


const updateItemPosition = (itemId, x, y) => {
  const endpoint = "/items/" + itemId;
  const body = {
    "x_position": x,
    "y_position": y
  }
  makeHttpRequest(endpoint, "PATCH", body).then();
}


const updateClusterPosition = (clusterId, x, y) => {
  const endpoint = "/clusters/" + clusterId;
  const body = {
    "x": x,
    "y": y
  }
  makeHttpRequest(endpoint, "PATCH", body).then();
}


const getNodePosition = (node) => {
  let x = node.x_position;
  let y = node.y_position;
  if (x === null || y === null) {
    // If position is still undefined, generate random x and y in interval [-300, 300]
    [x, y] = generateNodePositions(node);
    updateItemPosition(node.id, x, y);
  }
  return [x, y];
}


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
}


const types = {
  NULL: null,
  PURESOURCE: "pureSource",
  SOURCEANDNOTE: "sourceAndNote",
  SOURCEANDHIGHLIGHT: "sourceAndHighlight",
  PURENOTE: "pureNote",
  NEITHER: "neither"
}


const getNodeType = (node) => {
  if (!node) return types.NULL;
  //pure note
  if (!node.url) return types.PURENOTE;
  //source and note
  if (node.url && node.is_note && node.content) return types.SOURCEANDNOTE;
  //source and highlight
  if (node.url && !node.is_note && node.content) return types.SOURCEANDHIGHLIGHT;
  //pure source
  if (node.url && !node.content) return types.PURESOURCE;
}


const getNodeLabel = (node, nodeType) => {
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


const isItem = (node) => {
  if (node) return node.group === "items";
  return false;
}


const isCluster = (node) => {
  if (node) return node.group === "clusters";
  return false;
}


const isItemInCluster = (node) => {
  if (node) return node.group === "inCluster";
  return false;
}


/* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
function generateNodePositions(node) {
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


const getColor = (item) => {
  const nodeColors = {
    NULL: null,
    [types.PURESOURCE]: "#00c0de",
    [types.SOURCEANDNOTE]: "#f36170",
    [types.SOURCEANDHIGHLIGHT]: "#45c786",
    [types.PURENOTE]: "#f5a94b",
    [types.NEITHER]: "#000000"
  };
  const nodeType = getNodeType(item);
  return nodeColors[nodeType];
}


function createNodesHelper(items, clusters, curProject) {
  let nodes = new DataSet();
  // Iterate through each node in the graph and build the arrays of nodes
  for (let index in items) {
    if (clusters.length === 0 || clusters.filter(cluster => cluster.project_id === curProject.id)
      .filter(cluster => cluster.child_items.some(e => e.id === items[index].id)).length === 0) {
      const node = items[index];
      const nodeType = getNodeType(node);
      const label = getNodeLabel(node, nodeType);
      const [x, y] = getNodePosition(node);
      nodes.add({ group: "items", id: node.id, label: label, x: x, y: y, color: getColor(node) });
    }
  }
  return nodes;
}


function createClusters(clusters) {
  let clusterNodes = new DataSet();
  if (clusters.length === 0) {
    return clusterNodes;
  }
  // let projectClusters = this.state.clusters.filter(
  //         cluster => (cluster.project_id === this.props.curProject.id))
  let projectClusters = clusters;
  projectClusters.forEach(cluster => {
    clusterNodes.add({
      group: "clusters",
      id: generateVisClusterId(cluster),
      label: '-----------------------------------------------------', // :(
      x: cluster.x_position,
      y: cluster.y_position
    });
    // Add node to serve as cluster title
    const helperDataOffset = 120;
    clusterNodes.add({
      group: "inCluster",
      id: generateVisInClusterId(cluster, "title"),
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
      clusterNodes.add({
        group: "inCluster",
        id: generateVisInClusterId(cluster, "count"),
        label: "+" + totalNodes + " item" + (totalNodes > 1 ? "s" : ""),
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
      const nodeType = getNodeType(child);
      const label = getNodeLabel(child, nodeType);
      let yOffset = -40;
      if (count === 1) {
        yOffset = 40;
      }
      if (count > 1) return;

      clusterNodes.add({
        group: 'inCluster',
        id: generateVisInClusterId(cluster, "item", child),
        label: label,
        x: cluster.x_position,
        y: cluster.y_position + yOffset,
        widthConstraint: {
          maximum: 170
        },
        color: getColor(child)
      })
      count++;
    })
  })
  return clusterNodes
}


export {
  generateVisClusterId,
  generateClusterIdFromVisId,
  generateVisInClusterId,
  generateClusterIdAndNodeIdFromVisInClusterId,
  updateItemPosition,
  updateClusterPosition,
  getNodePosition,
  options,
  types,
  getNodeType,
  getNodeLabel,
  isItem,
  isCluster,
  isItemInCluster,
  generateNodePositions,
  getColor,
  createNodesHelper,
  createClusters
}