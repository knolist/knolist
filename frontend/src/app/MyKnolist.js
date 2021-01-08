import React from "react";
import MyKnolistTop from "./MyKnolistTop.js";
import MyKnolistSidenav from "./MyKnolistSidenav.js";
import MyKnolistMain from "./MyKnolistMain.js";

function MyKnolist(props) {
  return(
    <div>
      <MyKnolistTop />
      <MyKnolistSidenav />
      <MyKnolistMain />
    </div>
  );
}

export default MyKnolist;