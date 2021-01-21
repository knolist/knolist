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
        //var included = new Array()
        this.state = {
            sources: null,
            curFormat: formats.APA,
            formats: formats,
            editSource: null,
            //included: included
        }
    }

    // Make API call to get all sources 
    getBibSources = async (callback) => {
        if (this.props.curProject === null) return null;
        // this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await makeHttpRequest(endpoint);
        //this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
        //this.updateIncluded();
    }

    // updateIncluded() {
    //     if (this.state.sources) {
    //         var i = this.state.included
    //         this.setState(
    //         {
    //             included: this.state.sources.map((source,index) => {if (source.is_included) {i.push(source)}})
    //         });
    //     }
    // }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showBib !== this.props.showBib && this.props.showBib) {
            this.getBibSources();
        }
    }

    componentDidMount() {
        this.getBibSources();
    }

    // Called when checkbox is unchecked
    // Removes citation from top section aka those copied onto clipboard
    removeFromSaved = async (source) => {
        const endpoint = "/sources/" + source.id;
        const body = {
            "is_included" : false
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.getBibSources();
    }

    // Called when checkbox is checked
    // Add citation top top section aka those copied onto clipboard
    addToSaved = async (source) => {
        const endpoint = "/sources/" + source.id;
        const body = {
            "is_included" : true
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.getBibSources();
    }

    // Copies citations in top section (those with is_included === true)
    // onto clipboard with formatting
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

    // Check if citation has all source fields present
    // Displays a Missing! icon if not
    showMissingIcon = (source) => {
        if(source.title && source.url && source.author 
            && source.publishDate && source.siteName 
            && source.accessDate) {
            return null;
        } else {
            const citationFields = ['title ', 'URL ', 'author ', 'publish date ', 'site name ', 'access date ']
            var missing = ""
            if (!source.title) {
                missing = missing.concat(citationFields[0])
            }
            if (!source.url) {
                missing = missing.concat(citationFields[1])
            }
            if (!source.author) {
                missing = missing.concat(citationFields[2])
            }
            if (!source.publishDate) {
                missing = missing.concat(citationFields[3])
            }
            if (!source.siteName) {
                missing = missing.concat(citationFields[4])
            }
            if (!source.accessDate) {
                missing = missing.concat(citationFields[5])
            }
            return(
                <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This citation is missing the <i>{missing}</i>field(s)</Tooltip>}>
                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                </Whisper>
            );
        }
    }

    // Renders citation in APA, MLA, or Chicago format
    renderFormatType = (source) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        var formattedDate = "";
        var title = "";
        var author = "";
        var publishDateJS = new Date(source.published_date);
        var accessDateJS = new Date(source.access_date);
        if (this.state.curFormat === this.state.formats.APA){
            // if publishDate None, use accessDate
            if (source.published_date) {
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
            return <p className={this.isIncludedClassName(source.is_included)}>{author} {formattedDate} <i>{title}</i> {source.siteName}. <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p> 
        } else if (this.state.curFormat === this.state.formats.CHI){
            // if publishDate None, use accessDate
            if (source.published_date) {
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
            return <p className={this.isIncludedClassName(source.is_included)}>{source.is_included} {author} {title} <i>{source.siteName}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a></p>
        } else if (this.state.curFormat === this.state.formats.MLA) {
            if (source.published_date) {
                formattedDate = formattedDate.concat(publishDateJS.getDate());
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            var formattedDate2 = "";
            if (source.access_date) {
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
            return <p className={this.isIncludedClassName(source.is_included)}>{source.is_included} {author} {title} <i>{source.siteName}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}.</a> {formattedDate2} </p>
        }
    }

    // Sets className to copyText if citation is included to copy to clipboard
    // Else sets className to undefined
    isIncludedClassName = (included) => {
        if (included) {
            return ('copyText');
        } else {
            return (undefined);
        }
    }

    // Keeps track if Bibliography Generation Button clicked and Window should open
    setEditSource = (source) => {
        this.setState({
            editSource: source
        });
    }

    // Renders top and botton section of citations (those included in clipboard copy) 
    // depending on whether included parameter boolean is true or false
    // renderIncluded = (included,source) => {
    //     // eslint-disable-next-line
    //     <CheckboxGroup name="checkboxList">
    //         {if (source.is_included === included) {
    //             return(
    //                 <CheckboxGroup name="checkboxList">
    //                     <Checkbox defaultChecked onChange={() => this.removeFromSaved(source)} key={index}>
    //                         {this.renderFormatType(source)}
    //                         {this.showMissingIcon(source)}
    //                         <EditCitationButton hide={false} source={source} setEditSource={this.state.editSource}/>
    //                     </Checkbox>
    //                 </CheckboxGroup>
    //             );
    //         } else {
    //             return(
    //                 <CheckboxGroup name="checkboxList">
    //                     <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}}  onChange={() => this.addToSaved(source)} key={index}>
    //                         {this.renderFormatType(source)}
    //                         {this.showMissingIcon(source)}
    //                         <EditCitationButton hide={false} source={source} setEditSource={this.state.editSource}/>
    //                     </Checkbox>
    //                 </CheckboxGroup>
    //             );
    //         }}
    //     </CheckboxGroup>
    // }

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
                {/*<Modal.Body>
                    {this.state.sources.map((source,index) => 
                    {this.renderIncluded(true,source)}
                    <Divider/>
                    {this.renderIncluded(false,source)}
                    )}
                </Modal.Body>
                */}
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {this.state.sources.map((source,index) => 
                                <Checkbox defaultChecked onChange={() => this.removeFromSaved(source)} key={index}>
                                    {this.renderFormatType(source)}
                                    {this.showMissingIcon(source)}
                                    <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/>
                                </Checkbox>
                        )}
                        <Divider/>
                        {this.state.sources.map((source,index) => 
                                <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}} onChange={() => this.addToSaved(source)} key={index}>
                                    {this.renderFormatType(source)}
                                    {this.showMissingIcon(source)}
                                    <EditCitationButton hide={false} source={source} setEditSource={this.state.editSource}/>
                                </Checkbox>
                        )}
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
    // Show DefaultValue or Placeholder in Edit Input
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

    // Make API call to update citation fields
    changeAuthor = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "author" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    changeTitle = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "title" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    changePublishDate = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "published_date" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    changeSiteName = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "site_name" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    changeAccessDate = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "access_date" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
    }

    changeURL = async (value) => {
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "url" : value
        }
        await makeHttpRequest(endpoint, "PATCH", body);
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
                    <p>Title: </p><Input defaultValue={this.showField(this.props.source.title)} placeholder={this.showField(this.props.source.title, true)} onChange={this.changeTitle} style={{ width: '500px' }}/>
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