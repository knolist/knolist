import React from "react";
import {Panel} from "rsuite";

function ProjectCard(props) {
    /*if (props.project.shared) {
      return (
        <Panel shaded bordered header={props.data.title} style={{ width: "17vw", marginTop: "2vh" }}>
          {props.data.id}
          <Icon icon="people-group" />
        </Panel>
      );
    } else {*/
    return (
        <div className="hover-animation">
            <Panel shaded bordered header={props.data.title} style={{width: "17vw", marginTop: "2vh"}}>
                {props.data.id}
            </Panel>
        </div>
    );
    //}
}

export default ProjectCard;