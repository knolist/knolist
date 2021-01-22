import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, 
    CheckboxGroup, Tooltip, Whisper, Input, Divider, Alert, Button, DatePicker
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

    // Make API call to get all sources 
    getBibSources = (callback) => {
        if (this.props.curProject === null || !this.props.showBib) return null;
        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        makeHttpRequest(endpoint).then((response) => this.setState({sources: response.body.sources}, callback));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showBib !== this.props.showBib && this.props.showBib) {
            this.getBibSources();
        }
    }

    componentDidMount() {
        this.getBibSources();
    }

    // Copies citations in top section (those with is_included === true)
    // onto clipboard with formatting
    copyBib() {
        const citationArray = document.getElementsByClassName('copyText');
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

    // Check if citation has all source fields present
    // Displays a Missing! icon if not
    showMissingIcon = (source) => {
        if(source.title && source.url && source.author 
            && source.published_date && source.site_name 
            && source.access_date) {
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
            if (!source.published_date) {
                missing = missing.concat(citationFields[3])
            }
            if (!source.site_name) {
                missing = missing.concat(citationFields[4])
            }
            if (!source.access_date) {
                missing = missing.concat(citationFields[5])
            }
            return(
                <Whisper placement="bottomStart" trigger="hover" speaker={<Tooltip>This citation is missing the <i>{missing}</i>field(s)</Tooltip>}>
                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                </Whisper>
            );
        }
    }

    // Called when checkbox changed
    // Changes citation is_included field to true or false
    // depending on checked or not
    changeInclusion = (event,checked,source) => {
        event.stopPropagation();
        const endpoint = "/sources/" + source.id;
        const body = {
            "is_included" : checked
        }
        makeHttpRequest(endpoint, "PATCH", body);
        let sources = this.state.sources;
        const index = sources.findIndex(x => x.id === source.id);
        sources[index].is_included = checked;
        this.setState({sources:sources});
    }

    // Renders citation in APA, MLA, or Chicago format
    // source.access_date and source.published_date are in string form
    // Use JSON Date() object to parse
    renderFormatType = (source) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        var formattedDate = "";
        var title = "";
        var author = "";
        var publishDateJS = new Date(source.published_date);
        var accessDateJS = new Date(source.access_date);
        if (this.state.curFormat === this.state.formats.APA){
            // if published_date is None, use access_date
            if (source.published_date) {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate()+1);
                formattedDate = formattedDate.concat("). ");
            } else if (source.access_date) {
                formattedDate = formattedDate.concat("(");
                formattedDate = formattedDate.concat(accessDateJS.getFullYear());
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate()+1);
                formattedDate = formattedDate.concat("). ");
            }
            if (source.title) {
                title = title.concat(source.title);
                title = title.concat(".");
            }
            if (source.author) {
                author = author.concat(source.author);
                author = author.concat(".");
            }
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {formattedDate} 
                <i>{title}</i> {source.site_name}. <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a><EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
        } else if (this.state.curFormat === this.state.formats.CHI){
            // if publishDate None, use accessDate
            if (source.published_date) {
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getDate()+1);
                formattedDate = formattedDate.concat(", ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            } else if (source.access_date) {
                formattedDate = formattedDate.concat(months[accessDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(accessDateJS.getDate()+1);
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
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {title} 
                <i>{source.site_name}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a><EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
        } else if (this.state.curFormat === this.state.formats.MLA) {
            if (source.published_date) {
                formattedDate = formattedDate.concat(publishDateJS.getDate()+1);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(months[publishDateJS.getMonth()]);
                formattedDate = formattedDate.concat(" ");
                formattedDate = formattedDate.concat(publishDateJS.getFullYear());
                formattedDate = formattedDate.concat(".");
            }
            var formattedDate2 = "";
            if (source.access_date) {
                formattedDate2 = formattedDate2.concat("Accessed ");
                formattedDate2 = formattedDate2.concat(accessDateJS.getDate()+1);
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
            return (
                <p className={this.isIncludedClassName(source.is_included)}>{author} {title} 
                <i>{source.site_name}</i>, {formattedDate} <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}.</a> {formattedDate2} <EditCitationButton hide={false} source={source} setEditSource={this.setEditSource}/></p>
            );
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

    // Change the citation format when format selection is changed
    changeFormatType = (value) => {
        this.setState({
            curFormat: value
        });
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
                        <SelectPicker defaultValue={formats.APA} data={dropdownData} onChange={this.changeFormatType}
                                      style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        {
                            // eslint-disable-next-line
                            this.state.sources.map((source,index) => 
                            {if (source.is_included === true) { 
                                return(
                                    <Checkbox defaultChecked onChange={(_,c,e) => this.changeInclusion(e,c,source)} key={index}>
                                        {this.renderFormatType(source)}
                                        {this.showMissingIcon(source)}
                                    </Checkbox>
                                );
                            }}
                        )}
                        <Divider/>
                        {
                            // eslint-disable-next-line
                            this.state.sources.map((source,index) => 
                            {if (source.is_included === false) { 
                                return(
                                    <Checkbox defaultChecked={false} style={{color: '#d3d3d3'}} onChange={(_,c,e) => this.changeInclusion(e,c,source)} key={index}>
                                        {this.renderFormatType(source)}
                                        {this.showMissingIcon(source)}
                                    </Checkbox>
                                );
                            }}
                        )}
                    </CheckboxGroup>
                </Modal.Body>
            <EditWindow close={() => this.setEditSource(null)} source={this.state.editSource} getBibSources={this.getBibSources}/>
            </Modal>
        );
    }
}

class EditCitationButton extends React.Component {
    render() {
        const buttonSize = "xs";
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Citation Fields</Tooltip>} placement="top">
                <IconButton icon={<Icon icon="edit2"/>} size={buttonSize}
                            onClick={() => this.props.setEditSource(this.props.source)}/>
            </Whisper>
        );
    }
}

