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
    Form,
    Dropdown,
    Checkbox,
    CheckboxGroup,
    Divider,
    Whisper,
    Tooltip,
    Modal,
    Placeholder,
    Loader,
    Animation
} from 'rsuite';
import {Network, DataSet} from 'vis-network/standalone';

// Custom imports
import Utils from './utils.js';

// Import styles
import 'rsuite/dist/styles/rsuite-default.css';
import './index.css';

// Import images
import horizontalLogo from './images/horizontal_main.png';

// Global variables
const {Fade} = Animation;

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MDkyMDQyNDksImV4cCI6MTYwOTI5MDY0OSwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.FExhb2ofcuRESwecK-fo7Ugk3yqqITxVS4AiiI1BihLc6QLv_w9M5zfZKb9FCYOXaT4UzEeHOv0h-pHrHAdYJJPPjLLnOJP31f9tKgA8pIXYoKKHCZ9Z1UzbUeA6JopGHWd9FZmMKWUcLiocMIDjIAVQEb_aCf5w8Q0wh_f9J3Je8aR53L8lUXk871CuDE1tTSSsFwSBW0oxPwC2EjyIHdD7jUjubAL7muFL793GQp2KEotHQ4Z_7CHbMj1SWGLAubUGD4WRRhtCtILmB9q1CgUIW31Jw-xi-xYFVGclLW9EHrDEG-1Oe9bh6jyYWcKK-idclf6XZ7XId2qVa7zKJg";
// const baseUrl = "https://knolist-api.herokuapp.com";
const baseUrl = "http://localhost:5000";

const utils = new Utils(jwt, baseUrl);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curProject: JSON.parse(localStorage.getItem("curProject")),
            projects: null,
            showProjectsSidebar: false
        }
    }

    getProjects = async () => {
        const response = await utils.makeHttpRequest("/projects");
        return response.body.projects;
    }

    updateProjects = (callback) => {
        this.getProjects().then(projects => {
            this.setState({projects: projects}, () => {
                // Update current project
                if (this.state.curProject !== null) {
                    this.setCurProject(this.state.curProject.id);
                }

                if (typeof callback === "function") {
                    callback();
                }
                if (projects.length > 0 && this.state.curProject === null) {
                    this.setState({curProject: projects[0]});
                }
            })
        });
    }

    switchShowProjectsSidebar = () => {
        this.setState({showProjectsSidebar: !this.state.showProjectsSidebar});
    }

    setCurProject = async (projectId) => {
        if (projectId === null) this.setState({curProject: null})
        else {
            const project = this.state.projects.find(x => x.id === projectId);
            this.setState({curProject: project});
        }
    }

    projectsButton = () => {
        return (
            <Button appearance="primary" id="projects-sidebar-btn" onClick={this.switchShowProjectsSidebar}>
                Your<br/>Projects
            </Button>
        );
    }

    componentDidMount() {
        this.updateProjects()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Update localstorage whenever the curProject changes
        if (prevState.curProject !== this.state.curProject) {
            if (this.state.curProject === null) {
                this.setState({curProject: this.state.projects[0]})
            }
            localStorage.setItem("curProject", JSON.stringify(this.state.curProject));
        }
    }

    render() {
        return (
            <div>
                <AppHeader curProject={this.state.curProject}/>
                <ProjectsSidebar show={this.state.showProjectsSidebar} curProject={this.state.curProject}
                                 projects={this.state.projects}
                                 close={this.switchShowProjectsSidebar} updateProjects={this.updateProjects}
                                 setCurProject={this.setCurProject}/>
                {this.projectsButton()}
                <MindMap curProject={this.state.curProject}/>
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
            sources: null,
            loading: false,
            showNewSourceForm: false,
            newSourceData: null
        }
    }

    setSelectedNode = (id) => {
        this.setState({selectedNode: id})
    }

    // Check if the network is in edit mode
    // isEditMode = () => {
    //     const visCloseButton = document.getElementsByClassName("vis-close")[0];
    //     return getComputedStyle(visCloseButton).display === "none"
    // }

    // Set selected node for the detailed view
    handleClickedNode = (id) => {
        this.setSelectedNode(id);
        // Only open modal outside of edit mode
        // if (this.isEditMode()) {
        //     this.setSelectedNode(id);
        // }
    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    getSources = async (callback) => {
        if (this.props.curProject === null) return null;
        this.setLoading(true);

        const endpoint = "/projects/" + this.props.curProject.id + "/sources";
        const response = await utils.makeHttpRequest(endpoint);
        this.setLoading(false);
        this.setState({sources: response.body.sources}, callback);
    }

    updateSourcePosition = async (sourceId, x, y) => {
        const endpoint = "/sources/" + sourceId;
        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "x_position": x,
                "y_position": y
            })
        }
        await utils.makeHttpRequest(endpoint, params);
    }

    fitNetworkToScreen = () => {
        if (this.state.network !== null) {
            this.state.network.fit()
        }
    }

    switchShowNewSourceForm = () => {
        this.setState({showNewSourceForm: !this.state.showNewSourceForm}, () => {
            // Get out of edit mode if necessary
            if (!this.state.showNewSourceForm && this.state.network) {
                this.state.network.disableEditMode()
            }
        });
    }

    addSource = (nodeData, callback) => {
        this.switchShowNewSourceForm();
        this.setState({
            newSourceData: nodeData
        });
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
                    selectConnectedEdges: false,
                    hover: true,
                    hoverConnectedEdges: false
                },
                manipulation: {
                    enabled: false,
                    addNode: this.addSource
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
        if (this.props.curProject === null || this.state.loading) return <Loader size="lg" backdrop center/>

        return (
            <div>
                <div id="mindmap"/>
                <SourceView selectedNode={this.state.selectedNode}
                            setSelectedNode={this.setSelectedNode}/>
                <NewSourceForm showNewSourceForm={this.state.showNewSourceForm}
                               newSourceData={this.state.newSourceData}
                               curProject={this.props.curProject}
                               renderNetwork={this.renderNetwork}
                               switchShowNewSourceForm={this.switchShowNewSourceForm}/>
                <AppFooter fit={this.fitNetworkToScreen} network={this.state.network}/>
            </div>

        );
    }
}

class NewSourceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newSourceUrlId: "new-source-url",
            loading: false
        }
    }

    close = () => {
        this.props.switchShowNewSourceForm()
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    addNewSource = () => {
        this.setLoading(true);
        const url = document.getElementById(this.state.newSourceUrlId).value;
        const {x, y} = this.props.newSourceData;
        const endpoint = "/projects/" + this.props.curProject.id + "/sources"
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url,
                "x_position": x,
                "y_position": y
            })
        }
        utils.makeHttpRequest(endpoint, params).then((response) => {
            if (response.status === 200) {
                // Alert that the source already exists in this project
            } else if (response.status === 201) {
                // Update sources
                this.props.renderNetwork();
            }
            this.props.switchShowNewSourceForm();
        });
    }

    render() {
        if (!this.props.showNewSourceForm) return null;

        return (
            <Modal full show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        Insert the URL of the source you'd like to add.
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={this.addNewSource}>
                    <Modal.Body>
                        <Input autoFocus type="url" required id={this.state.newSourceUrlId}
                               placeholder="New Source URL"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={this.state.loading} appearance="primary">
                            Add Source
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

class SourceView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceDetails: null,
            loading: false
        }

    }

    setLoading = (val) => {
        this.setState({loading: val});
    }

    close = () => {
        this.props.setSelectedNode(null);
    }

    getSourceDetails = async () => {
        if (this.props.selectedNode === null) {
            this.setState({sourceDetails: null});
            return;
        }

        this.setLoading(true);
        const endpoint = "/sources/" + this.props.selectedNode;
        const response = await utils.makeHttpRequest(endpoint);
        this.setState({sourceDetails: response.body.source}, () => this.setLoading(false));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.selectedNode !== this.props.selectedNode) {
            this.getSourceDetails();
        }
    }

    componentDidMount() {
        this.getSourceDetails();
    }

    render() {
        if (this.props.selectedNode === null) return null;

        if (this.state.loading || this.state.sourceDetails === null) return <Loader size="lg" backdrop center/>;

        const source = this.state.sourceDetails;
        return (
            <Modal full show onHide={this.close}>
                <Modal.Header>
                    <Modal.Title>
                        <a target="_blank" rel="noopener noreferrer" href={source.url}>{source.title}</a>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <HighlightsList highlights={source.highlights}/>
                    <Divider/>
                    <NotesList notes={source.notes}/>
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

function HighlightsList(props) {
    // TODO: include link to the Chrome Extension on the store.
    const chromeExtensionLink = "https://chrome.google.com/webstore/category/extensions?utm_source=chrome-ntp-icon";
    return (
        <div>
            <h6 className="source-view-subtitle">{props.highlights.length > 0 ? "My Highlights" : "You haven't added any highlights yet."}</h6>
            {
                props.highlights.length === 0 ?
                    <p>To add highlights, use the <a rel="noopener noreferrer" target="_blank"
                                                     href={chromeExtensionLink}>Knolist Chrome Extension</a>.
                        Select text on a page, right-click, then click on "Highlight with Knolist".</p> :
                    null
            }
            <ul>
                {props.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
            </ul>
        </div>
    )
}

function NotesList(props) {
    return (
        <div>
            <h6 className="source-view-subtitle">{props.notes.length > 0 ? "My Notes" : "You haven't added any notes yet."}</h6>
            <ul>
                {props.notes.map((notes, index) => <li key={index}>{notes}</li>)}
            </ul>
        </div>
    )
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

class AppFooter extends React.Component {
    startAddSourceMode = () => {
        if (this.props.network) this.props.network.addNodeMode()
    }

    newSourceButton = () => {
        return (
            <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="plus"/>}
                        circle size="lg"/>
        )
    }

    render() {
        return (
            <div id="footer">
                <Whisper preventOverflow trigger="hover" speaker={<Tooltip>Fit To Screen</Tooltip>}
                         placement="topStart">
                    <IconButton className="footer-btn" appearance="primary" icon={<Icon icon="arrows-alt"/>} circle
                                size="lg" onClick={this.props.fit}/>
                </Whisper>

                <Dropdown trigger={["click", "hover"]} placement="topEnd" renderTitle={this.newSourceButton}>
                    <Dropdown.Item>
                        <Icon icon="file-o"/> Add File
                    </Dropdown.Item>
                    <Dropdown.Item onClick={this.startAddSourceMode}>
                        <Icon icon="globe2"/> Add Web Page
                    </Dropdown.Item>
                </Dropdown>
            </div>
        )
    }
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
            showNewProjectForm: false
        }
    }

    setShowNewProjectForm = (val) => {
        this.setState({showNewProjectForm: val})
    }

    renderProjectsList = () => {
        if (this.props.projects === null) return <Placeholder.Paragraph rows={15} active/>;

        return <ProjectsList projects={this.props.projects} curProject={this.props.curProject}
                             updateProjects={this.props.updateProjects} setCurProject={this.props.setCurProject}/>
    }

    componentDidMount() {
        this.props.updateProjects();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.show !== this.props.show && !this.props.show) {
            this.setShowNewProjectForm(false);
        }
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
                    <NewProjectForm show={this.state.showNewProjectForm}
                                    setShowNewProjectForm={this.setShowNewProjectForm}
                                    updateProjects={this.props.updateProjects}/>
                </Drawer.Body>
                <Drawer.Footer>
                    <NewProjectButton setShowNewProjectForm={this.setShowNewProjectForm}
                                      showNewProjectForm={this.state.showNewProjectForm}/>
                </Drawer.Footer>
            </Drawer>
        )
    }
}

