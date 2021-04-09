import React from "react";
import { Panel, Icon } from "rsuite";
import { Link } from "react-router-dom";
import makeHttpRequest from "../services/HttpRequest.js";

function ProjectCard(props) {
  const openProject = (project) => {
    localStorage.setItem(process.env.REACT_APP_LOCAL_STORAGE_CUR_PROJECT, JSON.stringify(project));
    //set current project to selected project
  }


  let description = "";
    if (props.data.description != null) description = <p> {props.data.description} </p>;

  let stats = [];
  if (props.stats !== undefined) {
      if (props.stats['num_items'] !== undefined) {
          stats.push(<p key={'num_items'}> {props.stats['num_items'].toString()}  total items </p>)
      }
      if (props.stats.average_depth_per_item !== undefined) {
          stats.push(<p key={'avg_depth'}> Average depth of {props.stats.average_depth_per_item} </p>)
      }
      if (props.stats.date_accessed !== undefined) {
          stats.push(<p key={'date_accessed'}> Last edit was {props.stats.date_accessed}</p>)
      }
      if (props.stats.date_created !== undefined) {
          stats.push(<p key={'date_created'}> Project created on {props.stats.date_created}</p>)
      }
      if (props.stats.max_depth !== undefined) {
          stats.push(<p key={'max_depth'}> Max depth of {props.stats.max_depth}</p>)
      }
      if (props.stats.most_common !== undefined) {
          stats.push(<p key={'most_common'}> Most common item is {props.stats.most_common}</p>)
      }
  }


  if (props.data.shared_users.length > 0) {
    return (
      <Link to="/" style={{ textDecoration: "none", paddingRight: "5vh" }} className="react-router-styling">
        <Panel
          shaded bordered
          header={props.data.title}
          style={{marginTop: "2vh" }}
          onClick={() => openProject(props.data)}>
          {props.data.id}
          <Icon icon="people-group" style={{ float: "right", marginTop: "5px" }}/>

        </Panel>
      </Link>
    );
  } else {
    return (
        <Panel
            shaded bordered
            header={
                <Link to="/" onEnter={() => openProject(props.data)}
                            style={{ textDecoration: "none", paddingRight: "5vh" }} className="react-router-styling">
                {props.data.title}
                </Link>
            }
            style={{marginTop: "2vh" }}
            onClick={() => openProject(props.data)}
            collapsible>
            {description ? <> <b>Description</b> {description} <br/> </>: null}
            <b> Statistics </b>
            {stats}
        </Panel>

    );
  }
}


export default ProjectCard;