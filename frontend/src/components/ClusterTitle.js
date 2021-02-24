import React from "react";

function ClusterTitle(props) {
  const styles = {
    position: 'absolute',
    top: 55,
    display: "flex",
    justifyContent: "center",
    width: "100%",
    fontWeight: "bold",
    fontSize: "1.5em"
  }

  let title = "";
  if (props.curClusterView !== null) title = props.curClusterView.name;

  if (props.curClusterView === null) return null;
  else return (
    <div style={styles}>{title}</div>
  );
}

export default ClusterTitle;