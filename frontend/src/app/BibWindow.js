import React from "react";
import {
    Modal
} from "rsuite";

class BibWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Can be "MLA", "CHI", or "APA"
            formatType: "APA"
        }
    }

    render() {
        if (this.props.sources === null) return null;
        if (this.state.formatType === "MLA") {
            // Lundman, Susan. “How to Make Vegetarian Chili.” eHow, www.ehow.com/how_10727_make-vegetarian-chili.html. Accessed 6 July 2015.
            return (
                <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                    <Modal.Header>
                        <Modal.Title>
                        Bibliography
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            {this.props.sources.map((source,index) => <li key={index}>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate, {source.url}. Accessed source.accessDate. </li>)}
                        </ul>
                    </Modal.Body>
                </Modal>
            );
        } else if (this.state.formatType === "CHI") {
            return (
                <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                    <Modal.Header>
                        <Modal.Title>
                        Bibliography
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            {this.props.sources.map((source,index) => <li key={index}>source.author. "{source.title}." <i>source.siteName</i>, source.publishDate. source.accessDate. {source.url}. </li>)}
                        </ul>
                    </Modal.Body>
                </Modal>
            );
        } else if (this.state.formatType === "APA") {
            return (
                <Modal full show={this.props.showBib} onHide={() => this.props.setShowBib(false)}>
                    <Modal.Header>
                        <Modal.Title>
                        Bibliography
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ul>
                            {this.props.sources.map((source,index) => <li key={index}>source.author. (source.publishDate). "{source.title}." <i>source.siteName</i>, {source.url}. </li>)}
                        </ul>
                    </Modal.Body>
                </Modal>
            );
        }
        
    }
}

export default BibWindow;