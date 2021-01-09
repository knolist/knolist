import React from "react";
import MyKnolistRecent from "./MyKnolistRecent.js";
import MyKnolistAll from "./MyKnolistAll.js";

function MyKnolistMain() {
  return (
    <div className="myknolist-main-container">
      <div className="myknolist-main-title">
        My Knolist
      </div>
      <div className="myknolist-new-button">
        New
      </div>
      <MyKnolistRecent />
      <MyKnolistAll />
    </div>
  );
}

export default MyKnolistMain;