function NewProjectButton(props) {
    if (props.showNewProjectForm) {
        return (
            <Button onClick={() => props.setShowNewProjectForm(false)}>Cancel</Button>
        );
    } else {
        return (
            <Whisper preventOverflow trigger="hover" speaker={<Tooltip>New Project</Tooltip>}
                     placement="topEnd">
                <IconButton onClick={() => props.setShowNewProjectForm(true)} appearance="primary"
                            icon={<Icon icon="plus"/>} circle size="lg"/>
            </Whisper>
        );
    }
}

class NewProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputId: "new-project-name",
            loading: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.show !== this.props.show && this.props.show) {
            document.getElementById(this.state.inputId).focus();
        }
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    submit = () => {
        this.setLoading(true);
        let projectName = document.getElementById(this.state.inputId).value;
        projectName = utils.trimString(projectName);
        const endpoint = "/projects";
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "title": projectName
            })
        }
        utils.makeHttpRequest(endpoint, params).then(() => {
            // Update projects
            const callback = () => {
                this.props.setShowNewProjectForm(false);
                this.setLoading(false);
            }
            this.props.updateProjects(callback);
        });
    }

    render() {
        // if (!this.props.show) return null;

        return (
            <Fade in={this.props.show}>
                <Form id="new-project-form" layout="inline" onSubmit={this.submit}>
                    <Input autoFocus required id={this.state.inputId} placeholder="New Project Name"/>
                    <Button style={{float: "right", margin: 0}} appearance="primary" loading={this.state.loading}
                            type="submit">Create</Button>
                </Form>
            </Fade>
        );
    }
}

