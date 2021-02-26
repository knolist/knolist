import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, Form, FormGroup, FormControl, ControlLabel,
    CheckboxGroup, Tooltip, Whisper, Divider, Alert, Button, DatePicker, Placeholder, FlexboxGrid
} from "rsuite";

import makeHttpRequest from "../services/HttpRequest";
import FlexboxGridItem from "rsuite/es/FlexboxGrid/FlexboxGridItem";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        const formats = {
            APA: "APA Reference List",
            MLA: "MLA Works Cited",
            CHI: "Chicago Bibliography Style"
        }
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        this.state = {
            sources: null,
            curFormat: formats.APA,
            formats: formats,
            months: months,
            editSource: null,
            loading: false
        }
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    // Make API call to get all sources
    getBibSources = (callback) => {
        if (this.props.curProject === null || !this.props.showBib) return null;
        this.setLoading(true);
        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        makeHttpRequest(endpoint).then((response) => {
            this.setState({sources: response.body.sources}, () => {
                this.setLoading(false);
                if (typeof callback === "function") callback();
            })
        });
    }

    // Copies citations in top section (those with is_included === true)
    // onto clipboard with formatting
    copyBib = () => {
        const citationArray = document.getElementsByClassName('copyText');
        let selectText = "";
        for (let i = 0; i < citationArray.length; i++) {
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

        if (source.title && source.url && source.author
            && source.published_date && source.site_name
            && source.access_date) {
            return null;
        } else {
            const citationFields = ['title, ', 'URL, ', 'author, ', 'publish date, ', 'site name, ', 'access date, ']
            let missing = ""
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
            // Remove last comma
            missing = missing.substring(0, missing.length - 2)
            return (
                <Whisper placement="top" trigger="hover"
                         speaker={<Tooltip>This citation is missing the <i>{missing} </i>field(s)</Tooltip>}>
                    <Icon icon="exclamation-circle" style={{color: '#f5a623'}}/>
                </Whisper>
            );
        }
    }

    // Called when checkbox changed
    // Changes citation is_included field to true or false
    // depending on checked or not
    changeInclusion = (event, checked, source) => {
        event.stopPropagation();
        const endpoint = "/sources/" + source.id;
        const body = {
            "is_included": checked
        }
        makeHttpRequest(endpoint, "PATCH", body);
        let sources = this.state.sources;
        const index = sources.findIndex(x => x.id === source.id);
        sources[index].is_included = checked;
        this.setState({sources: sources});
    }

    renderAPADate = (date) => {
        const months = this.state.months;
        let formattedDate = "(";
        formattedDate = formattedDate + date.getFullYear() + ", ";
        formattedDate = formattedDate + months[date.getMonth()] + " ";
        formattedDate = formattedDate + (date.getDate() + 1) + "). ";
        return formattedDate;
    }

    renderChicagoDate = (date) => {
        const months = this.state.months;
        let formattedDate = months[date.getMonth()] + " ";
        formattedDate = formattedDate + (date.getDate() + 1) + ", ";
        formattedDate = formattedDate + date.getFullYear() + ".";
        return formattedDate;
    }

    renderMLADate = (date) => {
        const months = this.state.months;
        let formattedDate = (date.getDate() + 1) + " ";
        formattedDate = formattedDate + months[date.getMonth()] + " ";
        formattedDate = formattedDate + date.getFullYear() + ".";
        return formattedDate;
    }

    renderAPACitation = (source) => {
        let formattedDate = "";
        let title = "";
        let author = "";
        let publishDateJS = new Date(source.published_date);
        let accessDateJS = new Date(source.access_date);
        // if published_date is None, use access_date
        if (source.published_date) {
            formattedDate = this.renderAPADate(publishDateJS);
        } else if (source.access_date) {
            formattedDate = this.renderAPADate(accessDateJS);
        }
        if (source.title) {
            title = title + source.title + ".";
        }
        if (source.author) {
            author = author + source.author + ".";
        }
        return (
            <p className={this.isIncludedClassName(source.is_included)}>{author} {formattedDate}
                <i>{title}</i> {source.site_name}. <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.url}.</a>
            </p>
        );
    }

    renderChicagoCitation = (source) => {
        let formattedDate = "";
        let title = "";
        let author = "";
        let publishDateJS = new Date(source.published_date);
        let accessDateJS = new Date(source.access_date);
        // if publishDate None, use accessDate
        if (source.published_date) {
            formattedDate = this.renderChicagoDate(publishDateJS);
        } else if (source.access_date) {
            formattedDate = this.renderChicagoDate(accessDateJS);
        }
        if (source.title) {
            title = title + "\"" + source.title + ".\"";
        }
        if (source.author) {
            author = author + source.author + ".";
        }
        return (
            <p className={this.isIncludedClassName(source.is_included)}>{author} {title}
                <i>{source.site_name}</i>, {formattedDate} <a href={source.url} target="_blank"
                                                              rel="noopener noreferrer">
                    {source.url}.</a>
            </p>
        );
    }

    renderMLACitation = (source) => {
        let formattedPublishDate = "";
        let formattedAccessDate = "";
        let title = "";
        let author = "";
        let publishDateJS = new Date(source.published_date);
        let accessDateJS = new Date(source.access_date);
        if (source.published_date) {
            formattedPublishDate = this.renderMLADate(publishDateJS);
        }
        if (source.access_date) {
            formattedAccessDate = "Accessed " + this.renderMLADate(accessDateJS);
        }
        if (source.title) {
            title = title + "\"" + source.title + ".\"";
        }
        if (source.author) {
            author = author + source.author + ".";
        }
        return (
            <p className={this.isIncludedClassName(source.is_included)}>{author} {title}
                <i>{source.site_name}</i>, {formattedPublishDate} <a href={source.url} target="_blank"
                                                                     rel="noopener noreferrer"> {source.url}.
                </a> {formattedAccessDate}
            </p>
        );
    }

    // Renders citation in APA, MLA, or Chicago format
    // source.access_date and source.published_date are in string form
    // Use JSON Date() object to parse
    renderFormatType = (source) => {
        let citation = null;
        if (this.state.curFormat === this.state.formats.APA) {
            citation = this.renderAPACitation(source);
        } else if (this.state.curFormat === this.state.formats.CHI) {
            citation = this.renderChicagoCitation(source);
        } else if (this.state.curFormat === this.state.formats.MLA) {
            citation = this.renderMLACitation(source);
        }

        return citation;
    }

    // Sets className to copyText if citation is included to copy to clipboard
    // Else sets className to undefined
    isIncludedClassName = (included) => {
        if (included) {
            return 'copyText';
        } else {
            return undefined;
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

    renderCitations = (included) => {
        return this.state.sources.map((source, index) => {
            if (source.is_included === included) {
                return (
                    <Checkbox defaultChecked={included} style={included ? null : {color: "#d3d3d3"}}
                              onChange={(_, checked, event) => this.changeInclusion(event, checked, source)}
                              key={index}>
                        <FlexboxGrid align="middle" justify="space-between">
                            <FlexboxGridItem>
                                {this.renderFormatType(source)}
                            </FlexboxGridItem>
                            <FlexboxGridItem>
                                <EditCitationButton source={source} setEditSource={this.setEditSource}/>
                                {this.showMissingIcon(source)}
                            </FlexboxGridItem>
                        </FlexboxGrid>
                    </Checkbox>
                );
            }
            return null;
        })
    }

    renderBibBody = () => {
        if (this.state.loading) return <Placeholder.Paragraph rows={4} active/>

        return (
            <CheckboxGroup name="checkboxList">
                {this.renderCitations(true)}
                <Divider/>
                {this.renderCitations(false)}
            </CheckboxGroup>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showBib !== this.props.showBib && this.props.showBib) {
            this.getBibSources();
        }
    }

    componentDidMount() {
        this.getBibSources();
    }

    render() {
        const formats = this.state.formats;
        const dropdownData = [{
            value: formats.APA,
            label: formats.APA
        }, {
            value: formats.MLA,
            label: formats.MLA
        }, {
            value: formats.CHI,
            label: formats.CHI
        }]
        if (this.state.sources === null && !this.state.loading) return null;

        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header style={{marginRight: "5%"}}>
                    <Modal.Title>
                        <span style={{marginRight: 5}}>Bibliography</span>
                        <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Copy to Clipboard</Tooltip>}
                                 placement="top">
                            <IconButton onClick={this.copyBib} icon={<Icon icon="copy"/>} size="sm"/>
                        </Whisper>
                        <SelectPicker defaultValue={this.state.curFormat ? this.state.curFormat : formats.APA}
                                      data={dropdownData} onChange={this.changeFormatType}
                                      style={{float: 'right'}} cleanable={false} searchable={false}/>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderBibBody()}
                </Modal.Body>
                <EditWindow close={() => this.setEditSource(null)} source={this.state.editSource}
                            getBibSources={this.getBibSources}/>
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

class EditWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            formValue: {
                author: this.showField(props.source, "author"),
                title: this.showField(props.source, "title"),
                publishDate: this.showField(props.source, "published_date", true),
                siteName: this.showField(props.source, "site_name"),
                accessDate: this.showField(props.source, "access_date", true),
                url: this.showField(props.source, "url")
            }
        }
    }

    setFormValue = (value) => {
        this.setState({formValue: value});
    }

    // Show loading when saving citation info
    setLoading = (value) => {
        this.setState({loading: value});
    }

    showField = (source, field, isDatePicker = false) => {
        const emptyResponse = isDatePicker ? null : "";
        if (!source) return emptyResponse;
        const val = source[field]
        if (val) {
            return isDatePicker ? new Date(val) : val;
        } else {
            return emptyResponse;
        }
    }

    // Makes API call to update citation info
    saveInfo = async () => {
        this.setLoading(true);
        const endpoint = "/sources/" + this.props.source.id;
        const body = {
            "author": this.state.formValue.author,
            "title": this.state.formValue.title,
            "published_date": this.state.formValue.publishDate,
            "site_name": this.state.formValue.siteName,
            "access_date": this.state.formValue.accessDate,
            "url": this.state.formValue.url
        }
        await makeHttpRequest(endpoint, "PATCH", body);
        this.props.getBibSources(() => {
            this.props.close();
            this.setLoading(false);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.source !== this.props.source) {
            this.setFormValue({
                author: this.showField(this.props.source, "author"),
                title: this.showField(this.props.source, "title"),
                publishDate: this.showField(this.props.source, "published_date", true),
                siteName: this.showField(this.props.source, "site_name"),
                accessDate: this.showField(this.props.source, "access_date", true),
                url: this.showField(this.props.source, "url")
            })
        }
    }

    render() {
        const source = this.props.source;
        if (source === null) return null;
        const dateFormat = "MM-DD-YYYY";
        return (
            <Modal size="sm" show onHide={this.props.close}>
                <Modal.Header>
                    <Modal.Title>
                        Edit Citation Fields
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form layout="horizontal"
                          onChange={this.setFormValue}
                          formValue={this.state.formValue}>
                        <FormGroup>
                            <ControlLabel>Author</ControlLabel>
                            <FormControl name="author"/>
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Title</ControlLabel>
                            <FormControl name="title"/>
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Publish Date</ControlLabel>
                            <FormControl
                                name="publishDate"
                                accepter={DatePicker}
                                format={dateFormat}
                                oneTap
                            />
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Site Name</ControlLabel>
                            <FormControl name="siteName"/>
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>Access Date</ControlLabel>
                            <FormControl
                                name="accessDate"
                                accepter={DatePicker}
                                format={dateFormat}
                                oneTap
                            />
                        </FormGroup>

                        <FormGroup>
                            <ControlLabel>URL</ControlLabel>
                            <FormControl name="url"/>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.saveInfo} loading={this.state.loading}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default BibWindow;