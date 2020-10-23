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
    Modal,
    Placeholder
} from 'rsuite';
import {Network, DataSet} from 'vis-network/standalone';

// import default style
import 'rsuite/dist/styles/rsuite-default.css';
import './index.css';

import horizontalLogo from './images/horizontal_main.png';

class App extends React.Component {
    constructor(props) {
        super(props);
        const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MDM0MTgzOTIsImV4cCI6MTYwMzUwNDc5MiwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.fQcMQX4YLVrxYkFSBKmziN25yh1nh-Y7zI6JJGoShA2LKYJ1hy4WanIXkXz8t8R3etppzp5wwDLpTfa6fR1egbKx4zH5mzUPuAFVsx2EHndz9Cnb7_bokuTPDAyKf1tyQkwDZ-Ivq6pVE3OaW9fz9ve8mUzYTBNNqk-uDnv9GG8rmmobDXXFC9D1YJL_WRJ95DKvjD_TyFkMi99KUyFFbsPecyMa5NbBgVvHwfEPBfwP2WSQVxzq-mid_eLHjCTdF6hdDZqIwhkm_hw0RwCfYGAFWWomKbb3GhEiCce158fWQJMfyb9kPkkOC57BaJRx8WUXCzZjiSEJs0d7Uhgo-g";
        const baseUrl = "https://knolist-api.herokuapp.com";
        // const baseUrl = "http://localhost:5000"
        this.state = {
            curProject: JSON.parse(localStorage.getItem("curProject")),
            projects: null,
            showProjectsSidebar: false,
            jwt: jwt,
            baseUrl: baseUrl
        }
    }

