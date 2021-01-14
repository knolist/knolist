import React from "react";
import { FlexboxGrid, Col } from "rsuite"
import ProjectCard from "./ProjectCard.js";

function Recent(props) {
  const getFourRecent = (allProjects) => {
    let recent = [];
    const max = allProjects.length >= 4 ? 4 : allProjects.length;
    for (let i = 0; i < max; i++) {
      recent.push(allProjects[i]);
    }
    return recent;
  };

  if (props.show) {
    return (
      <div>
        <div className="myknolist-title">Recent</div>
        <div className="myknolist-container">
          <FlexboxGrid style={{marginLeft:"-6px", marginBottom:"5vh"}} justify="space-between">
            {getFourRecent(props.projects).map((project) => {
              return (
                <FlexboxGrid.Item componentClass={Col} md={6}>
                  <ProjectCard data={project} />
                </FlexboxGrid.Item>);
            })}
          </FlexboxGrid>
        </div>
      </div>
    );
  } else return null;
}

export default Recent;