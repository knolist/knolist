import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, CheckboxGroup, Tooltip, Whisper
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        // citationsIncluded = []
        const formats = {
            APA: "APA",
            MLA: "MLA",
            CHI: "Chicago"
        }
        this.state = {
            curFormat: formats.APA,
            copyBib: false,
            formats: formats,
        }
    }

    removeFromSaved = (value) => {
        this.setState({
            // citationsIncluded removes that citation
            // citation is moved down and greyed out
        });
    }

    changeFormatType = (value) => {
        this.setState({
            curFormat: value
        });
    }

    // if sources have fields as None, return True
    // {if(isMissingFields(this.props.sources)) {<Icon icon="exclamation-circle" color="#f5a623"/>}}
    isMissingFields = (sources) => {
        this.setState({

        });
    }

    renderFormatType = (source) => {
        if (this.state.curFormat === this.state.formats.APA){
            return <p>source.author. (source.publishDate). "{source.title}." <i>source.siteName</i>, {source.url}.</p> 
        } else if (this.state.curFormat === this.state.formats.CHI){
            return <p>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate. source.accessDate. {source.url}.</p>
        } else if (this.state.curFormat === this.state.formats.MLA) {
            return <p>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate, {source.url}. Accessed source.accessDate. </p>
        }
    }

    setShowEditWindow = (clicked) => {
        // Keeps track if Bibliography Generation Button clicked and Window should open
        this.setState({
            showEditWindow: clicked
        });
    }

    render() {
        const formats = this.state.formats;
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header>
                    <Modal.Title>
                    Bibliography
                    {/* TODO: Set copyBib state to "export"
                    <IconButton onClick={() => this.state.copyBib(true)} icon={<Icon icon="copy"/>}/>
                    */}
                    <IconButton icon={<Icon icon="copy"/>}/>
                    <SelectPicker labelKey={this.state.curFormat} labelValue={this.state.curFormat} data={[formats]} onChange={this.changeFormatType}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        <p>Included</p>
                        {this.props.sources.map((source,index) => 
                            <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                                {this.renderFormatType(source)}
                                <Whisper placement="bottomStart" trigger="hover"  speaker={<Tooltip>This source is missing a field</Tooltip>}>
                                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                                </Whisper>
                                <EditCitationButton hide={false} editMode={this.state.editMode}
                                      setEditMode={this.setEditMode}/>
                            </Checkbox>)}
                        <p>Not Included</p>
                    </CheckboxGroup>
                </Modal.Body>
            </Modal>
        );
    }
}

class EditCitationButton extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        }
    }

    setEditMode = (val) => {
        this.setState({editMode: val});
    }

    render () {
        const buttonSize = "xs";
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Citation Fields</Tooltip>} placement="top">
                <IconButton onClick={() => this.setEditMode(true)} icon={<Icon icon="edit2"/>} size={buttonSize}/>
            </Whisper>
        );
    }
}

export default BibWindow;