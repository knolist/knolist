import React from "react";
import {Alert, Dropdown, Icon, IconButton, Tooltip, Whisper} from "rsuite";
import AddButton from "../components/AddButton.js";

class AppFooter extends React.Component {
    newItemButton = () => {
        return (
            <AddButton/>
        )
    }

    render() {
        return (
<<<<<<< HEAD
            <div style={{bottom:0}}>
=======
            <div>
>>>>>>> 48ea81ca0b9e8b5dc91f18513384f022f54a7f6f
                <div style={{position: "absolute", left: 0, bottom: 0}}>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Fit To Screen</Tooltip>}
                            placement="topStart">
                        <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="arrows-alt"/>} circle
                                    size="lg" onClick={this.props.fit}/>
                    </Whisper>
                </div>
<<<<<<< HEAD
                <a style={{margin: 25, bottom:0, left:0, right:0, position:"absolute", textAlign:"center"}}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={process.env.REACT_APP_FEEDBACK_LINK}>
                            Feedback?
                    </a>
=======
                <a style={{position: "absolute", left: "50%", bottom: 0, marginBottom: 20, transform: "translate(-50%, 0)"}}
                   target="_blank"
                   rel="noopener noreferrer"
                   href={process.env.REACT_APP_FEEDBACK_LINK}>
                    Feedback?
                </a>
>>>>>>> 48ea81ca0b9e8b5dc91f18513384f022f54a7f6f
                <div style={{position: "absolute", right: 0, bottom: 0}}>
                    <Dropdown style={{marginRight: 15}} trigger={["click", "hover"]} placement="topEnd"
                            renderTitle={this.newItemButton}>
                        <Dropdown.Item onClick={() => Alert.warning("Feature coming soon...")}>
                            <Icon icon="file-o"/> Add File
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => this.props.setAddItemMode("URL")}>
                            <Icon icon="globe2"/> Add Web Page
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => this.props.setAddItemMode("Note")}>
                            <Icon icon="edit"/> Add Notes
                        </Dropdown.Item>
                    </Dropdown>
                </div>
<<<<<<< HEAD
=======
            </div>
        )
    }
}

/*
return (
            <div id="footer">
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Fit To Screen</Tooltip>}
                         placement="topStart">
                    <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="arrows-alt"/>} circle
                                size="lg" onClick={this.props.fit}/>
                </Whisper>

                <a style={{marginTop: 25}}
                   target="_blank"
                   rel="noopener noreferrer"
                   href={process.env.REACT_APP_FEEDBACK_LINK}>
                    Feedback?
                </a>

                <Dropdown style={{marginRight: 15}} trigger={["click", "hover"]} placement="topEnd"
                          renderTitle={this.newItemButton}>
                    <Dropdown.Item onClick={() => Alert.warning("Feature coming soon...")}>
                        <Icon icon="file-o"/> Add File
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.props.setAddItemMode("URL")}>
                        <Icon icon="globe2"/> Add Web Page
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.props.setAddItemMode("Note")}>
                        <Icon icon="edit"/> Add Notes
                    </Dropdown.Item>
                </Dropdown>
>>>>>>> 48ea81ca0b9e8b5dc91f18513384f022f54a7f6f
            </div>
        )
*/

export default AppFooter;