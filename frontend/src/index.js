import React from 'react';
import ReactDOM from 'react-dom';
import {Navbar, Nav, Button, FlexboxGrid} from 'rsuite';

// import default style
import 'rsuite/dist/styles/rsuite-default.css';
import './index.css';

import horizontalLogo from './images/horizontal_main.png';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curProject: "Knolist"
        }
    }

    render() {
        return (
            <div>
                <Header curProject={this.state.curProject}/>
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
                    <Button appearance="primary" id="projects-sidebar-btn">Your<br/>Projects</Button>
                </Nav>
            </FlexboxGrid>
        </Navbar>
    );
}

ReactDOM.render(<App/>, document.getElementById('root'));