function ProjectsList(props) {
    return (
        <Nav vertical activeKey={props.curProject === null ? undefined : props.curProject.id}
             onSelect={(eventKey) => props.setCurProject(eventKey)}>
            {props.projects.map(project => <Project key={project.id} updateProjects={props.updateProjects}
                                                    project={project}
                                                    eventKey={project.id} setCurProject={props.setCurProject}/>)}
        </Nav>
    );
}

class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmDelete: false,
            loading: false,
            editing: false,
            updatedProjectNameFormId: "updated-project-name",
            updateProjectNameButtonId: "update-project-name-button"
        }
    }

    setLoading = (val) => {
        this.setState({loading: val})
    }

    setEditing = (val) => {
        this.setState({editing: val})
    }

    cancelEditing = (event) => {
        if (event.relatedTarget === null || event.relatedTarget.id !== this.state.updateProjectNameButtonId) {
            this.setEditing(false);
        }
    }

    setDeleteProject = (event) => {
        event.stopPropagation();
        this.setState({confirmDelete: true})
    }

    resetDeleteProject = () => {
        this.setState({confirmDelete: false})
    }

    deleteProject = () => {
        this.setLoading(true);
        const endpoint = "/projects/" + this.props.project.id;
        const params = {
            method: "DELETE"
        }
        utils.makeHttpRequest(endpoint, params).then(() => {
            // Reset the current project if the deleted is active
            let callback;
            if (this.props.active) callback = () => this.props.setCurProject(null);
            this.props.updateProjects(callback);
        });
    }

    updateProjectName = () => {
        this.setLoading(true);
        const updatedProjectName = utils.trimString(document.getElementById(this.state.updatedProjectNameFormId).value);
        const endpoint = "/projects/" + this.props.project.id;
        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "title": updatedProjectName
            })
        }
        utils.makeHttpRequest(endpoint, params).then(() => {
            this.props.updateProjects(() => {
                this.setEditing(false);
                this.setLoading(false);
            });
        });
    }

    generateConfirmDeletionWindow = () => {
        return (
            <Modal backdrop="static" show={this.state.confirmDelete} onHide={this.resetDeleteProject} size="xs">
                <Modal.Body>
                    <Icon
                        icon="remind"
                        style={{
                            color: '#ffb300',
                            fontSize: 24
                        }}
                    />
                    {'  '}
                    Are you sure you want to delete "{this.props.project.title}"?
                    <br/>
                    <b>This action cannot be undone.</b>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.deleteProject} appearance="primary" loading={this.state.loading}>
                        Delete
                    </Button>
                    <Button onClick={this.resetDeleteProject} appearance="default">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.generateConfirmDeletionWindow()}
                <Nav.Item onSelect={this.props.onSelect} eventKey={this.props.eventKey} active={this.props.active}>
                    <FlexboxGrid justify="space-between">
                        <FlexboxGrid.Item>
                            {
                                this.state.editing ?
                                    <Form onSubmit={this.updateProjectName}>
                                        <Input autoFocus required id={this.state.updatedProjectNameFormId}
                                               onClick={(e) => e.stopPropagation()}
                                               onBlur={(e) => this.cancelEditing(e)}
                                               defaultValue={this.props.project.title}/>
                                    </Form> :
                                    this.props.project.title
                            }
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                            <ButtonToolbar>
                                <EditProjectNameButton loading={this.state.loading} editing={this.state.editing}
                                                       updateProjectNameButtonId={this.state.updateProjectNameButtonId}
                                                       setEditing={this.setEditing}
                                                       updateProjectName={this.updateProjectName}/>
                                <IconButton onClick={this.setDeleteProject} icon={<Icon icon="trash"/>} size="sm"/>
                            </ButtonToolbar>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </Nav.Item>
            </div>
        );
    }
}

class EditProjectNameButton extends React.Component {
    buttonAction = (event, editing) => {
        event.stopPropagation();
        if (editing) this.props.setEditing(editing);
        else this.props.updateProjectName();
    }

    render() {
        if (this.props.editing) {
            return (
                <Button id={this.props.updateProjectNameButtonId} loading={this.props.loading}
                        onClick={(e) => this.buttonAction(e, false)}>Update</Button>
            );
        }

        return (
            <IconButton onClick={(e) => this.buttonAction(e, true)} icon={<Icon icon="edit2"/>} size="sm"/>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));