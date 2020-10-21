import React from 'react';
import ReactDOM from 'react-dom';
import {Navbar, Nav, Button, FlexboxGrid, Drawer, Icon} from 'rsuite';

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

    render() {
        return (
            <div>
                <Header curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                        switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} close={this.switchShowProjectsSidebar}/>
            </div>
        );
    }
}

function Header(props) {
    const openSidebarButton = {
        // transform: "translateX(-400px)"
    }
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
                    <Button appearance="primary" id="projects-sidebar-btn"
                            style={props.showSidebar ? openSidebarButton : undefined} onClick={props.switchShowSidebar}>
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
            <Drawer.Body>
                <ProjectsList projects={projects}/>
            </Drawer.Body>
            <Drawer.Footer>
                <Button onClick={props.close} appearance="primary">Confirm</Button>
                <Button onClick={props.close} appearance="subtle">Cancel</Button>
            </Drawer.Footer>
        </Drawer>
    )
}

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.projects[0]}>
            {props.projects.map(project => <Nav.Item key={project} icon={<Icon icon="project"/>} eventKey={project}>{project}</Nav.Item>)}
        </Nav>
    );
}

ReactDOM.render(<App/>, document.getElementById('root'));