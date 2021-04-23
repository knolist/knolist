import React, { useState, useEffect } from "react";
import { List, Animation, Icon } from "rsuite";
import makeHttpRequest from "../services/HttpRequest.js";

const { Collapse } = Animation;

function ListView(props) {
  const [items, setItems] = useState([]); //all the stuff in the project
  //Stops making an API call on every render
  const [gotItems, setGotItems] = useState(false);
  const [notesShow, setNotesShow] = useState(false);
  const [highlightsShow, setHighlightsShow] = useState(false);

  const getItems = () => {
    if (!gotItems) {
      const endpoint = "/projects/" + props.curProject.id + "/items";
      makeHttpRequest(endpoint).then(res => setItems(res.body.items));
      setGotItems(true);
    }
  }

  //Async function above works only when used in combination with
  //a lifecycle function (this is basically a componentDidMount)
  useEffect(() => {
    getItems();
  })

  console.log(items);

  const getNotesForUrl = (url) => {
    let notes = [];
    items.forEach(item => {
      if (item.url && item.url === url && item.content && item.is_note) {
        notes.push(item.content);
      }
    });
    return notes;
  }

  const getHighlightsForUrl = (url) => {
    let highlights = [];
    items.forEach(item => {
      if (item.url && item.url === url && item.content && !item.is_note) {
        highlights.push(item.content);
      }
    });
    return highlights;
  }

  let addedToList = [];

  return (
    <div style={{ marginTop: "2em" }}>
      <List bordered autoScroll={true} style={{ width: "75%", margin: "0 auto" }}>
        {items.map((item, index) => {
          if (!item.url) { //pure note
            return (
              <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                <div style={{ backgroundColor: "#FAD4A6", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                <div style={{ paddingLeft: ".3em" }}>{item.content}</div>
              </List.Item>
            );
          }
          else if (!addedToList.includes(item.url)) {
            addedToList.push(item.url);
            const notes = getNotesForUrl(item.url);
            const highlights = getHighlightsForUrl(item.url);
            console.log("content for url " + item.url + ": ");
            console.log("notes:\n" + notes);
            console.log("highlights:\n" + highlights);
            if (notes.length + highlights.length > 0) { //source and note/highlight
              if (notes.length > 0 && highlights.length > 0) { //there are notes and highlights present!
                return (
                  <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                    <div style={{ backgroundColor: "#96DFBB", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                    <div style={{ paddingLeft: ".3em" }}>
                      <a target="_blank" rel="noopener noreferrer"
                        href={item.url} style={{ fontSize: "1.3em" }}>
                        {item.url}
                      </a>
                      <br/>
                      <br/>
                      <Icon icon={notesShow ? "angle-down" : "angle-right"} onClick={() => setNotesShow(!notesShow)} />Notes
                      <br/>
                      <Icon Icon icon={highlightsShow ? "angle-down" : "angle-right"} onClick={() => setHighlightsShow(!highlightsShow)} />Highlights
                      <Collapse in={notesShow}>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {notes.map((n, i) => {
                            return (
                              <li key={i}>{n}</li>
                            );
                          })}
                        </ul>
                      </Collapse>
                      <Collapse in={highlightsShow}>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {highlights.map((h, i) => {
                            return (
                              <li key={i}>{h}</li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </div>
                  </List.Item>
                );
              }
              else if (notes.length <= 0 && highlights.length) { //no notes but there are highlights
                return (
                  <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                    <div style={{ backgroundColor: "#96DFBB", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                    <div style={{ paddingLeft: ".3em" }}>
                      <a target="_blank" rel="noopener noreferrer"
                        href={item.url} style={{ fontSize: "1.3em" }}>
                        {item.url}
                      </a>
                      <br/>
                      <br/>
                      <Icon icon={highlightsShow ? "angle-down" : "angle-right"} onClick={() => setHighlightsShow(!notesShow)} />Highlights
                      <Collapse in={highlightsShow}>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {highlights.map((h, i) => {
                            return (
                              <li key={i}>{h}</li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </div>
                  </List.Item>
                );
              }
              else if (notes.length > 0 && highlights.length <= 0) { //there are notes but no highlights
                return (
                  <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                    <div style={{ backgroundColor: "#96DFBB", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                    <div style={{ paddingLeft: ".3em" }}>
                      <a target="_blank" rel="noopener noreferrer"
                        href={item.url} style={{ fontSize: "1.3em" }}>
                        {item.url}
                      </a>
                      <br/>
                      <br/>
                      <Icon icon={notesShow ? "angle-down" : "angle-right"} onClick={() => setNotesShow(!notesShow)} /> Notes
                      <Collapse in={notesShow}>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {notes.map((n, i) => {
                            return (
                              <li key={i}>{n}</li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </div>
                  </List.Item>
                );
              }
            }
            else { //pure source
              console.log("pure source");
              return (
                <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                  <div style={{ backgroundColor: "#ADF4FF", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                  <div style={{ paddingLeft: ".3em" }}>
                    <a target="_blank" rel="noopener noreferrer"
                      href={item.url} style={{ fontSize: "1.3em" }}>
                      {item.url}
                    </a>
                  </div>
                </List.Item>
              );
            }
          } else return null;
        })}
      </List>
    </div>
  );
}

export default ListView;

//GET '/projects/{project_id}/items'
//(source) id, url, title, content
//GET '/sources/{source_id}'
//highlights, notes
//will need clusters endpoints as well