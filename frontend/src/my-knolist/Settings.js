import React from "react";
import Header from "./Header.js"
import Sidebar from "./Sidebar.js";

function Settings() {
  return (
    <div>
      <Header showSearch={false}/>
      <Sidebar />
    </div>
  );
}

export default Settings;