import React, { useState, useEffect } from "react";
import { List } from "rsuite";
import makeHttpRequest from "../services/HttpRequest.js";

function ListView(props) {
  const [items, setItems] = useState([]);
  //Stops making an API call on every render
  const [gotItems, setGotItems] = useState(false);

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

  const getAllContent = (url) => {
    let content = [];
    items.forEach(item => {
      if (item.url && item.url === url && item.content) {
        content.push(item.content);
      }
    });
    return content;
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
            const content = getAllContent(item.url);
            console.log("content for url " + item.url + ": " + content);
            console.log(content.length);
            if (content.length > 0) { //source and note/highlight
              return (
                <List.Item key={index} style={{ paddingLeft: "1em", paddingRight: "1em" }}>
                  <div style={{ backgroundColor: "#96DFBB", width: ".5%", height: "100%", position: "absolute", left: 0, top: 0 }}></div>
                  <div style={{ paddingLeft: ".3em" }}>
                    <a target="_blank" rel="noopener noreferrer"
                      href={item.url} style={{ fontSize: "1.3em" }}>
                      {item.url}
                    </a>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      {content.map((c, i) => {
                        return (
                          <li key={i}>{c}</li>
                        );
                      })}
                    </ul>
                  </div>
                </List.Item>
              );
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