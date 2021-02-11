import React from "react";
import { Panel, Icon } from "rsuite";
import { Link } from "react-router-dom";

function ProjectCard(props) {
  const openProject = (project) => {
    console.log(JSON.stringify(project));
    localStorage.setItem("curProject", JSON.stringify(project));
    //set current project to selected project
  }

  let description = "";
  if (props.data.description != null) description = props.data.description;

  if (props.data.shared_users.length > 0) {
    return (
      <Link to="/" style={{ textDecoration: "none" }} className="react-router-styling">
        <Panel
          shaded bordered
          header={props.data.title}
          style={{ width: "17vw", marginTop: "2vh" }}
          onClick={() => openProject(props.data)}>
          {props.data.id}
          <Icon icon="people-group" style={{ float: "right", marginTop: "5px" }}/>
        </Panel>
      </Link>
    );
  } else {
    return (
      <Link to="/" style={{ textDecoration: "none" }} className="react-router-styling">
        <Panel
          shaded bordered
          header={props.data.title}
          style={{ width: "17vw", marginTop: "2vh" }}
          onClick={() => openProject(props.data)}>
          {description}
        </Panel>
      </Link>
    );
  }
}

export default ProjectCard;