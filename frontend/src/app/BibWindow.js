import React from "react";
import {
    Modal, Dropdown, IconButton, Icon, Checkbox, CheckboxGroup, Tooltip
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        // citationsToExport = []
        this.state = {
            formatType: "APA",
            copyBib: false
        }
    }

    removeFromSaved = (value) => {
        this.setState({
            // citationsToExport removes that citation
            // citation is moved down and greyed out
        });
    }

    // changeFormatType = (type) => {
    //     this.setState({
    //         formatType: type 
    //     });
    // }

    // if sources have fields as None, return True
    // {if(isMissingFields(this.props.sources)) {<Icon icon="exclamation-circle" color="#f5a623"/>}}
    // isMissingFields = (sources) => {
    //     this.setState({

    //     });
    // }

    render() {
        if (this.props.sources === null) return null;
        return (
            <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                <Modal.Header>
                    <Modal.Title>
                    Bibliography
                    </Modal.Title>
                    <Dropdown title={this.state.formatType} activeKey={this.state.formatType}>
                        {/*
                        <Dropdown.Item eventKey="APA" onClick={this.changeFormatType}>APA</Dropdown.Item>
                        <Dropdown.Item eventKey="MLA" onClick={this.changeFormatType}>MLA</Dropdown.Item>
                        <Dropdown.Item eventKey="CHI" onClick={this.changeFormatType}>Chicago</Dropdown.Item>
                        */}
                        <Dropdown.Item eventKey="APA">APA</Dropdown.Item>
                        <Dropdown.Item eventKey="MLA">MLA</Dropdown.Item>
                        <Dropdown.Item eventKey="CHI">Chicago</Dropdown.Item>
                    </Dropdown>
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
                            source.author. (source.publishDate). "{source.title}." <i>source.siteName</i>, {source.url}. 
                            <Icon icon="exclamation-circle" color="#f5a623"/>
                            </Checkbox>)}
                        <p>Not Included</p>
                    </CheckboxGroup>
                </Modal.Body>
            </Modal>
        );

        // {/*<Tooltip title="This source is missing a field">*/}
        // <Icon icon="exclamation-circle" color="#f5a623"/>
        //     {/*<IconButton onClick={() => ())} icon={<Icon icon="exclamation-circle" color="#f5a623"/>}/>*/}
        // {/*</Tooltip>*/}

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