import React from "react";

function MyKnolistSideNav() {
  return (
    <div className="myknolist-sidenav">
      <div style={{"color":"white"}}>My Knolist</div>
      <div style={{"color":"#656869"}}>Recent</div>
      <div style={{"color":"#656869"}}>Trash</div>
    </div>
  );
}

export default MyKnolistSideNav;