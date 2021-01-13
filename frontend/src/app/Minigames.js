import React from 'react';
import {
    // Note: I will remove the uneccessary comments/imports when I am done! 
    // eslint-disable-next-line
    Tooltip, Whisper, Alert, Dropdown, FlexboxGrid, Icon, IconButton
} from "rsuite";

// Primarily pulled from app header

class MiniGames extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // newSourceUrlId: "new-source-url",
            loading: false
        }
    }
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

    // if (!this.props.showNewSourceForm) return null;

    // return (
    //     <Modal show onHide={this.close}>
    //         <Modal.Header>
    //             <Modal.Title>
    //                 Insert the URL of the source you'd like to add
    //             </Modal.Title>
    //         </Modal.Header>
    //         <Form onSubmit={this.addNewSource}>
    //             <Modal.Body>
    //                 <Input autoFocus type="url" required id={this.state.newSourceUrlId}
    //                     placeholder="New Source URL" />
    //             </Modal.Body>
    //             <Modal.Footer>
    //                 <Button type="submit" loading={this.state.loading} appearance="primary">
    //                     Add Source
    //                 </Button>
    //             </Modal.Footer>
    //         </Form>
    //     </Modal>
    // );


    render() {

        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Mini Games</Tooltip>}
                placement="topEnd">
                <IconButton appearance="primary" icon={<Icon icon="gamepad" />} circle
                    size="lg" onClick={() => this.props.setShowGame(true)}
                    // size="lg" onClick={() => Alert.warning("Feature coming soon...")}
                    style={{
                        top: '50%',
                        position: "absolute",
                        right: 5,
                        zIndex: 1
                    }} />
            </Whisper>
        );
    }
}

export default MiniGames;
