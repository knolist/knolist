import React from "react";
import {Animation, Button, Drawer, Form, Icon, IconButton, Input, Placeholder, Tooltip, Whisper} from "rsuite";

import ProjectsList from "./ProjectsList";

import {trimString} from "../services/StringHelpers";
import makeHttpRequest from "../services/HttpRequest";

class ProjectsSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showNewProjectForm: false
        }
    }

    setShowNewProjectForm = (val) => {
        this.setState({showNewProjectForm: val})
    }

    renderProjectsList = () => {
        if (this.props.projects === null) return <Placeholder.Paragraph rows={15} active/>;

        return <ProjectsList projects={this.props.projects} curProject={this.props.curProject}
                             updateProjects={this.props.updateProjects} setCurProject={this.props.setCurProject}/>
    }

    componentDidMount() {
        this.props.updateProjects();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.show !== this.props.show && !this.props.show) {
            this.setShowNewProjectForm(false);
        }
    }

    render() {
        return (
            <Drawer
                size="xs"
                show={this.props.show}
                onHide={this.props.close}>
                <Drawer.Header>
                    <Drawer.Title>Your Projects</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body style={{marginBottom: 10}}>
                    {this.renderProjectsList()}
                    <NewProjectForm show={this.state.showNewProjectForm}
                                    setShowNewProjectForm={this.setShowNewProjectForm}
                                    setCurProject={this.props.setCurProject}
                                    updateProjects={this.props.updateProjects}/>
                </Drawer.Body>
                <Drawer.Footer>
                    <NewProjectButton setShowNewProjectForm={this.setShowNewProjectForm}
                                      showNewProjectForm={this.state.showNewProjectForm}/>
                </Drawer.Footer>
            </Drawer>
        )
    }
}

function NewProjectButton(props) {
    if (props.showNewProjectForm) {
        return (
            <Button onClick={() => props.setShowNewProjectForm(false)}>Cancel</Button>
        );
    } else {
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>New Project</Tooltip>}
                     placement="topEnd">
                <IconButton onClick={() => props.setShowNewProjectForm(true)} appearance="primary"
                            icon={<Icon icon="plus"/>} circle size="lg"/>
            </Whisper>
        );
    }
}

class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputId: "new-project-name",
            loading: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.show !== this.props.show && this.props.show) {
            document.getElementById(this.state.inputId).focus();
        }
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    submit = () => {
        this.setLoading(true);
        let projectName = document.getElementById(this.state.inputId).value;
        projectName = trimString(projectName);
        const endpoint = "/projects";
        const body = {
            "title": projectName
        }

        makeHttpRequest(endpoint, "POST", body).then((response) => {
            // Update projects
            const callback = () => {
                this.props.setShowNewProjectForm(false);
                this.props.setCurProject(response.body.project.id);
                this.setLoading(false);
            }
            this.props.updateProjects(callback);
        });
    }

    render() {
        // if (!this.props.show) return null;

        return (
            <Animation.Fade in={this.props.show}>
                <Form id="new-project-form" layout="inline" onSubmit={this.submit}>
                    <Input autoFocus required id={this.state.inputId} placeholder="New Project Name"/>
                    <Button style={{float: "right", margin: 0}} appearance="primary" loading={this.state.loading}
                            type="submit">Create</Button>
                </Form>
            </Animation.Fade>
        );
    }
}

export default ProjectsSidebar;