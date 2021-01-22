import React from "react";
import {
    Button, Icon, IconButton, Input, Loader, Modal, Tooltip, Whisper
} from "rsuite";

import ConfirmDeletionWindow from "../components/ConfirmDeletionWindow";
import makeHttpRequest from "../services/HttpRequest";

class ItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemDetails: null,
            confirmDelete: false,
            loadingDelete: false
        }
    }

    setConfirmDelete = (val) => {
        this.setState({confirmDelete: val}, () => this.setLoadingDelete(false));
    }

    setLoadingDelete = (val) => {
        this.setState({loadingDelete: val});
    }

    deleteItem = () => {
        this.setLoadingDelete(true);
        const endpoint = "/items/" + this.state.itemDetails.id;
        makeHttpRequest(endpoint, "DELETE").then(() => {
            this.props.renderNetwork(() => {
                this.setConfirmDelete(false);
                this.close();
            });
        })
    }

    addNewNote = () => {
        this.props.setAddItemMode("Note", this.state.itemDetails.url);
        this.close();
    }

    close = () => {
        this.props.setSelectedNode(null);
    }

    getItemDetails = async () => {
        if (this.props.selectedNode === null) {
            this.setState({itemDetails: null});
            return;
        }

        const endpoint = "/items/" + this.props.selectedNode;
        const response = await makeHttpRequest(endpoint);
        this.setState({itemDetails: response.body.item});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedNode !== this.props.selectedNode) {
            this.getItemDetails();
        }
    }

    componentDidMount() {
        this.getItemDetails();
    }

    render() {
        if (this.props.selectedNode === null) return null;


        if (this.state.itemDetails !== null) {
            const item = this.state.itemDetails;

            let modalHeaderAndBody = <div/>;
            if (this.props.typeOfNode === "sourceAndNote") {
                modalHeaderAndBody =
                    <SourceAndNoteView item={item} getItemDetails={this.getItemDetails}
                                       renderNetwork={this.props.renderNetwork}/>
            } else if (this.props.typeOfNode === "sourceAndHighlight") {
                modalHeaderAndBody =
                    <SourceAndHighlightView item={item} getItemDetails={this.getItemDetails}
                                            renderNetwork={this.props.renderNetwork}/>
            } else if (this.props.typeOfNode === "pureNote") {
                modalHeaderAndBody =
                    <PureNoteView item={item} getItemDetails={this.getItemDetails}
                                  renderNetwork={this.props.renderNetwork}/>
            } else if (this.props.typeOfNode === "pureSource") {
                modalHeaderAndBody =
                    <PureSourceView item={item} getItemDetails={this.getItemDetails}
                                    renderNetwork={this.props.renderNetwork}/>
            }

            return (
                <div>
                    <ConfirmDeletionWindow confirmDelete={this.state.confirmDelete}
                                           resetDelete={() => this.setConfirmDelete(false)}
                                           title={item.title} delete={this.deleteItem}
                                           loading={this.state.loadingDelete}/>
                    <Modal full show onHide={this.close}>
                        {modalHeaderAndBody}
                        <Modal.Footer>
                            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Delete Item</Tooltip>}
                                     placement="bottom">
                                <IconButton onClick={() => this.setConfirmDelete(true)} icon={<Icon icon="trash"/>}
                                            size="lg"/>
                            </Whisper>
                            <Button appearance="primary" onClick={this.addNewNote}>
                                Add New Note
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }

        return <Loader size="lg" backdrop center/>;
    }
}

function PureNoteView(props) {
    return (
        <div>
            <Modal.Header>
                <Modal.Title>
                    {props.item.content.substring(0, 100)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NoteContent item={props.item} getItemDetails={props.getItemDetails}
                             renderNetwork={props.renderNetwork}/>
            </Modal.Body>
        </div>
    )
}

function SourceAndHighlightView(props) {
    return (
        <div>
            <Modal.Header>
                <Modal.Title>
                    <SourceTitle item={props.item} getItemDetails={props.getItemDetails}
                                 renderNetwork={props.renderNetwork}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.item.content}
            </Modal.Body>
        </div>
    )
}

