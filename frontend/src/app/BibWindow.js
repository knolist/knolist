import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input, Divider
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        this.state = {
            // sources from API call (getSources)
            curFormat: formats.APA,
            formats: formats,
            editSource: null
        }
    }

    /*
    componentDidUpdate
        if (prevProps.curProject !== this.props.curProject &&) {
            // Set sources to null before updating to show loading icon
            this.setState({sources: null}, this.renderNetwork);
        }
    */

    removeFromSaved = (source) => {
        // citationsIncluded.remove(source);
        // Make API call to get, then post after changing
        // check getSources in Mindmap
        // source.isIncluded = false;
        // Rerender
    }

    addToSaved = (source) => {
        // citationsIncluded.add(source);
        // source.isIncluded = true;
        // Rerender
    }

    copyBib = () => {
        // take citationsIncluded and copy to clipboard
    }

    changeFormatType = (value) => {
        this.setState({
            curFormat: value
        });
    }

    showMissingIcon = (source) => {
        if(source.title && source.url && source.author 
            && source.publishDate && source.siteName 
            && source.accessDate) {
            return null;
        } else {
            return(
                <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This source is missing a field</Tooltip>}>
                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                </Whisper>
            );
        }
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

    renderIncluded = (included) => {
        {this.props.sources.map((source,index) => 
            {if (source.isIncluded === included) {
                return(
                    <CheckboxGroup name="checkboxList">
                        <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>
                    </CheckboxGroup>
                );
            } else {
                return(
                    <CheckboxGroup name="checkboxList">
                        <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}}  onChange={this.addToSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>
                    </CheckboxGroup>
                );
            }}
        )}
    }

    render() {
        const formats = this.state.formats;
        const dropdownData = [{value:formats.APA,label:formats.APA},{value:formats.MLA,label:formats.MLA},{value:formats.CHI,label:formats.CHI}]
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header style={{marginRight: "5%"}}>
                    <Modal.Title>
                    Bibliography  
                    <IconButton onClick={this.copyBib} icon={<Icon icon="copy"/>}/>
                    <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType} style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderIncluded(true)}
                    <Divider/>
                    {this.renderIncluded(false)}
                </Modal.Body>
                {/*<Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {this.props.sources.map((source,index) => 
                        <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>)}
                    </CheckboxGroup>
                    <Divider/>
                    <CheckboxGroup name="checkboxList">
                        {this.props.sources.map((source,index) => 
                        <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}} onChange={this.addToSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>)}
                    </CheckboxGroup>
                </Modal.Body>*/}
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

    changeAuthor = (value) => {
        this.props.source.author = value
    }

    changeTitle = (value) => {
        this.props.source.title = value
    }

    changePublishDate = (value) => {
        this.props.source.publishDate = value
    }

    changeSiteName = (value) => {
        this.props.source.siteName = value
    }

    changeAccessDate = (value) => {
        this.props.source.accessDate = value
    }

    changeURL = (value) => {
        this.props.source.url = value
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
                    <p>Author: </p><Input placeholder={this.showField(this.props.source.author)} onChange={this.changeAuthor} style={{ width: '300px' }}/>
                    <p>Title: </p><Input placeholder={this.showField(this.props.source.title)} onChange={this.changeTitle} style={{ width: '500px' }}/>
                    <p>Publish Date: </p><Input placeholder={this.showField(this.props.source.publishDate)} onChange={this.changePublishDate} style={{ width: '200px' }}/>
                    <p>Site Name: </p><Input placeholder={this.showField(this.props.source.siteName)} onChange={this.changeSiteName} style={{ width: '300px' }}/>
                    <p>Access Date: </p><Input placeholder={this.showField(this.props.source.accessDate)} onChange={this.changeAccessDate} style={{ width: '200px' }}/>
                    <p>URL: </p><Input placeholder={this.showField(this.props.source.url)} onChange={this.changeURL} style={{ width: '400px' }}/>
                </Modal.Body>
            </Modal>
        );
    }
}

export default BibWindow;