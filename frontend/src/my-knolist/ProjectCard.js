import React from "react";
import { Panel } from "rsuite";

function ProjectCard(props) {
  console.log(props.data)
  return (
    <Panel shaded bordered header={props.data.title} style={{ width: "17vw" }}>
      {props.data.id}
    </Panel>
  );
}

export default ProjectCard;