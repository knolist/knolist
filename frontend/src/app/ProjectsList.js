import React from "react";
import {Button, ButtonToolbar, FlexboxGrid, Form, Icon, IconButton, Input, Nav, Tooltip, Whisper} from "rsuite";

import ConfirmDeletionWindow from "../components/ConfirmDeletionWindow";

import makeHttpRequest from "../services/HttpRequest";
import {trimString} from "../services/StringHelpers";

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.curProject === null ? undefined : props.curProject.id}
             onSelect={(eventKey) => props.setCurProject(eventKey)}>
            {props.projects.map(project => <Project key={project.id} updateProjects={props.updateProjects}
                                                    project={project}
                                                    eventKey={project.id} setCurProject={props.setCurProject}
                                                    setShowSharedProject={props.setShowSharedProject}/>)}
        </Nav>
    );
}

class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDelete: false,
            loading: false,
            editing: false,
            updatedProjectNameFormId: "updated-project-name",
            updateProjectNameButtonId: "update-project-name-button"
        }
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    setEditing = (val) => {
        this.setState({editing: val})
    }

    cancelEditing = (event) => {
        if (event.relatedTarget === null || event.relatedTarget.id !== this.state.updateProjectNameButtonId) {
            this.setEditing(false);
        }
    }

    setDeleteProject = (event) => {
        event.stopPropagation();
        this.setState({confirmDelete: true})
    }

    resetDeleteProject = () => {
        this.setState({confirmDelete: false})
    }

    deleteProject = () => {
        this.setLoading(true);
        const endpoint = "/projects/" + this.props.project.id;
        makeHttpRequest(endpoint, "DELETE").then(() => {
            // Reset the current project if the deleted is active
            let callback;
            if (this.props.active) callback = () => this.props.setCurProject(null);
            this.props.updateProjects(callback);
        });
    }

    updateProjectName = () => {
        this.setLoading(true);
        const updatedProjectName = trimString(document.getElementById(this.state.updatedProjectNameFormId).value);
        const endpoint = "/projects/" + this.props.project.id;
        const body = {
            "title": updatedProjectName
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.updateProjects(() => {
                this.setEditing(false);
                this.setLoading(false);
            });
        });
    }

    render() {
        //console.log(this.props.project)
        return (
            <div>
                <ConfirmDeletionWindow confirmDelete={this.state.confirmDelete} resetDelete={this.resetDeleteProject}
                                       title={this.props.project.title} delete={this.deleteProject}
                                       loading={this.state.loading}/>
                <Nav.Item onSelect={this.props.onSelect} eventKey={this.props.eventKey} active={this.props.active}>
                    <FlexboxGrid justify="space-between">
                        <FlexboxGrid.Item>
                            {
                                this.state.editing ?
                                    <Form onSubmit={this.updateProjectName}>
                                        <Input autoFocus required id={this.state.updatedProjectNameFormId}
                                               onClick={(e) => e.stopPropagation()}
                                               onBlur={(e) => this.cancelEditing(e)}
                                               defaultValue={this.props.project.title}/>
                                    </Form> :
                                    this.props.project.title
                            }
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <ButtonToolbar>
                                <EditProjectNameButton loading={this.state.loading} editing={this.state.editing}
                                                       updateProjectNameButtonId={this.state.updateProjectNameButtonId}
                                                       setEditing={this.setEditing}
                                                       updateProjectName={this.updateProjectName}/>
                                <IconButton onClick={this.setDeleteProject} icon={<Icon icon="trash"/>} size="sm"/>
                                <SharedProjectButton isShared={this.props.project.shared_users.length > 0} 
                                                        setShowSharedProject={this.props.setShowSharedProject}/>
                            </ButtonToolbar>
                        </FlexboxGrid.Item>
                        {/* <FlexboxGrid.Item>
                            <SharedProjectButton isShared={this.props.project.shared_users.length > 0} setShowSharedProject={this.props.setShowSharedProject}/>
                        </FlexboxGrid.Item> */}
                        </FlexboxGrid>
                </Nav.Item>
            </div>
        );
    }
}

class EditProjectNameButton extends React.Component {
    buttonAction = (event, editing) => {
        event.stopPropagation();
        if (editing) this.props.setEditing(editing);
        else this.props.updateProjectName();
    }

    render() {
        if (this.props.editing) {
            return (
                <Button id={this.props.updateProjectNameButtonId} loading={this.props.loading}
                        onClick={(e) => this.buttonAction(e, false)}>Update</Button>
            );
        }

        return (
            <IconButton onClick={(e) => this.buttonAction(e, true)} icon={<Icon icon="edit2"/>} size="sm"/>
        );
    }
}

class SharedProjectButton extends React.Component {
    render() {
        let icon;
        if (this.props.isShared) {
            icon = "share-alt"
        } else {
            icon = "people-group"
        }
        return ( 
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Share Project</Tooltip>}
                                     placement="bottom">
                     <IconButton onClick={(e) => this.props.setShowSharedProject(true)} icon={<Icon icon={icon}/>} size="sm"/>
                </Whisper>

        )
    };
}

export default ProjectsList;