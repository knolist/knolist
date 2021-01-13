import React from "react";
import {
    Modal, SelectPicker, IconButton, Icon, Checkbox, CheckboxGroup, Tooltip, Whisper
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        // citationsToExport = []
        const formats = {
            APA: "APA",
            MLA: "MLA",
            CHI: "Chicago"
        }
        this.state = {
            formatType: formats.APA,
            copyBib: false,
            formats: formats
        }
    }

    removeFromSaved = (value) => {
        this.setState({
            // citationsToExport removes that citation
            // citation is moved down and greyed out
        });
    }

    changeFormatType = (type) => {
        this.setState({
    //         formatType: type 
        });
    }

    // if sources have fields as None, return True
    // {if(isMissingFields(this.props.sources)) {<Icon icon="exclamation-circle" color="#f5a623"/>}}
    isMissingFields = (sources) => {
        this.setState({

        });
    }

    renderFormatType = (source) => {
        if (this.state.formatType === this.state.formats.APA){
            return <p>source.author. (source.publishDate). "{source.title}." <i>source.siteName</i>, {source.url}.</p> 
        }
    }

    render() {
        const formats = this.state.formats
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header>
                    <Modal.Title>
                    Bibliography
                    </Modal.Title>
                    <SelectPicker data={formats}/>
                    {/* TODO: Set copyBib state to "export"
                    <IconButton onClick={() => this.state.copyBib(true)} icon={<Icon icon="copy"/>}/>
                    */}
                    <IconButton icon={<Icon icon="copy"/>}/>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxGroup name="checkboxList">
                        <p>Included</p>
                        {this.props.sources.map((source,index) => 
                            <Checkbox defaultChecked onChange={this.removeFromSaved} key={index}>
                                {this.renderFormatType({source})}
                                <Whisper placement="bottomStart" trigger="hover"  speaker={<Tooltip>This source is missing a field</Tooltip>}>
                                    <Icon icon="exclamation-circle" style={{ color: '#f5a623' }}/>
                                </Whisper>
                            </Checkbox>)}
                        <p>Not Included</p>
                    </CheckboxGroup>
                </Modal.Body>
            </Modal>
        );

        // return (
        //     <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
        //         <Modal.Header>
        //             <Modal.Title>
        //             Bibliography
        //             </Modal.Title>
        //             <Dropdown title={this.state.formatType} activeKey={this.state.formatType}>
        //                 <Dropdown.Item eventKey="APA">APA</Dropdown.Item>
        //                 <Dropdown.Item eventKey="MLA">MLA</Dropdown.Item>
        //                 <Dropdown.Item eventKey="CHI">Chicago</Dropdown.Item>
        //             </Dropdown>
        //             <IconButton onClick={() => this.state.copyBib(true)} icon={<Icon icon="copy"/>}/>
        //         </Modal.Header>
        //         <Modal.Body>
        //             <ul>
        //                 {if (this.state.formatType === "MLA")
        //                     {this.props.sources.map((source,index) => <li key={index}>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate, {source.url}. Accessed source.accessDate. </li>)}
        //                 else if (this.state.formatType === "CHI")
        //                     {this.props.sources.map((source,index) => <li key={index}>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate. source.accessDate. {source.url}. </li>)}
        //                 else if (this.state.formatType === "APA")
        //                     {this.props.sources.map((source,index) => <li key={index}>source.author. (source.publishDate). "{source.title}." <i>source.siteName</i>, {source.url}. </li>)}
        //                 } 
        //             </ul>
        //         </Modal.Body>
        //     </Modal>
        // );
    }
}

export default BibWindow;