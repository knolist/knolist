import React from "react";
import { FlexboxGrid, Col } from "rsuite"
import ProjectCard from "./ProjectCard.js";

function Recent(props) {
  const getFourRecent = (allProjects) => {
    allProjects.sort((a, b) => {
      return Date.parse(b.recent_access_date) - Date.parse(a.recent_access_date);
    });
    let recent = [];
    const max = allProjects.length >= 4 ? 4 : allProjects.length;
    for (let i = 0; i < max; i++) {
      recent.push(allProjects[i]);
    }
    return recent;
  };

  if (props.show && props.projects.length > 0) {
    return (
      <div>
        <div className="myknolist-title">Recent</div>
        <div className="myknolist-container">
          <FlexboxGrid style={{ marginLeft: "-6px", marginBottom: "5vh" }} justify="start">
            {getFourRecent(props.projects).map((project, index) => {
              return (
                <FlexboxGrid.Item componentClass={Col} md={6} key={index}>
                  <ProjectCard data={project} stats={props.stats[index]}/>
                </FlexboxGrid.Item>);
            })}
          </FlexboxGrid>
        </div>
      </div>
    );
  } else return null;
}

export default Recent;