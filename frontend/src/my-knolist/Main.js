import React, {useState, useEffect} from "react";
import Recent from "./Recent.js";
import All from "./All.js";
import AddButton from "../components/AddButton.js";
import makeHttpRequest from "../services/HttpRequest.js";
import NewProjectModal from "./NewProjectModal.js";
import { Loader } from "rsuite";

function Main(props) {
    const [show, setShow] = useState(false);
    const [projects, setProjects] = useState(null);
    //get rid of this later? Stops making an API call on every render which makes my computer breathe heavy lol
    const [gotProjects, setGotProjects] = useState(false);

    const getProjects = () => {
        if (!gotProjects) {
            makeHttpRequest("/projects")
                .then(res => setProjects(res.body.projects));
            setGotProjects(true);
        }
    }

    useEffect(() => {
        getProjects();
        if (projects !== null) console.log(projects);
    });

    if (projects !== null) { //is there a better way to do this
        return (
            <div id="myknolist-main-container">
                <Recent show={props.showRecent} projects={projects}/>
                <All projects={projects} sharedOnly={props.sharedOnly} archivedOnly={props.archivedOnly}/>
                <div
                    style={{position: "fixed", right: 0, bottom: 0}}
                    onClick={() => setShow(true)}>
                    <AddButton/>
                </div>

                <NewProjectModal show={show} setShow={setShow}/>
            </div>
        );
    } else return <Loader size="lg" center/>;
}

export default Main;