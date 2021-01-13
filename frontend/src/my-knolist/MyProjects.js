import React from "react";
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import ProjectsDisplay from "./ProjectsDisplay.js";

function MyProjects(props) {
  return(
    <div>
      <Header />
      <Sidebar />
      <ProjectsDisplay />
    </div>
  );
}

export default MyProjects;