import React from "react";
import {
    Button, ButtonToolbar, Checkbox, CheckboxGroup, Divider, Form, Icon, IconButton,
    Input, Loader, Modal, Tooltip, Whisper
} from "rsuite";

import ConfirmDeletionWindow from "../components/ConfirmDeletionWindow";

import makeHttpRequest from "../services/HttpRequest";

class SourceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceDetails: null,
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

    deleteSource = () => {
        this.setLoadingDelete(true);
        const endpoint = "/items/" + this.state.sourceDetails.id;
        makeHttpRequest(endpoint, "DELETE").then(() => {
            this.close();
            this.props.renderNetwork(() => {
                this.setConfirmDelete(false);
            });
        })
    }

    addNewNote = () => {
        this.props.setAddSourceMode("Note", this.state.sourceDetails.url);
        this.close();
    }

    close = () => {
        this.props.setSelectedNode(null);
    }

    getSourceDetails = async () => {
        if (this.props.selectedNode === null) {
            this.setState({sourceDetails: null});
            return;
        }

        const endpoint = "/items/" + this.props.selectedNode;
        const response = await makeHttpRequest(endpoint);
        this.setState({sourceDetails: response.body.item});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedNode !== this.props.selectedNode) {
            this.getSourceDetails();
        }
    }

    componentDidMount() {
        this.getSourceDetails();
    }
    render() {
        if (this.props.selectedNode === null) return null;

        
        
        if (this.state.sourceDetails !== null) {
            const source = this.state.sourceDetails;

            let modalHeaderAndBody = <div />;
            if (this.props.typeOfNode === "sourceAndNote") {
                modalHeaderAndBody = 
                    <SourceAndNoteView source={source} getSourceDetails={this.getSourceDetails}
                            renderNetwork={this.props.renderNetwork} />
            } else if (this.props.typeOfNode === "sourceAndHighlight") {
                modalHeaderAndBody = 
                    <SourceAndHighlightView source={source} getSourceDetails={this.getSourceDetails}
                            renderNetwork={this.props.renderNetwork} />
            } else if (this.props.typeOfNode === "pureNote") {
                modalHeaderAndBody = 
                    <PureNoteView source={source} getSourceDetails={this.getSourceDetails}
                            renderNetwork={this.props.renderNetwork} />
            } else if (this.props.typeOfNode === "pureSource") {
                modalHeaderAndBody =
                    <PureSourceView source={source} getSourceDetails={this.getSourceDetails}
                            renderNetwork={this.props.renderNetwork} />
            }
                 
            return (
                <div>
                    <ConfirmDeletionWindow confirmDelete={this.state.confirmDelete}
                                           resetDelete={() => this.setConfirmDelete(false)}
                                           title={source.title} delete={this.deleteSource}
                                           loading={this.state.loadingDelete}/>
                    <Modal full show onHide={this.close}>
                        {modalHeaderAndBody}
                        <Modal.Footer>
                            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Delete Source</Tooltip>}
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
                    {props.source.content.trim(100)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NoteContent source={props.source} getSourceDetails={props.getSourceDetails}
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
                    <SourceTitle source={props.source} getSourceDetails={props.getSourceDetails}
                                    renderNetwork={props.renderNetwork}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.source.content}
            </Modal.Body>
        </div>
    )
 }

function SourceAndNoteView(props) {
    return (
            <div>
            <Modal.Header>
                <Modal.Title>
                    <SourceTitle source={props.source} getSourceDetails={props.getSourceDetails}
                                    renderNetwork={props.renderNetwork}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NoteContent source={props.source} getSourceDetails={props.getSourceDetails}
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
                    <SourceTitle source={props.source} getSourceDetails={props.getSourceDetails}
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
        if (newTitle === this.props.source.title) {
            callback();
            return;
        }
        this.setLoading(true);
        const endpoint = "/items/" + this.props.source.id;
        const body = {
            "title": newTitle
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.renderNetwork(() => {
                this.props.getSourceDetails().then(() => {
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
            return <Input style={{width: 400, marginRight: 10}} defaultValue={this.props.source.title}
                          id={this.state.newSourceTitleInputId} autoFocus required/>
        } else {
            return <a target="_blank" rel="noopener noreferrer" style={{marginRight: 10}}
                      href={this.props.source.url}>{this.props.source.title}</a>
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
        if (newContent === this.props.source.content) {
            callback();
            return;
        }
        this.setLoading(true);
        const endpoint = "/items/" + this.props.source.id;
        const body = {
            "content": newContent
        }

        makeHttpRequest(endpoint, "PATCH", body).then(() => {
            this.props.renderNetwork(() => {
                this.props.getSourceDetails().then(() => {
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
            return <Input style={{width: 400, marginRight: 10}} defaultValue={this.props.source.content}
                          id={this.state.noteContentId} autoFocus required/>
        } else {
            return (
                <div>
                    {this.props.source.content}
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

export default SourceView;