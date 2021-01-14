import React, { useState } from "react";
import MyKnolistRecent from "./MyKnolistRecent.js";
import MyKnolistAll from "./MyKnolistAll.js";
import AddButton from "../components/AddButton.js";
import { Modal, Button, Form, FormGroup, ControlLabel, HelpBlock, FormControl } from "rsuite";

function ProjectsDisplay() {
  const [show, setShow] = useState(false);

  return (
    <div className="myknolist-main-container">
      <div className="myknolist-title">
        Recent
      </div>
      <MyKnolistRecent />
      <MyKnolistAll />
      <div
        style={{ position: "fixed", right: 0, bottom: 0 }}
        onClick={() => setShow(true)}>
        <AddButton />
      </div>

      <Modal show={show} style={{ overflow: "hidden" }}>
        <Modal.Header>
          <Modal.Title>New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid>
            <FormGroup>
              <ControlLabel>Title</ControlLabel>
              <FormControl name="title" />
              <HelpBlock>Required</HelpBlock>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                rows={5}
                name="description"
                componentClass="textarea" />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)} appearance="primary">
            Ok
            </Button>
          <Button onClick={() => setShow(false)} appearance="subtle">
            Cancel
            </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProjectsDisplay;