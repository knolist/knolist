import React from "react";
import {FlexboxGrid, Col} from "rsuite"
import ProjectCard from "./ProjectCard.js";

/*
    Displays all projects relevant to current page,
    search query, and sorting option
*/
function All(props) {
    // filter out irrelevant projects
    const filterProjects = (allProjects) => {
        console.log(allProjects);
        let projectsToDisplay = null;
        // first check what page we're on to see what kinds of projects to display
        if (!props.sharedOnly && !props.archivedOnly) {
            projectsToDisplay = allProjects;
        } else if (props.sharedOnly) {
            projectsToDisplay = allProjects.filter(project => project.shared_users.length > 0);
        } else if (props.archivedOnly) {
            // archived projects not implemented yet, uncomment below when ready
            // projectsToDisplay = allProjects.filter(project => project.archived === true);
            return [];
        }
        // further filter based on search query, if any (currently only searching project title)
        if (props.searchQuery !== "") {
            let searchResults = [];
            for (let i = 0; i < projectsToDisplay.length; i++) {
                if (projectsToDisplay[i].title.toLowerCase().includes(props.searchQuery.toLowerCase())) {
                    searchResults.push(projectsToDisplay[i]);
                }
            }
            projectsToDisplay = searchResults;
        }
        // further filter based on selected sorting option
        switch (props.sortCriterion) {
            case "Oldest":
                //sort by creation date (backwards)
                projectsToDisplay.sort((a, b) => {
                    return Date.parse(a.creation_date) - Date.parse(b.creation_date);
                });
                break;
            case "Newest":
                //sort by creation date
                projectsToDisplay.sort((a, b) => {
                    return Date.parse(b.creation_date) - Date.parse(a.creation_date);
                });
                break;
            case "A-Z":
                projectsToDisplay.sort((a, b) => {
                    return a.title.localeCompare(b.title);
                });
                break;
            case "Z-A":
                projectsToDisplay.sort((a, b) => {
                    return b.title.localeCompare(a.title);
                });
                break;
            default:
                break; //do nothing when sortCriterion is empty string
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
                        {projects.map((project, index) => {
                            return (
                                <FlexboxGrid.Item componentClass={Col} md={6} key={index}>
                                    <ProjectCard data={project}/>
                                </FlexboxGrid.Item>);
                        })}
                    </FlexboxGrid>
                </div>
            </div>
        );
    } else if (projects.length === 0 && props.searchQuery === "") {
        return (
            <div>
                <div style={{fontWeight: "bold", fontSize: "2em", fontFamily: "Poppins"}}>No projects!</div>
                <div style={{fontSize: "1em", fontFamily: "Poppins", marginTop: "15px"}}>
                    Add a new project to get started.
                </div>
            </div>
        );
    } else return <div className="myknolist-title">All</div>;
}

export default All;