import React from "react";
import {Button, Icon, Modal} from "rsuite";

function ConfirmDeletionWindow(props) {
    return (
        <Modal backdrop="static" show={props.confirmDelete} onHide={props.resetDelete} size="xs">
            <Modal.Body>
                <Icon icon="remind" style={{color: '#ffb300', fontSize: 24}}/>
                {'  '}
                Are you sure you want to delete "{props.title}"?
                <br/>
                <b>This action cannot be undone.</b>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.delete} appearance="primary" loading={props.loading}>
                    Delete
                </Button>
                <Button onClick={props.resetDelete} appearance="default">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ConfirmDeletionWindow;