    getProjects = async () => {
        const url = this.state.baseUrl + "/projects";
        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + this.state.jwt
            }
        }).then(response => response.json());
        if (response.success) {
            return response.projects;
        } else {
            alert("Something went wrong!")
        }
    }

    switchShowProjectsSidebar = () => {
        this.setState({showProjectsSidebar: !this.state.showProjectsSidebar});
    }

    setCurProject = async (projectId) => {
        if (projectId === null) this.setState({curProject: null})

        const project = this.state.projects.find(x => x.id === projectId);
        this.setState({curProject: project});
    }

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br/>Projects
            </Button>
        );
    }

    componentDidMount() {
        this.getProjects().then(projects => {
            this.setState({projects: projects}, () => {
                if (projects.length > 0 && this.state.curProject === null) {
                    this.setState({curProject: projects[0]})
                }
            })
        });
    }

    componentDidUpdate(prevProps, prevState) {
        // Update localstorage whenever the curProject changes
        if (prevState.curProject !== this.state.curProject) {
            localStorage.setItem("curProject", JSON.stringify(this.state.curProject));
        }
    }

    render() {
        return (
            <div>
                <AppHeader curProject={this.state.curProject} showSidebar={this.state.showProjectsSidebar}
                           switchShowSidebar={this.switchShowProjectsSidebar}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 jwt={this.state.jwt} baseUrl={this.state.baseUrl}
                                 close={this.switchShowProjectsSidebar} setCurProject={this.setCurProject}/>
                {this.projectsButton()}
                <MindMap baseUrl={this.state.baseUrl} jwt={this.state.jwt} curProject={this.state.curProject}/>
            </div>
        );
    }
}

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            network: null,
            visNodes: null,
            visEdges: null,
            selectedNode: null,
            sources: null
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

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;

        const url = this.props.baseUrl + "/projects/" + this.props.curProject.id + "/sources";
        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + this.props.jwt
            }
        }).then(response => response.json());
        if (response.success) {
            this.setState({sources: response.sources}, callback)
        } else {
            alert("Something went wrong!")
        }
    }

    updateSourcePosition = async (sourceId, x, y) => {
        const url = this.props.baseUrl + "/sources/" + sourceId;
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + this.props.jwt,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "x_position": x,
                "y_position": y
            })
        }).then(response => response.json());
        if (!response.success) {
            alert("Something went wrong!");
        }
    }

    /* Helper function to generate position for nodes
    This function adds an offset to  the randomly generated position based on the
    position of the node's parent (if it has one)
     */
    generateNodePositions(node) {
        let xOffset = 0;
        let yOffset = 0;
        // Update the offset if the node has a parent
        if (node.prev_sources.length !== 0) {
            const prevId = node.prev_sources[0];
            const prevNode = this.state.sources.find(x => x.id === prevId);
            // Check if the previous node has defined coordinates
            if (prevNode.x_position !== null && prevNode.y_position !== null) {
                xOffset = prevNode.x_position;
                yOffset = prevNode.y_position;
            }
        }
        // Helper variable to generate random positions
        const rangeLimit = 300; // To generate positions in the interval [-rangeLimit, rangeLimit]
        // Generate random positions
        const xRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);
        const yRandom = Math.floor(Math.random() * 2 * rangeLimit - rangeLimit);

        // Return positions with offset
        return [xRandom + xOffset, yRandom + yOffset];
    }

    // Helper function to setup the nodes and edges for the graph
    createNodesAndEdges() {
        let nodes = new DataSet();
        let edges = new DataSet();
        // Iterate through each node in the graph and build the arrays of nodes and edges
        for (let index in this.state.sources) {
            let node = this.state.sources[index];
            // Deal with positions
            if (node.x_position === null || node.y_position === null) {
                // If position is still undefined, generate random x and y in interval [-300, 300]
                const [x, y] = this.generateNodePositions(node);
                this.updateSourcePosition(node.id, x, y);
                nodes.add({id: node.id, label: node.title, x: x, y: y});
            } else {
                nodes.add({id: node.id, label: node.title, x: node.x_position, y: node.y_position});
            }
            // Deal with edges
            for (let nextIndex in node.next_sources) {
                const nextId = node.next_sources[nextIndex];
                edges.add({from: node.id, to: nextId})
            }
        }
        this.setState({visNodes: nodes, visEdges: edges});
        return [nodes, edges];
    }

    renderNetwork = () => {
        if (this.props.curProject === null) return;

        this.getSources(() => {
            const [nodes, edges] = this.createNodesAndEdges();

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
                    font: {
                        face: "Apple-System",
                        color: "white"
                    },
                    color: {
                        background: getComputedStyle(document.querySelector(".rs-btn-primary"))["background-color"]
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

            // Initialize the network
            const network = new Network(container, data, options);
            network.fit()

            // Handle click vs drag
            network.on("click", (params) => {
                if (params.nodes !== undefined && params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    this.handleClickedNode(nodeId);
                }
            });

            // Update positions after dragging node
            network.on("dragEnd", () => {
                // Only update positions if there is a selected node
                if (network.getSelectedNodes().length !== 0) {
                    const id = network.getSelectedNodes()[0];
                    const position = network.getPosition(id);
                    const x = position.x;
                    const y = position.y;
                    this.updateSourcePosition(id, x, y);
                }
            });

            // Set cursor to pointer when hovering over a node
            network.on("hoverNode", () => network.canvas.body.container.style.cursor = "pointer");
            network.on("blurNode", () => network.canvas.body.container.style.cursor = "default");

            // Store the network
            this.setState({network: network});
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.curProject !== this.props.curProject) {
            this.renderNetwork();
        }
    }

    componentDidMount() {
        this.renderNetwork();
    }

    render() {
        if (this.props.curProject === null) return <Placeholder.Paragraph rows={20} active/>

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
                    <span id="project-title">
                        {
                            props.curProject === null ?
                                null :
                                "Current Project: " + props.curProject.title
                        }
                    </span>
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

class ProjectsSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: null
        }
    }

    getProjects = async () => {
        const url = this.props.baseUrl + "/projects"
        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + this.props.jwt
            }
        }).then(response => response.json());
        if (response.success) {
            this.setState({projects: response.projects})
        } else {
            alert("Something went wrong!")
        }
    }

    renderProjectsList = () => {
        if (this.state.projects === null) return <Placeholder.Paragraph rows={15} active/>;

        return <ProjectsList projects={this.state.projects} curProject={this.props.curProject}
                             setCurProject={this.props.setCurProject}/>
    }

    componentDidMount() {
        this.getProjects();
    }

    render() {
        return (
            <Drawer
                size="xs"
                show={this.props.show}
                onHide={this.props.close}>
                <Drawer.Header>
                    <Drawer.Title>Your Projects</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body style={{marginBottom: 10}}>
                    {this.renderProjectsList()}
                </Drawer.Body>
                <Drawer.Footer>
                    <IconButton appearance="primary" icon={<Icon icon="plus"/>} circle size="lg"/>
                </Drawer.Footer>
            </Drawer>
        )
    }
}

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.curProject === null ? undefined : props.curProject.id}
             onSelect={(eventKey) => props.setCurProject(eventKey)}>
            {props.projects.map(project => <Project key={project.id} project={project} eventKey={project.id}/>)}
        </Nav>
    );
}

function Project(props) {
    return (
        <Nav.Item {...props}>
            <FlexboxGrid justify="space-between">
                <FlexboxGrid.Item>
                    <Icon icon={"project"}/> {props.project.title}
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