// Import from npm libraries
import React from 'react';
import { Button } from 'rsuite';
import { Route, Switch } from "react-router";

// Import React Components
import AppHeader from "./AppHeader";
import ProjectsSidebar from "./ProjectsSidebar";
import MindMap from "./MindMap";
import MyKnolist from "../my-knolist/MyKnolist.js";

// Import utilities
import makeHttpRequest from "../services/HttpRequest";

// Import styles
import 'rsuite/dist/styles/rsuite-default.css';
import '../index.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curProject: JSON.parse(localStorage.getItem("curProject")),
            projects: null,
            showProjectsSidebar: false,
            showBib: false
        }
    }

    updateProjects = (callback) => {
        makeHttpRequest("/projects").then(response => {
            // TODO: this is what indicates a user that isn't authenticated, implement login
            if (!response.body.success) return;

            const projects = response.body.projects;
            this.setState({ projects: projects }, () => {
                // Update current project
                if (this.state.curProject !== null) {
                    this.setCurProject(this.state.curProject.id);
                } else if (projects && projects.length > 0) {
                    this.setState({ curProject: projects[0] });
                }

                if (typeof callback === "function") {
                    callback();
                }
            })
        })
    }

    switchShowProjectsSidebar = () => {
        this.setState({ showProjectsSidebar: !this.state.showProjectsSidebar });
    }

    setCurProject = (projectId) => {
        if (projectId === null) this.setState({ curProject: null })
        else {
            const project = this.state.projects.find(x => x.id === projectId);
            this.setState({ curProject: project });
        }
    }

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br />Projects
            </Button>
        );
    }

    setShowBib = (clicked) => {
        // Keeps track if Bibliography Generation Button clicked and Window should open
        this.setState({
            showBib: clicked
        });
    }

    componentDidMount() {
        this.updateProjects()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Update localstorage whenever the curProject changes
        if (prevState.curProject !== this.state.curProject) {
            if (this.state.curProject === null) {
                this.setState({ curProject: this.state.projects[0] })
            }
            localStorage.setItem("curProject", JSON.stringify(this.state.curProject));
        }
    }

    render() {
        return (
            <Switch>
                <Route exact path="/">
                    <AppHeader curProject={this.state.curProject} setShowBib={this.setShowBib} />
                    <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                        projects={this.state.projects}
                        close={this.switchShowProjectsSidebar} updateProjects={this.updateProjects}
                        setCurProject={this.setCurProject} />
                    {this.projectsButton()}
                    <MindMap curProject={this.state.curProject} showBib={this.state.showBib} setShowBib={this.setShowBib} />
                </Route>
                <Route path="/my-knolist">
                    <MyKnolist />
                </Route>
            </Switch>
        );
    }
}

export default App;