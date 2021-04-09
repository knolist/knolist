import React from "react";
import {Panel, Icon, IconButton} from "rsuite";
import {Link} from "react-router-dom";
import makeHttpRequest from "../services/HttpRequest";


class ProjectCard extends React.Component {

    openProject = (project) => {
        localStorage.setItem("curProject", JSON.stringify(project));
        //set current project to selected project
    }

    setLoading = (val) => {
         this.setState({ loading: val })
     }

    archiveProject = (proj_id) => {
        this.setLoading(true);
        const endpoint = "/projects/" + proj_id;
        //const cur_state = document.getElementById(this.state);
        const archived = this.props.data.is_archived;
        const update_archive = !archived;
        const body = {
            "is_archived": update_archive
        }
        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            let callback;
            if (this.props.active) callback = () => this.props.setCurProject(null);
            //this.props.setCurProject(this.props);
            //localStorage.setItem("curProject", this.props);
            this.setState(this.props.data);
            this.props.getProjects(false);
        })
    }

    /*updateProjects = (callback) => {
        makeHttpRequest("/projects").then(response => {
            let projects = response.body.projects;
            this.setState({projects: projects}, () => {
                // Update current project
                if (this.state.curProject !== null) {
                    this.setCurProject(this.state.curProject.id);
                } else if (projects && projects.length > 0) {
                    this.setState({curProject: projects[0]});
                }
                if (typeof callback === "function") {
                    callback();
                }
            });
        });
    }*/
    render() {
        const props = this.props;
        let description = "";
        if (props.data.description != null) description = props.data.description;

        if (props.data.shared_users.length > 0) {
            return (
                <Link to="/" style={{textDecoration: "none"}} className="react-router-styling">
                    <Panel
                        shaded bordered
                        header={props.data.title}
                        style={{width: "17vw", marginTop: "2vh"}}
                        onClick={() => this.openProject(props.data)}
                    >
                        {props.data.id}
                        <Icon icon="people-group" style={{float: "right", marginTop: "5px"}}/>
                    </Panel>
                </Link>
            );
        } else {
            return (
                <Link to="/" style={{textDecoration: "none"}} className="react-router-styling">
                    <Panel
                        shaded bordered
                        header={props.data.title}
                        style={{width: "17vw", marginTop: "2vh"}}
                        onClick={() => this.openProject(props.data)}
                    >
                        {description}
                        <ArchiveButton archiveProject={this.archiveProject} proj_id={props.data.id}/>
                    </Panel>
                </Link>
            );
        }
    }
}

class ArchiveButton extends React.Component {
    handleClick = (event) => {
        //event.stopPropagation();
        event.preventDefault();
        this.props.archiveProject(this.props.proj_id);
        //window.location.reload();
    }

    render() {
        let icon = "archive"
        return (
            <IconButton onClick={this.handleClick} icon={<Icon icon={icon}/>} size="sm"
            style={{float: "right", marginTop: "5px"}}/>

        )
    };
}

export default ProjectCard;