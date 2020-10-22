import React from 'react';
import ReactDOM from 'react-dom';
import {
    Navbar,
    Nav,
    Button,
    FlexboxGrid,
    Drawer,
    Icon,
    IconButton,
    ButtonToolbar,
    Input,
    InputGroup,
    Dropdown,
    Checkbox,
    CheckboxGroup,
    Divider,
    Whisper,
    Tooltip
} from 'rsuite';

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

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br/>Projects
            </Button>
        );
    }

    render() {
        return (
            <div>
                <Header curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                        switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 close={this.switchShowProjectsSidebar}
                                 setCurProject={this.setCurProject}/>
                {this.projectsButton()}
            </div>
        );
    }
}

function Header(props) {
    return (
        <Navbar style={{padding: "0 10px"}}>
            <FlexboxGrid justify="space-between" align="middle">
                <Navbar.Header>
                    <img className="limit-height" src={horizontalLogo} alt="Knolist"/>
                </Navbar.Header>
                <FlexboxGrid.Item>
                    <span id="project-title">Current Project: {props.curProject}</span>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <SearchAndFilter/>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </Navbar>
    );
}

class SearchAndFilter extends React.Component {
    constructor(props) {
        super(props);
        // TODO: make backend endpoint to return the filter categories
        const filterCategories = [
            "Page Content",
            "URL",
            "Title",
            "Next Connections",
            "Previous Connections",
            "Highlights",
            "Notes"
        ]
        this.state = {
            indeterminate: false,
            checkAll: true,
            value: filterCategories,
            filterCategories: filterCategories
        };
        this.handleCheckAll = this.handleCheckAll.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleCheckAll(value, checked) {
        const nextValue = checked ? this.state.filterCategories : [];
        this.setState({
            value: nextValue,
            indeterminate: false,
            checkAll: checked
        });
    }

    handleChange(value) {
        this.setState({
            value: value,
            indeterminate: value.length > 0 && value.length < this.state.filterCategories.length,
            checkAll: value.length === this.state.filterCategories.length
        });
    }

    render() {
        return (
            <FlexboxGrid>
                <FlexboxGrid.Item><SearchBar/></FlexboxGrid.Item>
                <FlexboxGrid.Item>
                    <Whisper
                        preventOverflow trigger="hover" speaker={<Tooltip>Search Filters</Tooltip>}
                        placement="bottomEnd">
                        <Dropdown placement="bottomEnd" renderTitle={() => <IconButton icon={<Icon icon="filter"/>}/>}>
                            <div style={{width: 200}}>
                                <Checkbox indeterminate={this.state.indeterminate} checked={this.state.checkAll}
                                          onChange={this.handleCheckAll}>
                                    Select all
                                </Checkbox>
                                <Divider style={{margin: "5px 0"}}/>
                                <CheckboxGroup name="checkboxList" value={this.state.value}
                                               onChange={this.handleChange}>
                                    {this.state.filterCategories.map(filter => {
                                        return <Checkbox key={filter} value={filter}>{filter}</Checkbox>
                                    })}
                                </CheckboxGroup>
                            </div>
                        </Dropdown>
                    </Whisper>
                </FlexboxGrid.Item>
            </FlexboxGrid>
        );
    }
}

function SearchBar() {
    return (
        <InputGroup style={{marginRight: 15}}>
            <Input placeholder="Search through your project"/>
            <InputGroup.Button>
                <Icon icon="search"/>
            </InputGroup.Button>
        </InputGroup>
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

ReactDOM.render(
    <App/>
    , document.getElementById('root'));