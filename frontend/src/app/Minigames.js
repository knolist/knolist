import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Primarily pulled from app header

class MiniGames extends React.Component {
    // constructor(props) {
    //     super(props);
    //     // TODO: make backend endpoint to return the filter categories
    //     // const filterCategories = [
    //     //     "Page Content",
    //     //     "URL",
    //     //     "Title",
    //     //     "Next Connections",
    //     //     "Previous Connections",
    //     //     "Highlights",
    //     //     "Notes"
    //     // ]
    //     // this.state = {
    //     //     indeterminate: false,
    //     //     checkAll: true,
    //     //     value: filterCategories,
    //     //     filterCategories: filterCategories
    //     // };
    // }

    render() {
        return (
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>MiniGames</Tooltip>}
                         placement="topEnd">
                <IconButton id="projects-sidebar-btn" appearance="primary" icon={<Icon icon="bolt"/>} circle
                    size="lg" onClick={() => Alert.warning("Feature coming soon...")} 
                    style={{
                        top: '50%'
                    }}/>
                </Whisper>
        );
    }
}

export default MiniGames;
