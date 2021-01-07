import React from "react";
import {Alert, Dropdown, Icon, IconButton, Tooltip, Whisper} from "rsuite";

class AppFooter extends React.Component {
    newSourceButton = () => {
        return (
            <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="plus"/>}
                        circle size="lg"/>
        )
    }

    render() {
        return (
            <div id="footer">
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Fit To Screen</Tooltip>}
                         placement="topStart">
                    <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="arrows-alt"/>} circle
                                size="lg" onClick={this.props.fit}/>
                </Whisper>

                <Dropdown style={{marginRight: 15}} trigger={["click", "hover"]} placement="topEnd"
                          renderTitle={this.newSourceButton}>
                    <Dropdown.Item onClick={() => Alert.warning("Feature coming soon...")}>
                        <Icon icon="file-o"/> Add File
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.props.setAddSourceMode("URL")}>
                        <Icon icon="globe2"/> Add Web Page
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.props.setAddSourceMode("Notes")}>
                        <Icon icon="edit"/> Add Notes
                    </Dropdown.Item>
                </Dropdown>
            </div>
        )
    }
}

export default AppFooter;