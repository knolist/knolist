import React, { useState, useEffect } from "react";
import { Button, Icon, Input, Alert } from "rsuite";
import makeHttpRequest from "../services/HttpRequest.js";

function ListViewAdd(props) {
  const [addNoteMode, setAddNoteMode] = useState(false);
  const [addSourceMode, setAddSourceMode] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", enterEvent);
    document.addEventListener("click", clickEvent);
    return () => {
      document.removeEventListener("keydown", enterEvent);
      document.removeEventListener("click", clickEvent);
    }
  })

  const addItem = () => {
    if (addNoteMode) {
      const endpoint = "/items"
      const body = {
        "content": document.getElementById("new-note").value,
        "is_note": true,
        "parent_project": props.curProject.id
      }
      makeHttpRequest(endpoint, "POST", body).then((response) => {
        if (response.status === 200) {
          // Alert that the item already exists in this project
          Alert.info('This item already exists in this project.');
        } else if (response.status === 201) {
          // Update items
          props.getItems(true);
          setAddNoteMode(false);
        }
      });
    } else if (addSourceMode) {
      const endpoint = "/items"
      const body = {
        "url": document.getElementById("new-source").value,
        "is_note": false,
        "parent_project": props.curProject.id
      }
      makeHttpRequest(endpoint, "POST", body).then((response) => {
        if (response.status === 200) {
          // Alert that the item already exists in this project
          Alert.info('This item already exists in this project.');
        } else if (response.status === 201) {
          // Update items
          props.getItems(true)
          setAddSourceMode(false);
        }
      });
    }
  }

  const enterEvent = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      addItem();
    }
  }

  const clickEvent = (e) => {
    if (addNoteMode && e.target !== document.getElementById("new-note")) setAddNoteMode(false);
    else if (addSourceMode && e.target !== document.getElementById("new-source")) setAddSourceMode(false);
  }

  if (props.insideListItem) {
    if (!addNoteMode) {
      return (
        <Button size="sm" onClick={() => setAddNoteMode(true)}>
          <Icon icon="plus" style={{ marginRight: "10px" }} />Add note
        </Button>
      );
    }
    else {
      return (
        <div style={{paddingBottom:"30px"}}>
          <Input style={{ float: "left", width: "89%" }} placeholder="Enter note" size="sm" id="new-note" />
          <Button style={{ float: "left", width: "10%", marginLeft: "1%" }} size="sm" onClick={() => addItem()}>Save</Button>
        </div>
      )
    }
  }
  else if (addNoteMode) {
    return (
      <div style={{marginBottom:"15px"}}>
        <div style={{ width: "75%", margin: "0 auto", paddingTop: "10px", paddingBottom: "10px" }}>
          <Input style={{ float: "left", width: "89%" }} placeholder="Enter note" size="sm" id="new-note" />
          <Button style={{ float: "left", width: "10%", marginLeft: "1%" }} size="sm" onClick={() => addItem()}>Save</Button>
        </div>
        <div style={{ width: "75%", margin: "0 auto", paddingTop: "10px" }}>
          <Button onClick={() => { setAddSourceMode(true); setAddNoteMode(false) }} style={{ marginTop: "10px" }} size="sm">
            <Icon icon="plus" style={{ marginRight: "10px" }} />Add source
          </Button>
        </div>
      </div>
    )
  }
  else if (addSourceMode) {
    return (
      <div style={{marginBottom:"15px"}}>
        <div style={{ width: "75%", margin: "0 auto", paddingTop: "10px" }}>
          <Button onClick={() => { setAddNoteMode(true); setAddSourceMode(false) }} style={{ marginBottom: "10px" }} size="sm">
            <Icon icon="plus" style={{ marginRight: "10px" }} />Add note
          </Button>
        </div>
        <div style={{ width: "75%", margin: "0 auto" }}>
          <Input style={{ float: "left", width: "89%" }} placeholder="Enter URL" size="sm" id="new-source" type="URL"/>
          <Button style={{ float: "left", width: "10%", marginLeft: "1%" }} size="sm" onClick={() => addItem()}>Save</Button>
        </div>
      </div>
    )
  }
  else {
    return (
      <div style={{marginBottom:"15px"}}>
        <div style={{ width: "75%", margin: "0 auto", paddingTop: "10px" }}>
          <Button size="sm" onClick={() => setAddNoteMode(true)}>
            <Icon icon="plus" style={{ marginRight: "10px" }} />Add note
          </Button>
        </div>
        <div style={{ width: "75%", margin: "0 auto", paddingTop: "5px" }}>
          <Button size="sm" onClick={() => setAddSourceMode(true)}>
            <Icon icon="plus" style={{ marginRight: "10px" }} />Add source
          </Button>
        </div>
      </div>
    )
  }
}

export default ListViewAdd;