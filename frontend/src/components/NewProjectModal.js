import React from "react";
import { Modal, Button, Form, FormGroup, ControlLabel, HelpBlock, FormControl } from "rsuite";
import makeHttpRequest from "../services/HttpRequest";
import { Link } from "react-router-dom";

function NewProjectModal(props) {
    const show = props.show;
    const setShow = props.setShow;

    const openProject = () => {
        const projectTitle = document.getElementById("titleInput").value;
        let projectDesc = document.getElementById("descriptionInput").value;
        let body = {};
        if (projectDesc == null || projectDesc === "") {
            body = {
                "title": projectTitle
            }
        } else {
            body = {
                "title": projectTitle,
                "description": projectDesc
            }
        }
        makeHttpRequest("/projects", "POST", body).then(response => {
            console.log(JSON.stringify(response.body.project));
            console.log(localStorage.getItem("curProject"));
            localStorage.setItem("curProject", JSON.stringify(response.body.project));
        });
    }

    return (
        <Modal show={show} style={{ overflow: "hidden" }} onHide={() => setShow(false)}>
            <Modal.Header><Modal.Title>New Project</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form fluid>
                    <FormGroup controlId="titleInput">
                        <ControlLabel>Title</ControlLabel>
                        <FormControl name="title" />
                        <HelpBlock>Required</HelpBlock>
                    </FormGroup>
                    <FormGroup controlId="descriptionInput">
                        <ControlLabel>Description</ControlLabel>
                        <FormControl
                            rows={5}
                            name="description"
                            componentClass="textarea" />
                    </FormGroup>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Link to="/" style={{ textDecoration: "none" }} className="react-router-styling">
                    <Button
                        onClick={() => {
                            setShow(false);
                            openProject();
                        }}
                        appearance="primary">
                        Create
                    </Button>
                </Link>
                <Button onClick={() => setShow(false)} appearance="default">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NewProjectModal;