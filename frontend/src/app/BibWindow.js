import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        // citationsIncluded = []
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        this.state = {
            curFormat: formats.APA,
            copyBib: false,
            formats: formats,
            editSource: null
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

    setEditSource = (source) => {
        // Keeps track if Bibliography Generation Button clicked and Window should open
        this.setState({
            editSource: source
        });
    }

    render() {
        const formats = this.state.formats;
        const dropdownData = [{value:formats.APA,label:formats.APA},{value:formats.MLA,label:formats.MLA},{value:formats.CHI,label:formats.CHI}]
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
                    <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType} style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {this.props.sources.map((source,index) => 
                        <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                            {this.renderFormatType(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                            <Whisper placement="bottomStart" trigger="hover"  speaker={<Tooltip>This source is missing a field</Tooltip>}>
                                <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                            </Whisper>
                        </Checkbox>)}
                    </CheckboxGroup>
                </Modal.Body>
            <EditWindow close={() => this.setEditSource(null)} source={this.state.editSource}/>
            </Modal>
        );
    }
}

class EditCitationButton extends React.Component{
    render () {
        const buttonSize = "xs";
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Citation Fields</Tooltip>} placement="top">
                <IconButton icon={<Icon icon="edit2"/>} size={buttonSize} onClick={() => this.props.setEditSource(this.props.source)}/>
            </Whisper>
        );
    }
}

class EditWindow extends React.Component{

    showField = (field) => {
        if(field){
            return (field);
        } else {
            return ("Not Found");
        }
    }

    render() {
        if (this.props.source === null) return null;
        return (
            <Modal full show onHide={this.props.close}>
                <Modal.Header>
                    <Modal.Title>
                    Edit Citation Fields
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Input:</p><Input placeholder="Not Found" />
                    <p>Author: </p><Input placeholder={this.showField(this.props.source.author)}/>
                    <p>Title: </p><Input placeholder={this.showField(this.props.source.title)}/>
                    <p>Publish Date: </p><Input placeholder={this.showField(this.props.source.publishDate)}/>
                    <p>Site Name: </p><Input placeholder={this.showField(this.props.source.siteName)}/>
                    <p>Access Date: </p><Input placeholder={this.showField(this.props.source.accessDate)}/>
                    <p>URL: </p><Input placeholder={this.showField(this.props.source.url)}/>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;