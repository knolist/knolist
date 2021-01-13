import React from "react";
import MyKnolistRecent from "./MyKnolistRecent.js";
import MyKnolistAll from "./MyKnolistAll.js";
import AddButton from "../components/AddButton.js";

function ProjectsDisplay() {
  return (
    <div className="myknolist-main-container">
      <div className="myknolist-title">
        Recent
      </div>
      <MyKnolistRecent />
      <MyKnolistAll />
      <div style={{position:"fixed", right:0, bottom:0}}><AddButton /></div>
    </div>
  );
}

export default ProjectsDisplay;