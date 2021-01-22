import React from "react";
import {FlexboxGrid, Col} from "rsuite"
import ProjectCard from "./ProjectCard.js";

function All(props) {
    const filterProjects = (allProjects) => {
        let projectsToDisplay = null;
        if (!props.sharedOnly && !props.archivedOnly) {
            projectsToDisplay = allProjects;
        } else if (props.sharedOnly) {
            // projectsToDisplay = allProjects.filter(project => project.shared = true);
            return [];
        } else if (props.archivedOnly) {
            // projectsToDisplay = allProjects.filter(project => project.archived = true);
            return [];
        }
        if (props.sortCriterion === "Newest") {
            //sort by creation date (backwards)
        } else if (props.sortCriterion === "Oldest") {
            //sort by creation date
        } else if (props.sortCriterion === "A-Z") {
            projectsToDisplay = allProjects.sort((a, b) => {
                return a.title.localeCompare(b.title);
            });
            console.log(projectsToDisplay);
        } else if (props.sortCriterion === "Z-A") {
            projectsToDisplay = allProjects.sort((a, b) => {
                return b.title.localeCompare(a.title);
            });
        }
        return projectsToDisplay;
    }

    const projects = filterProjects(props.projects);

    if (projects.length > 0) {
        return (
            <div>
                <div className="myknolist-title">All</div>
                <div className="myknolist-container">
                    <FlexboxGrid style={{marginLeft: "-6px", marginBottom: "5vh"}} justify="start">
                        {props.projects.map((project, index) => {
                            return (
                                <FlexboxGrid.Item componentClass={Col} md={6} key={index}>
                                    <ProjectCard data={project}/>
                                </FlexboxGrid.Item>);
                        })}
                    </FlexboxGrid>
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <div style={{fontWeight: "bold", fontSize: "2em", fontFamily: "Poppins"}}>No projects!</div>
                <div style={{fontSize: "1em", fontFamily: "Poppins", marginTop: "15px"}}>
                    Add a new project to get started.
                </div>
            </div>
        );
    }
}

export default All;