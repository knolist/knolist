import React from "react";
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import Main from "./Main.js";

function Page(props) {
    let showRecent = false;
    let sharedOnly = false;
    let archivedOnly = false;
    if (props.url === "/my-projects") showRecent = true;
    if (props.url === "/shared") sharedOnly = true;
    if (props.url === "/archived") archivedOnly = true;

    return (
        <div>
            <Header/>
            <Sidebar/>
            <Main showRecent={showRecent} sharedOnly={sharedOnly} archivedOnly={archivedOnly}/>
        </div>
    );
}

export default Page;