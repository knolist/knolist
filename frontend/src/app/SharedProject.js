import React from "react";
import {Whisper, Tooltip, Icon, IconButton, Table, Modal, Form, Input, Button} from 'rsuite';
import makeHttpRequest from "../services/HttpRequest";
const { Column, HeaderCell, Cell } = Table;


// const data = [{ name: 'foobar', email: 'foobar@xxx.com', role: "Owner" }, { name: 'boofar', email: 'boofar@xxx.com', role: "Collaborator" }];

class SharedProject extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userInputId: "user-input-id",
            loading: false
        }
    }

    saveUser = async () => {
        this.setLoading(true);
        const email = document.getElementById(this.state.userInputId).value.trim();

        const body = {
            "shared_proj": this.props.curProject.id,
            "email": email,
            "role": "Collaborator"
        }
        const endpoint = "/shared_projects";
        await makeHttpRequest(endpoint, 'POST', body);
        this.props.updateProjects();
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.curProject !== this.props.curProject && this.props.showSharedProject) {
            this.setLoading(false);
        }
    }

    render() {
        if (this.props.curProject === null) {
            return null;
        }
        return (
            <Modal show={this.props.showSharedProject} onHide={() => this.props.setShowSharedProject(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Shared settings for {this.props.curProject.title}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.saveUser}>
                    <Modal.Body>
                        <Table data={this.props.curProject.shared_users}>
                            <Column width={200} fixed>
                                <HeaderCell>Name</HeaderCell>
                                <Cell dataKey="name" />
                            </Column>
                            <Column width={200}>
                                <HeaderCell>Email</HeaderCell>
                                <Cell dataKey="email" />
                            </Column>
                            <Column width={200}>
                                <HeaderCell>Role</HeaderCell>
                                <Cell dataKey="role" />
                            </Column>
                        </Table>
                        <Input style={{marginRight: 10}} placeholder="Type email you want to share project with"
                            id={this.state.userInputId} autoFocus required componentClass="textarea" rows={30}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={this.state.loading} appearance="primary">
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}
export default SharedProject;