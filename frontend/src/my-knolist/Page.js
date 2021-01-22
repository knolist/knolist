import React, { useState } from "react";
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

    const [sortCriterion, setSortCriterion] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div>
            <Header
                setSortCriterion={setSortCriterion}
                sortCriterion={sortCriterion}
                setSearchQuery={setSearchQuery}/>
            <Sidebar />
            <Main
                showRecent={showRecent}
                sharedOnly={sharedOnly}
                archivedOnly={archivedOnly}
                sortCriterion={sortCriterion} />
        </div>
    );
}

export default Page;