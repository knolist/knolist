// Import from npm libraries
import React from 'react';
import {Button, Loader} from 'rsuite';
import {withAuthenticationRequired} from "@auth0/auth0-react";

// Import React Components
import AppHeader from "./AppHeader";
import ProjectsSidebar from "./ProjectsSidebar";
import MindMap from "./MindMap";
import NewProjectModal from "../components/NewProjectModal";

// Import utilities
import makeHttpRequest from "../services/HttpRequest";

// Import styles
import 'rsuite/dist/styles/rsuite-default.css';
import '../index.css';


class App extends React.Component {
    constructor(props) {
        super(props);
        const curProjectKey = process.env.REACT_APP_LOCAL_STORAGE_CUR_PROJECT;
        this.state = {
            curProjectKey: curProjectKey,
            curProject: JSON.parse(localStorage.getItem(curProjectKey)),
            projects: null,
            showProjectsSidebar: false,
            showBib: false,
            showSharedProject: false,
            showNewProjectModal: false,
            searchQuery: '',
            filters: ["Title",
                "URL",
                "Page Content",
                "Highlights",
                "Notes"]
        }
    }

    updateProjects = (callback) => {
        makeHttpRequest("/projects").then(response => {
            if (!response.body.success) {
                this.setShowNewProjectModal(true);
            }

            const projects = response.body.projects;
            this.setState({projects: projects}, () => {
                // Update current project
                if (this.state.curProject !== null) {
                    this.setCurProject(this.state.curProject.id);
                } else if (projects && projects.length > 0) {
                    this.setState({curProject: projects[0]});
                } else if (!projects || projects.length === 0) {
                    this.setCurProject(null);
                    this.setShowNewProjectModal(true);
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

    setShowNewProjectModal = (val) => {
        this.setState({showNewProjectModal: val})
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
            localStorage.setItem(this.state.curProjectKey, JSON.stringify(this.state.curProject));
        }
    }

    render() {
        return (
            <div style={{height: "100%"}}>
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
                <NewProjectModal show={this.state.showNewProjectModal} setShow={this.setShowNewProjectModal}
                                 noCancel fromSidebar/>
            </div>
        );
    }
}

export default withAuthenticationRequired(App, {
    onRedirecting: () => <Loader size="lg" backdrop center/>,
});