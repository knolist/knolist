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
    Tooltip,
    Modal
} from 'rsuite';
import {Network, DataSet} from 'vis-network/standalone';

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
                <AppHeader curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                           switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 close={this.switchShowProjectsSidebar}
                                 setCurProject={this.setCurProject}/>
                {this.projectsButton()}
                <MindMap/>
            </div>
        );
    }
}

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            network: null,
            selectedNode: null
        }
    }

    setSelectedNode = (id) => {
        this.setState({selectedNode: id})
    }

    // Check if the network is in edit mode
    isEditMode = () => {
        const visCloseButton = document.getElementsByClassName("vis-close")[0];
        return getComputedStyle(visCloseButton).display === "none"
    }

    // Set selected node for the detailed view
    handleClickedNode = (id) => {
        // Only open modal outside of edit mode
        if (this.isEditMode()) {
            this.setSelectedNode(id);
        }
    }

    componentDidMount() {
        // create an array with nodes
        const nodes = new DataSet([
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ]);

        // create an array with edges
        const edges = new DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ]);

        // create a network
        const container = document.getElementById('mindmap');

        // provide the data in the vis format
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {
            nodes: {
                shape: "box",
                size: 16,
                margin: 10,
                physics: false,
                chosen: false,
                color: {
                    // background: nodeBackgroundDefaultColor
                },
                widthConstraint: {
                    maximum: 500
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true
                    }
                },
                color: "black",
                physics: false,
                smooth: false,
                hoverWidth: 0
            },
            interaction: {
                navigationButtons: true,
                selectConnectedEdges: false,
                hover: true,
                hoverConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: false,
                // addNode: this.addNode,
                // deleteEdge: this.deleteEdge,
                // addEdge: this.addEdge,
                editEdge: false
            }
        };

        // initialize your network!
        const network = new Network(container, data, options);
        network.fit()

        // Handle click vs drag
        network.on("click", (params) => {
            if (params.nodes !== undefined && params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                this.handleClickedNode(nodeId);
            }
        });

        // Set cursor to pointer when hovering over a node
        network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
        network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

        // Store the network
        this.setState({network: network});
    }

    render() {
        return (
            <div>
                <div id="mindmap"/>
                <SourceView selectedNode={this.state.selectedNode} setSelectedNode={this.setSelectedNode}/>
            </div>

        );
    }
}

class SourceView extends React.Component {
    close = () => {
        this.props.setSelectedNode(null);
    }

    render() {
        if (this.props.selectedNode === null) return null;

        return (
            <Modal full show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>Modal Title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    This is the body with selected node {this.props.selectedNode}
                </Modal.Body>
                <Modal.Footer>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Edit Source</Tooltip>}
                             placement="bottom">
                        <IconButton icon={<Icon icon="edit2"/>} size="lg"/>
                    </Whisper>
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Delete Source</Tooltip>}
                             placement="bottom">
                        <IconButton icon={<Icon icon="trash"/>} size="lg"/>
                    </Whisper>
                </Modal.Footer>
            </Modal>

        );
    }
}

function AppHeader(props) {
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
                    <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Search Filters</Tooltip>}
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