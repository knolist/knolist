import React from "react";
import MyKnolistHeader from "./MyKnolistHeader.js";
import MyKnolistSidenav from "./MyKnolistSidenav.js";
import MyKnolistMain from "./MyKnolistMain.js";

function MyKnolist(props) {
  return(
    <div>
      <MyKnolistHeader />
      <MyKnolistSidenav />
      <MyKnolistMain />
    </div>
  );
}

export default MyKnolist;