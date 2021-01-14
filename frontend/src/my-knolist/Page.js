import React from "react";
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import Main from "./Main.js";

function Page(props) {
  let showRecent = false;
  if (props.url === "/my-projects") showRecent = true;

  return(
    <div>
      <Header />
      <Sidebar />
      <Main showRecent={showRecent}/>
    </div>
  );
}

export default Page;