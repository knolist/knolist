// Import from npm libraries
import React from 'react';
import {Button, Loader} from 'rsuite';
import {withAuthenticationRequired} from "@auth0/auth0-react";

// Import React Components
import AppHeader from "./AppHeader";
import ProjectsSidebar from "./ProjectsSidebar";
import MindMap from "./MindMap";

// Import utilities
import makeHttpRequest from "../services/HttpRequest";

// Import styles
import 'rsuite/dist/styles/rsuite-default.css';
import '../index.css';

import { Icon, IconButton } from "rsuite"; //temporary
import ListView from "./ListView.js"; //temporary

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curProject: JSON.parse(localStorage.getItem("curProject")),
            projects: null,
            showProjectsSidebar: false,
            showBib: false,
            showSharedProject: false,
            searchQuery: '',
            filters: ["Title",
                "URL",
                "Page Content",
                "Highlights",
                "Notes"],
            clicked: false
        }
    }

    updateProjects = (callback) => {
        makeHttpRequest("/projects").then(response => {
            if (!response.body.success) return;

            const projects = response.body.projects;
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
            })
        })
    }

    switchShowProjectsSidebar = () => {
        this.setState({showProjectsSidebar: !this.state.showProjectsSidebar});
    }

    setCurProject = (projectId) => {
        if (projectId === null) this.setState({curProject: null})
        else {
            const project = this.state.projects.find(x => x.id === projectId);
            this.setState({curProject: project});
        }
    }

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br/>Projects
            </Button>
        );
    }

    setShowBib = (clicked) => {
        // Keeps track if Bibliography Generation Button clicked and Window should open
        this.setState({
            showBib: clicked
        });
    }

    setSearchQuery = (searchQuery) => {
        this.setState({searchQuery});
        if (this.props.onInput) {
            this.props.onInput({searchQuery})
        }
    }

    updateFilters = (filters) => {
        this.setState({filters});
    }


    setShowSharedProject = (val) => {
        this.setState({showSharedProject: val})
    }

    componentDidMount() {
        this.updateProjects()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Update localstorage whenever the curProject changes
        if (prevState.curProject !== this.state.curProject) {
            if (this.state.curProject === null) {
                this.setState({curProject: this.state.projects[0]})
            }
            localStorage.setItem("curProject", JSON.stringify(this.state.curProject));
        }
    }

    render() {
        if (!this.state.clicked) {//temporary
            return (
                <div style={{height:"100%"}}>
                    <AppHeader curProject={this.state.curProject} setShowBib={this.setShowBib}
                                searchQuery={this.state.searchQuery}
                                setSearchQuery={this.setSearchQuery} updateFilters={this.updateFilters}/>
                    <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                        projects={this.state.projects} setShowSharedProject={this.setShowSharedProject}
                                        close={this.switchShowProjectsSidebar} updateProjects={this.updateProjects}
                                        setCurProject={this.setCurProject}/>
                    {this.projectsButton()}
                    <MindMap curProject={this.state.curProject} showBib={this.state.showBib}
                                setShowBib={this.setShowBib} searchQuery={this.state.searchQuery}
                                filters={this.state.filters} setShowSharedProject={this.setShowSharedProject}
                                showSharedProject={this.state.showSharedProject}
                                updateProjects={this.updateProjects}/>
                    {/*below is temporary*/}
                    <div style={{position:"absolute", top: 65, left: 10}}>
                        <IconButton size="md" icon={<Icon icon="star"/>} onClick={() => this.setState({clicked: true})}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{height:"100%"}}>
                    <AppHeader curProject={this.state.curProject} setShowBib={this.setShowBib}
                                searchQuery={this.state.searchQuery}
                                setSearchQuery={this.setSearchQuery} updateFilters={this.updateFilters}/>
                    <ListView curProject={this.state.curProject}/>
                </div>
            )
        }
    }
}

export default withAuthenticationRequired(App, {
    onRedirecting: () => <Loader size="lg" backdrop center/>,
});