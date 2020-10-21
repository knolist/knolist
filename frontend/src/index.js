import React from 'react';
import ReactDOM from 'react-dom';
import {Navbar, Nav, Button, FlexboxGrid, Drawer, Icon, IconButton, ButtonToolbar} from 'rsuite';

// import default style
import 'rsuite/dist/styles/rsuite-default.css';
import './index.css';

import horizontalLogo from './images/horizontal_main.png';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curProject: "Knolist",
            showProjectsSidebar: false
        }
    }

    switchShowProjectsSidebar = () => {
        this.setState({showProjectsSidebar: !this.state.showProjectsSidebar});
    }

    setCurProject = (project) => {
        // TODO: add callback to update graph data
        this.setState({curProject: project})
    }

    render() {
        return (
            <div>
                <Header curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                        switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 close={this.switchShowProjectsSidebar}
                                 setCurProject={this.setCurProject}/>
            </div>
        );
    }
}

function Header(props) {
    return (
        <Navbar>
            <FlexboxGrid justify="space-between" align="middle">
                <Navbar.Header>
                    <img className="limit-height" src={horizontalLogo} alt="Knolist"/>
                </Navbar.Header>
                <FlexboxGrid.Item>
                    <span id="project-title">Current Project: {props.curProject}</span>
                </FlexboxGrid.Item>
                <Nav pullRight>
                    <Button appearance="primary" id="projects-sidebar-btn" onClick={props.switchShowSidebar}>
                        Your<br/>Projects
                    </Button>
                </Nav>
            </FlexboxGrid>
        </Navbar>
    );
}

function ProjectsSidebar(props) {
    const projects = ["Knolist", "My Last Duchess", "Grad School Application"];
    return (
        <Drawer
            size="xs"
            show={props.show}
            onHide={props.close}>
            <Drawer.Header>
                <Drawer.Title>Your Projects</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body style={{marginBottom: 10}}>
                <ProjectsList projects={projects} curProject={props.curProject} setCurProject={props.setCurProject}/>
            </Drawer.Body>
            <Drawer.Footer>
                <IconButton appearance="primary" icon={<Icon icon="plus"/>} circle size="lg"/>
            </Drawer.Footer>
        </Drawer>
    )
}

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.curProject} onSelect={(eventKey) => props.setCurProject(eventKey)}>
            {props.projects.map(project => <Project key={project} project={project} eventKey={project}/>)}
        </Nav>
    );
}

function Project(props) {
    return (
        <Nav.Item {...props}>
            <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item>
                    <Icon icon={"project"}/> {props.project}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <ButtonToolbar>
                        <IconButton icon={<Icon icon="edit2"/>} size="sm"/>
                        <IconButton icon={<Icon icon="trash"/>} size="sm"/>
                    </ButtonToolbar>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </Nav.Item>
    );
}

ReactDOM.render(<App/>, document.getElementById('root'));