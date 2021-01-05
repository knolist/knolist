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
        const endpoint = "/sources/" + this.state.sourceDetails.id;
        makeHttpRequest(endpoint, "DELETE").then(() => {
            this.props.renderNetwork(() => {
                this.close();
                this.setConfirmDelete(false);
            });
        })
    }

    close = () => {
        this.props.setSelectedNode(null);
    }

    getSourceDetails = async () => {
        if (this.props.selectedNode === null) {
            this.setState({sourceDetails: null});
            return;
        }

        const endpoint = "/sources/" + this.props.selectedNode;
        const response = await makeHttpRequest(endpoint);
        this.setState({sourceDetails: response.body.source});
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
            return (
                <div>
                    <ConfirmDeletionWindow confirmDelete={this.state.confirmDelete}
                                           resetDelete={() => this.setConfirmDelete(false)}
                                           title={source.title} delete={this.deleteSource}
                                           loading={this.state.loadingDelete}/>
                    <Modal full show onHide={this.close}>
                        <Modal.Header>
                            <Modal.Title>
                                <SourceTitle source={source} getSourceDetails={this.getSourceDetails}
                                             renderNetwork={this.props.renderNetwork}/>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <HighlightsList highlights={source.highlights} sourceId={source.id}
                                            getSourceDetails={this.getSourceDetails}/>
                            <Divider/>
                            <NotesList notes={source.notes} sourceId={source.id}
                                       getSourceDetails={this.getSourceDetails}/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Delete Source</Tooltip>}
                                     placement="bottom">
                                <IconButton onClick={() => this.setConfirmDelete(true)} icon={<Icon icon="trash"/>}
                                            size="lg"/>
                            </Whisper>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }

        return <Loader size="lg" backdrop center/>;
    }
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
        const endpoint = "/sources/" + this.props.source.id;
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

class HighlightsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            selectedHighlights: [],
            loading: false
        }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    setEditMode = (val) => {
        this.setState({editMode: val}, () => this.setSelectedHighlights([]));
    }

    setSelectedHighlights = (arr) => {
        this.setState({selectedHighlights: arr});
    }

    deleteSelectedHighlights = () => {
        this.setLoading(true);
        const endpoint = "/sources/" + this.props.sourceId + "/highlights";
        const body = {
            delete: this.state.selectedHighlights
        }

        makeHttpRequest(endpoint, "DELETE", body).then(() => {
            this.props.getSourceDetails().then(() => {
                this.setEditMode(false);
                this.setLoading(false);
            });
        })
    }

    renderAddHighlightsMessage = () => {
        if (this.props.highlights.length > 0) return null;

        // TODO: include link to the Chrome Extension on the store.
        const chromeExtensionLink = "https://chrome.google.com/webstore/category/extensions?utm_source=chrome-ntp-icon";
        return <p>To add highlights, use the <a rel="noopener noreferrer" target="_blank"
                                                href={chromeExtensionLink}>Knolist Chrome Extension</a>.
            Select text on a page, right-click, then click on "Highlight with Knolist".</p>
    }

    renderHighlightsList = () => {
        if (!this.state.editMode) {
            return (
                <ul>
                    {this.props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
                </ul>
            )
        }
        return (
            <CheckboxGroup onChange={this.setSelectedHighlights} value={this.state.selectedHighlights}>
                {this.props.highlights.map((highlight, index) => <Checkbox key={index}
                                                                           value={index}>{highlight}</Checkbox>)}
            </CheckboxGroup>
        )
    }

    renderDeleteHighlightsButton = () => {
        if (this.state.selectedHighlights.length === 0) return null;

        return <Button onClick={this.deleteSelectedHighlights} size="xs" loading={this.state.loading}>
            Delete Selected Highlights
        </Button>
    }

    render() {
        return (
            <div>
                <div style={{display: "flex"}} className="source-view-subtitle">
                    <h6 style={{marginRight: 10}}>{this.props.highlights.length > 0 ? "My Highlights" : "You haven't added any highlights yet"}</h6>
                    <ButtonToolbar>
                        <EditSourceItemButton hide={this.props.highlights.length === 0} editMode={this.state.editMode}
                                              setEditMode={this.setEditMode} tooltipText="Edit Highlights"/>
                        {this.renderDeleteHighlightsButton()}
                    </ButtonToolbar>
                </div>
                {this.renderAddHighlightsMessage()}
                {this.renderHighlightsList()}
            </div>
        );
    }
}

class NotesList extends React.Component {
    constructor(props) {
        super(props);
        const modes = {
            NULL: null,
            EDIT: "edit",
            ADD: "add"
        }
        this.state = {
            loading: false,
            loadingNoteUpdate: false,
            mode: modes.NULL,
            modes: modes,
            newNotesInputId: "new-notes-input",
            selectedNotes: []
        }
    }

    setSelectedNotes = (arr) => {
        this.setState({selectedNotes: arr});
    }

