import React, { useState, useEffect } from "react";
import Recent from "./Recent.js";
import All from "./All.js";
import AddButton from "../components/AddButton.js";
import makeHttpRequest from "../services/HttpRequest.js";
import NewProjectModal from "../components/NewProjectModal.js";
import { Loader } from "rsuite";

/*
  Renders the main display of projects + new project button

  Fetches every project the user has, which is passed to
  child components for filtering
*/
function Main(props) {
  const [show, setShow] = useState(false);
  const [projects, setProjects] = useState(null);
  //Stops making an API call on every render which makes my computer breathe heavy lol
  const [gotProjects, setGotProjects] = useState(false);

  // fromMain is false if you call from anywhere outside this file
  const getProjects = (fromMain) => {
      if(!fromMain) setGotProjects(false);
      if (!gotProjects) {
      makeHttpRequest("/projects")
        .then(res => setProjects(res.body.projects));
      setGotProjects(true);
    }
  }

  //Async function above works only when used in combination with
  //a lifecycle function (this is basically a componentDidMount)
  useEffect(() => {
    getProjects(true);
  });

  if (projects !== null) {
    return (
      <div id="myknolist-main-container">
        <Recent show={props.showRecent} projects={projects} getProjects={getProjects}/>
        <All
          projects={projects}
          sharedOnly={props.sharedOnly}
          archivedOnly={props.archivedOnly}
          sortCriterion={props.sortCriterion}
          searchQuery={props.searchQuery}
          getProjects={getProjects}/>
        <div
          style={{ position: "fixed", right: 0, bottom: 0 }}
          onClick={() => setShow(true)}>
          <AddButton />
        </div>

        <NewProjectModal show={show} setShow={setShow} fromSidebar={false} />
      </div>
    );
  } else return <Loader size="lg" center />;
}

export default Main;