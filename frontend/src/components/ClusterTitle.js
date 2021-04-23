import React, { useState } from "react";
import { Whisper, Tooltip, Input, Button } from "rsuite";
import makeHttpRequest from "../services/HttpRequest";

function ClusterTitle(props) {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [cluster, setCluster] = useState(props.curClusterView);

  const styles = {
    position: 'absolute',
    top: 60,
    display: "flex",
    justifyContent: "center",
    width: "100%",
    fontSize: "1.5em"
  }

  let title = "";
  if (cluster !== null) title = cluster.name;
  //console.log(cluster);

  const tooltip = (<Tooltip>Click to rename.</Tooltip>)

  const saveNewTitle = () => {
    const endpoint = "/clusters/" + cluster.id;
    const body = { "name": newTitle };
    makeHttpRequest(endpoint, "PATCH", body).then((res) => {
      props.setCurClusterView(res.body.cluster);
      setEditing(false);
      setCluster(res.body.cluster);
    });
  }

  if (cluster === null) return null;
  else if (cluster !== null && !editing) return (
    <Whisper placement="bottom" trigger="hover" speaker={tooltip}>
      <div style={styles} onClick={() => setEditing(true)}>{title}</div>
    </Whisper>
  );
  else if (cluster !== null && editing) return (
    <div style={styles} id="cluster-title">
      <Input style={{ width: 120 }} defaultValue={title} onInput={e => setNewTitle(e.target.value)} />
      <Button size="xs" style={{ marginLeft: 5 }} onClick={() => saveNewTitle()}>Save</Button>
    </div>
  );
}

export default ClusterTitle;