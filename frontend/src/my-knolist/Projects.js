import React from "react";
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import MyKnolistMain from "./MyKnolistMain.js";

function Projects(props) {
  return(
    <div>
      <Header />
      <Sidebar />
      <MyKnolistMain />
    </div>
  );
}

export default Projects;