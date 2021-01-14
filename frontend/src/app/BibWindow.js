import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input, Divider
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        const citationsIncluded = this.props.sources
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        this.state = {
            curFormat: formats.APA,
            formats: formats,
            editSource: null
        }
    }

    removeFromSaved = (source) => {
        //this.citationsIncluded = this.citationsIncluded.remove(source)
        this.setState({
            
        });
    }

    addToSaved = (source) => {
        //this.citationsIncluded = this.citationsIncluded.add(source)
        this.setState({
            
        });
    }

    copyBib = () => {
        // take citationsIncluded and copy to clipboard
    }

    changeFormatType = (value) => {
        this.setState({
            curFormat: value
        });
    }

    // if sources have fields as None, return True
    // {if(isMissingFields(this.props.sources)) {<Icon icon="exclamation-circle" color="#f5a623"/>}}
    isMissingFields = (sources) => {
        
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
                    <IconButton onClick={this.copyBib} icon={<Icon icon="copy"/>}/>
                    <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType} style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {/*TODO: eventually this for loop will call from citationsIncluded*/}
                        {this.props.sources.map((source,index) => 
                        <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                            {this.renderFormatType(source)}
                            <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This source is missing a field</Tooltip>}>
                                <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                            </Whisper>
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>)}
                    </CheckboxGroup>
                    <Divider/>
                    <CheckboxGroup name="checkboxList">
                        {this.props.sources.map((source,index) => 
                        <Checkbox defaultChecked={false} onChange={this.addToSaved} key={index}>
                            {this.renderFormatType(source)}
                            <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This source is missing a field</Tooltip>}>
                                <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                            </Whisper>
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
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
                    <p>Author: </p><Input placeholder={this.showField(this.props.source.author)} style={{ width: '300px' }}/>
                    <p>Title: </p><Input placeholder={this.showField(this.props.source.title)} style={{ width: '500px' }}/>
                    <p>Publish Date: </p><Input placeholder={this.showField(this.props.source.publishDate)} style={{ width: '200px' }}/>
                    <p>Site Name: </p><Input placeholder={this.showField(this.props.source.siteName)} style={{ width: '300px' }}/>
                    <p>Access Date: </p><Input placeholder={this.showField(this.props.source.accessDate)} style={{ width: '200px' }}/>
                    <p>URL: </p><Input placeholder={this.showField(this.props.source.url)} style={{ width: '400px' }}/>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;