function SourceAndNoteView(props) {
    return (
        <div>
            <Modal.Header>
                <Modal.Title>
                    <SourceTitle item={props.item} getItemDetails={props.getItemDetails}
                                 renderNetwork={props.renderNetwork}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NoteContent item={props.item} getItemDetails={props.getItemDetails}
                             renderNetwork={props.renderNetwork}/>
            </Modal.Body>
        </div>
    )
}

function PureSourceView(props) {
    return (
        <div>
            <Modal.Header>
                <Modal.Title>
                    <SourceTitle item={props.item} getItemDetails={props.getItemDetails}
                                 renderNetwork={props.renderNetwork}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            </Modal.Body>
        </div>
    )
}


class SourceTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            loading: false,
            newSourceTitleInputId: "new-source-title-input"
        }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    updateTitle = (callback) => {
        const newTitle = document.getElementById(this.state.newSourceTitleInputId).value;
        if (newTitle === this.props.item.title) {
            callback();
            return;
        }
        this.setLoading(true);
        const endpoint = "/items/" + this.props.item.id;
        const body = {
            "title": newTitle
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.renderNetwork(() => {
                this.props.getItemDetails().then(() => {
                    this.setLoading(false);
                    callback();
                });
            });
        });
    }

    setEditMode = (val) => {
        if (!val) {
            this.updateTitle(() => this.setState({editMode: val}));
        } else {
            this.setState({editMode: val});
        }
    }

    renderTitle = () => {
        if (this.state.editMode) {
            return <Input style={{width: 400, marginRight: 10}} defaultValue={this.props.item.title}
                          id={this.state.newSourceTitleInputId} autoFocus required/>
        } else {
            return <a target="_blank" rel="noopener noreferrer" style={{marginRight: 10}}
                      href={this.props.item.url}>{this.props.item.title}</a>
        }
    }

    render() {
        return (
            <div style={{display: "flex"}}>
                {this.renderTitle()}
                <EditSourceItemButton hide={false} editMode={this.state.editMode} loading={this.state.loading}
                                      setEditMode={this.setEditMode} tooltipText="Rename"/>
            </div>
        );
    }
}

class NoteContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            loading: false,
            noteContentId: "note-content-input"
        }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    updateContent = (callback) => {
        const newContent = document.getElementById(this.state.noteContentId).value;
        if (newContent === this.props.item.content) {
            callback();
            return;
        }
        this.setLoading(true);
        const endpoint = "/items/" + this.props.item.id;
        const body = {
            "content": newContent
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.renderNetwork(() => {
                this.props.getItemDetails().then(() => {
                    this.setLoading(false);
                    callback();
                });
            });
        });
    }

    setEditMode = (val) => {
        if (!val) {
            this.updateContent(() => this.setState({editMode: val}));
        } else {
            this.setState({editMode: val});
        }
    }

    renderContent = () => {
        if (this.state.editMode) {
            return <Input style={{width: "100%", marginRight: 10}} defaultValue={this.props.item.content}
                          id={this.state.noteContentId} autoFocus required componentClass="textarea" rows={30}/>
        } else {
            return (
                <div>
                    {this.props.item.content}
                </div>
            )
        }
    }

    render() {
        return (
            <div style={{display: "flex"}}>
                {this.renderContent()}
                <EditSourceItemButton hide={false} editMode={this.state.editMode} loading={this.state.loading}
                                      setEditMode={this.setEditMode} tooltipText="Edit"/>
            </div>
        );
    }
}

function EditSourceItemButton(props) {
    if (props.hide) return null;

    const buttonSize = "xs";
    if (props.editMode) {
        return <Button onClick={() => props.setEditMode(false)} loading={props.loading} size={buttonSize}>Done</Button>
    } else {
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>{props.tooltipText}</Tooltip>} placement="top">
                <IconButton onClick={() => props.setEditMode(true)} icon={<Icon icon="edit2"/>} size={buttonSize}/>
            </Whisper>
        );
    }
}

export default ItemView;