    setMode = (val) => {
        if (Object.values(this.state.modes).includes(val)) {
            // If a note is being updated, wait for that to be over
            if (this.state.loadingNoteUpdate) {
                this.setLoading(true);
                setTimeout(() => this.setMode(val), 50); // Wait 50 milliseconds then recheck
                return;
            }
            this.setLoading(false);

            this.setState({mode: val}, () => this.setSelectedNotes([]));
        }
    }

    isEditMode = () => {
        return this.state.mode === this.state.modes.EDIT;
    }

    isAddMode = () => {
        return this.state.mode === this.state.modes.ADD;
    }

    setEditMode = (val) => {
        if (val) this.setMode(this.state.modes.EDIT);
        else this.setMode(this.state.modes.NULL);
    }

    setShowNewNotesForm = (val) => {
        if (val) this.setMode(this.state.modes.ADD);
        else this.setMode(this.state.modes.NULL);
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    setLoadingNoteUpdate = (val) => {
        this.setState({loadingNoteUpdate: val});
    }

    addNotes = () => {
        this.setLoading(true);
        const newNotes = document.getElementById(this.state.newNotesInputId).value;
        const endpoint = "/sources/" + this.props.sourceId + "/notes";
        const body = {
            "note": newNotes
        }

        makeHttpRequest(endpoint, "POST", body).then(() => {
            // Update source
            this.props.getSourceDetails().then(() => {
                this.setShowNewNotesForm(false);
                this.setLoading(false);
            });
        });
    }

    updateNotes = (index, value) => {
        // Only update if it's different
        if (this.props.notes[index] !== value) {
            this.setLoadingNoteUpdate(true);
            const endpoint = "/sources/" + this.props.sourceId + "/notes";
            const body = {
                "note_index": index,
                "new_content": value
            }
            makeHttpRequest(endpoint, "PATCH", body).then(() => {
                this.props.getSourceDetails().then(() => this.setLoadingNoteUpdate(false));
            })
        }
    }

    deleteSelectedNotes = () => {
        this.setLoading(true);
        const endpoint = "/sources/" + this.props.sourceId + "/notes";
        const body = {
            delete: this.state.selectedNotes
        }

        makeHttpRequest(endpoint, "DELETE", body).then(() => {
            this.props.getSourceDetails().then(() => {
                this.setMode(this.state.modes.NULL);
                this.setLoading(false);
            });
        })
    }

    renderNewNotesButton = () => {
        const buttonSize = "xs";
        let buttonAppearance = "default";
        if (this.props.notes.length === 0) buttonAppearance = "primary";

        if (this.isAddMode()) {
            return <Button onClick={() => this.setShowNewNotesForm(false)}
                           size={buttonSize}>Cancel</Button>
        } else {
            return (
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Add Notes</Tooltip>} placement="top">
                    <IconButton appearance={buttonAppearance} onClick={() => this.setShowNewNotesForm(true)}
                                icon={<Icon icon="plus"/>} size={buttonSize}/>
                </Whisper>
            );
        }
    }

    renderDeleteNotesButton = () => {
        if (this.state.selectedNotes.length === 0) return null;

        return <Button onClick={this.deleteSelectedNotes} size="xs" loading={this.state.loading}>
            Delete Selected Notes
        </Button>
    }

    renderNotesList = () => {
        if (!this.isEditMode()) {
            return (
                <ul>
                    {this.props.notes.map((notes, index) => <li key={index}>{notes}</li>)}
                </ul>
            )
        }
        return (
            <CheckboxGroup onChange={this.setSelectedNotes} value={this.state.selectedNotes}>
                {this.props.notes.map((notes, index) => {
                    return <Checkbox key={index} value={index}>
                        <Input defaultValue={notes} onBlur={(e) => this.updateNotes(index, e.target.value)}/>
                    </Checkbox>
                })}
            </CheckboxGroup>
        )
    }

    renderNewNotesForm = () => {
        if (!this.isAddMode()) return null;

        const fontSize = 14;
        return (
            <Form style={{display: "flex"}} onSubmit={this.addNotes}>
                <Input style={{fontSize: fontSize, width: 400, marginRight: 10}} id={this.state.newNotesInputId}
                       placeholder="Insert Notes" autoFocus required/>
                <Button style={{fontSize: fontSize}} type="submit"
                        appearance="primary" loading={this.state.loading}>Add Note</Button>
            </Form>
        );
    }

    render() {
        return (
            <div>
                <div style={{display: "flex"}} className="source-view-subtitle">
                    <h6 style={{marginRight: 10}}>
                        {this.props.notes.length > 0 ? "My Notes" : "You haven't added any notes yet"}
                    </h6>
                    <ButtonToolbar>
                        {this.renderNewNotesButton()}
                        <EditSourceItemButton hide={this.props.notes.length === 0} editMode={this.isEditMode()}
                                              setEditMode={this.setEditMode} loading={this.state.loading}
                                              tooltipText="Edit Notes"/>
                        {this.renderDeleteNotesButton()}
                    </ButtonToolbar>
                </div>
                {this.renderNotesList()}
                {this.renderNewNotesForm()}
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