class EditWindow extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            author: null,
            title: null,
            publishDate: null,
            siteName: null,
            accessDate: null,
            url: null
        }
    }

    // Show loading when saving citation info
    setLoading = (value) => {
        this.setState({loading:value});
    }

    // Show DefaultValue in Edit Input in "MM-DD-YYYY"
    showTimeField = (field) => {
        if (field) {
            var dateJS = new Date(field);
            var formattedDate = "";
            formattedDate = formattedDate.concat(dateJS.getMonth()+1);
            formattedDate = formattedDate.concat("-");
            formattedDate = formattedDate.concat(dateJS.getDate()+1);
            formattedDate = formattedDate.concat("-");    
            formattedDate = formattedDate.concat(dateJS.getFullYear());
            return (formattedDate);
        } else {
            return (undefined);
        }
    }

    // Show DefaultValue in Time Picker
    showField = (field) => {
        if (field) {
            return (field);
        } else {
            return (undefined);
        }
    }

    // Make API call to update citation fields
    changeAuthor = (value) => {
        this.setState({
            author: value
        });
    }

    changeTitle = (value) => {
        this.setState({
            title: value
        });
    }

    changePublishDate = (value) => {
        console.log(Object.getOwnPropertyNames(value));
        //value = value[0,10];
        this.setState({
            publishDate: value
        });
    }

    changeSiteName = (value) => {
        this.setState({
            siteName: value
        });
    }

    changeAccessDate = (value) => {
        this.setState({
            accessDate: value
        });
    }

    changeURL = (value) => {
        this.setState({
            url: value
        });
    }

    // Makes API call to update citation info
    saveInfo = async () => {
        this.setLoading(true);
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "author" : this.state.author,
            "title" : this.state.title,
            "published_date" : this.state.publishDate,
            "site_name" : this.state.siteName,
            "access_date" : this.state.accessDate,
            "url" : this.state.url
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources(() => {
            this.props.close();
            this.setLoading(false);
        });
    }

    render() {
        if (this.props.source === null) return null;
        return (
            <Modal full show onHide={this.props.close}>
                <Modal.Header>
                    <Modal.Title>Edit Citation Fields</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Author: <Input defaultValue={this.showField(this.props.source.author)} onChange={this.changeAuthor} style={{ width: '300px' }}/></p>
                    <p>Title: <Input defaultValue={this.showField(this.props.source.title)} onChange={this.changeTitle} style={{ width: '500px' }}/></p>
                    <p>Publish Date: <DatePicker format="MM-DD-YYYY" placeholder={this.showTimeField(this.props.source.published_date)} onChange={this.changePublishDate} oneTap/></p>
                    <p>Site Name: <Input defaultValue={this.showField(this.props.source.site_name)} onChange={this.changeSiteName} style={{ width: '300px' }}/></p>
                    <p>Access Date: <DatePicker format="MM-DD-YYYY" placeholder={this.showTimeField(this.props.source.access_date)} onChange={this.changeAccessDate} oneTap/></p>
                    <p>URL: <Input defaultValue={this.showField(this.props.source.url)} onChange={this.changeURL} style={{ width: '400px' }}/></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.saveInfo} loading={this.state.loading}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default BibWindow;