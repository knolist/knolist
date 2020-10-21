import React from 'react';
import ReactDOM from 'react-dom';
import {Navbar, Nav, Button, FlexboxGrid, Drawer} from 'rsuite';

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
                <Header curProject={this.state.curProject} showSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} close={this.switchShowProjectsSidebar}/>
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
                    <Button appearance="primary" id="projects-sidebar-btn" onClick={props.showSidebar}>
                        Your<br/>Projects
                    </Button>
                </Nav>
            </FlexboxGrid>
        </Navbar>
    );
}

function ProjectsSidebar(props) {
    return (
        <Drawer
            size="xs"
            show={props.show}
            onHide={props.close}>
            <Drawer.Header>
                <Drawer.Title>Your Projects</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
                Drawer body
            </Drawer.Body>
            <Drawer.Footer>
                <Button onClick={props.close} appearance="primary">Confirm</Button>
                <Button onClick={props.close} appearance="subtle">Cancel</Button>
            </Drawer.Footer>
        </Drawer>
    )
}

ReactDOM.render(<App/>, document.getElementById('root'));