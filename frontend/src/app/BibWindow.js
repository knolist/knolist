import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input, Divider, Alert, Button
} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        this.state = {
            sources: null,
            curFormat: formats.APA,
            formats: formats,
            editSource: null
        }
    }

    getBibSources = async (callback) => {
        if (this.props.curProject === null) return null;
        // this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await makeHttpRequest(endpoint);
        //this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showBib !== this.props.showBib && this.props.showBib) {
            this.getBibSources();
        }
    }

    componentDidMount() {
        this.getBibSources();
    }

    removeFromSaved = (source) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "isIncluded" : false
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
    }

    addToSaved = (source) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "isIncluded" : true
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
    }

    copyBib() {
        const citationArray = document.getElementsByClassName('copyText')
        var selectText = "";
        for (var i=0; i < citationArray.length; i++) {
            selectText = selectText.concat(citationArray[i].innerHTML);
            selectText = selectText.concat('<br><br>');
        }
        function listener(e) {
            e.clipboardData.setData("text/html", selectText);
            e.clipboardData.setData("text/plain", selectText);
            e.preventDefault();
        }
        document.addEventListener("copy", listener);
        document.execCommand("copy");
        document.removeEventListener("copy", listener);
        Alert.info('Copied Citations to Clipboard');
    };

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
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        var formattedDate = "";
        var title = "";
        var author = "";
        var publishDateJS = new Date(source.publishDate);
        var accessDateJS = new Date(source.accessDate);
        if (this.state.curFormat === this.state.formats.APA){
            // if publishDate None, use accessDate
            if (source.publishDate) {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(").");
            } else {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(accessDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate());
                formattedDate = formattedDate.concat(").");
            }
            if (source.title) {
                title = title.concat(source.title);
                title = title.concat(".");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            // TODO: uncomment when IsIncluded is added
            // return <p className={isIncludedClassName(source.isIncluded)}>{author} {formattedDate} <i>{title}</i> source.siteName. <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p> 
            return <p className={'copyText'}>{author} {formattedDate} <i>{title}</i> source.siteName. <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p> 
        } else if (this.state.curFormat === this.state.formats.CHI){
            // if publishDate None, use accessDate
            if (source.publishDate) {
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            } else {
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(accessDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            if (source.title) {
                title = title.concat("\"");
                title = title.concat(source.title);
                title = title.concat(".\"");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            // TODO: uncomment when IsIncluded is added
            // return <p className={isIncludedClassName(source.isIncluded)}>{author} {title} <i>source.siteName</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p>
            return <p className={'copyText'}>{author} {title} <i>source.siteName</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p>
        } else if (this.state.curFormat === this.state.formats.MLA) {
            if (source.publishDate) {
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            var formattedDate2 = "";
            if (source.accessDate) {
                formattedDate2 = formattedDate2.concat("Accessed ");
                formattedDate2 = formattedDate2.concat(accessDateJS.getDate());
                formattedDate2 = formattedDate2.concat(" ");
                formattedDate2 = formattedDate2.concat(months[accessDateJS.getMonth()]);
                formattedDate2 = formattedDate2.concat(" ");
                formattedDate2 = formattedDate2.concat(accessDateJS.getFullYear());
                formattedDate2 = formattedDate2.concat(".");
            }
            if (source.title) {
                title = title.concat("\"");
                title = title.concat(source.title);
                title = title.concat(".\"");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            // TODO: uncomment when IsIncluded is added
            // return <p className={isIncludedClassName(source.isIncluded)}>{author} {title} <i>source.siteName</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a> {formattedDate2} </p>
            return <p className={'copyText'}>{author} {title} <i>source.siteName</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a> {formattedDate2} </p>
        }
    }

    // Sets className to copyText if citation is included to copy to clipboard
    // Else sets className to undefined
    // Uncomment when isIncluded is added to backend
    isIncludedClassName = (included) => {
        if (included) {
            return ('copyText');
        } else {
            return (undefined);
        }
    }

    setEditSource = (source) => {
        // Keeps track if Bibliography Generation Button clicked and Window should open
        this.setState({
            editSource: source
        });
    }

    renderIncluded = (included) => {
        // eslint-disable-next-line
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
        if (this.state.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header style={{marginRight: "5%"}}>
                    <Modal.Title>
                    Bibliography 
                    <IconButton onClick={this.copyBib} icon={<Icon icon="copy"/>}/>
                    <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType} style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                {/* Uncomment when isIncluded Backend is finished
                <Modal.Body>
                    {this.renderIncluded(true)}
                    <Divider/>
                    {this.renderIncluded(false)}
                </Modal.Body>*/}
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {this.state.sources.map((source,index) => 
                        <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
                            <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                        </Checkbox>)}
                    </CheckboxGroup>
                    <Divider/>
                    <CheckboxGroup name="checkboxList">
                        {this.state.sources.map((source,index) => 
                        <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}} onChange={this.addToSaved} key={index}>
                            {this.renderFormatType(source)}
                            {this.showMissingIcon(source)}
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

    showField = (field, placeholder) => {
        if (placeholder) {        
            if(field){
                return (undefined);
            } else {
                return (field);
            }
        } else {
            if(field){
                return (field);
            } else {
                return (undefined);
            }
        }

    }

    changeAuthor = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "author" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
        this.props.source.author = value
    }

    changeTitle = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "title" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
        this.props.source.title = value
    }

    changePublishDate = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "publishDate" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
        this.props.source.publishDate = value
    }

    changeSiteName = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "siteName" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
        this.props.source.siteName = value
    }

    changeAccessDate = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "accessDate" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
        this.props.source.accessDate = value
    }

    changeURL = (value) => {
        // const endpoint = "/sources/" + source.id;
        // const body = {
        //     "url" : value
        // }
        // await makeHttpRequest(endpoint, "PATCH", body);
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
                    <p>Author: </p><Input defaultValue={this.showField(this.props.source.author, false)} placeholder={this.showField(this.props.source.author, true)} onChange={this.changeAuthor} style={{ width: '300px' }}/>
                    <p>Title: </p><Input defaultValue={this.showField(this.props.source.title)} placeholder={this.showField(this.props.source.title, true)}onChange={this.changeTitle} style={{ width: '500px' }}/>
                    <p>Publish Date: </p><Input defaultValue={this.showField(this.props.source.publishDate)} placeholder={this.showField(this.props.source.publishDate, true)} onChange={this.changePublishDate} style={{ width: '200px' }}/>
                    <p>Site Name: </p><Input defaultValue={this.showField(this.props.source.siteName)} placeholder={this.showField(this.props.source.siteName, true)} onChange={this.changeSiteName} style={{ width: '300px' }}/>
                    <p>Access Date: </p><Input defaultValue={this.showField(this.props.source.accessDate)} placeholder={this.showField(this.props.source.accessDate, true)} onChange={this.changeAccessDate} style={{ width: '200px' }}/>
                    <p>URL: </p><Input defaultValue={this.showField(this.props.source.url)} placeholder={this.showField(this.props.source.url, true)} onChange={this.changeURL} style={{ width: '400px' }}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.close}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default BibWindow;