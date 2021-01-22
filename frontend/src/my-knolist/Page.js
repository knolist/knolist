import React, { useState } from "react";
import Header from "./Header.js";
import Sidebar from "./Sidebar.js";
import Main from "./Main.js";

/*
    Renders the components that make up the entire page
    (My Projects, Shared With Me, and Archived)

    Contains states for sorting and searching. These states
    are changed in child components, which triggers a rerender
    of the page. Also controls the content the page shows:
    shared projects, archived projects, etc.
*/
function Page(props) {
    let showRecent = false; //only want to show the recent section for My Projects
    let sharedOnly = false;
    let archivedOnly = false;
    if (props.url === "/my-projects") showRecent = true;
    if (props.url === "/shared") sharedOnly = true;
    if (props.url === "/archived") archivedOnly = true;

    const [sortCriterion, setSortCriterion] = useState(""); //current sort option
    const [searchQuery, setSearchQuery] = useState(""); //current search query

    //reset showRecent to false if there's an active search query
    //so just the search results are displayed on the page
    if (searchQuery !== "") showRecent = false;

    return (
        <div>
            <Header
                setSortCriterion={setSortCriterion}
                sortCriterion={sortCriterion}
                setSearchQuery={setSearchQuery}
                showSearch={true}/>
            <Sidebar />
            <Main
                showRecent={showRecent}
                sharedOnly={sharedOnly}
                archivedOnly={archivedOnly}
                sortCriterion={sortCriterion}
                searchQuery={searchQuery} />
        </div>
    );
}

export default Page;