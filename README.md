# Knolist
This is the repository for the complete Knolist App. It is a Flask-based API that connects to a Postgres database, 
along with a React-based front end.  
Knolist is a research-assistant tool that aims to revolutionize how you organize your sources and find new ideas for 
your projects. It allows users to create projects and save their sources in a mind map style, where each source is 
viewed as a node in a graph.
1. Nodes can be freely moved around by changing the stored (x, y) position.
2. Sources are created by extracting the text content of a URL and storing it, so that the 
user can more easily search for sources they added.
3. Users can also add highlights from the page and write notes on each 
source.
4. Finally, they can create connections (edges in a graph) between sources, in order to identify concepts that 
relate to each other.

## Project guidelines
### Project structure highlights (as of 1/4/21)
```text
.
├── Procfile --> File that contains deployment instructions for Heroku
├── README.md --> This file
├── app --> Folder that contains most of the backend source code
│   ├── __init__.py
│   ├── main
│   │   ├── __init__.py
│   │   ├── auth --> Package that handles auth using Auth0
│   │   │   └── __init__.py
│   │   ├── config.py --> Sets up environments configurations (dev, test, prod) and databases
│   │   ├── controllers --> Sets the API endpoints
│   │   │   ├── __init__.py --> General endpoints
│   │   │   ├── connections.py --> Endpoints for /connections/...
│   │   │   ├── projects.py --> Endpoints for /projects/...
│   │   │   └── sources.py --> Endpoints for /sources/...
│   │   ├── error_handlers --> Defines the Flask error handlers
│   │   │   └── __init__.py
│   │   └── models --> Defines the SQLAlchemy database models
│   │       ├── __init__.py
│   │       └── models.py
│   └── test --> All test files
│       ├── __init__.py
│       ├── test_auth.py
│       ├── test_config.py
│       ├── test_connections.py
│       ├── test_projects.py
│       ├── test_rbac.py
│       └── test_sources.py
├── frontend --> Folder tha contains all of the frontend code (React)
│   ├── README.md --> Details how to run the frontend commands
│   ├── package-lock.json
│   ├── package.json
│   ├── public --> Folder that contains public static files (.ico, manifest.json, index.html, etc)
│   └── src --> Folder that contains the React source code
│       ├── app --> Contains React components specific to the app (AppHeader, MindMap, SourceView, etc)
│       ├── components --> Contains reusable components (ConfirmDeletionWindow, etc)
│       ├── images --> Contains images that are imported by the React code (logos)
│       ├── index.css --> Main stylesheet
│       ├── index.js --> First file that is called, renders the App component
│       └── services --> Collection of helpers
│           ├── HttpRequest.js --> Contains the method we use to make HTTP calls (it includes some utilities like authorization)
│           └── StringHelpers.js
├── knolist.postman_collection.json --> Postman test suite
├── manage.py --> Initiates the app, first script to be called
├── migrations --> Folder that contains the Flask-Migrate database migrations
├── requirements.txt --> Contains the necessary pip requirements
└── setup.sh --> Defines the necessary environment variables
```
- PS: Command to obtain tree:  
`tree -I "build|node_modules|env|__pycache__"`

### GitHub guidelines
We have 3 main branches on GitHub, with increasing importance and restrictions:
1. `dev`: This is the branch to which you will create pull requests. It contains the most updated
features that have been tested and vetted. This branch has restricted push permissions, 
it can only be updated through pull requests from a feature branch that you create.
2. `staging`: This is a pre-deployment branch. When a set of a features is ready for deployment, 
we create a pull request from `dev` to `staging` to make sure that everything works correctly. 
Most of the times, this branch is identical to `master`. This branch has restricted push permissions, 
it can only be updated through pull requests from `dev`.
3. `master`: This is the production branch. It always contains the most stable release and is deployed 
automatically to Heroku. This branch has restricted push permissions, 
it can only be updated through pull requests from `staging`.

To develop a feature, create a new branch with a descriptive name and develop within that branch.
When you're done with your code and all the tests, and after ensuring that your code follows the 
project' code style, create a pull request to `dev`.

### Issue tracking
To track tasks and issues, we use [ClickUp](https://app.clickup.com/2397669/). Tasks are divided
into sprints and should contain most or all the information necessary for development.
The main things to look for in a task are:
- Assignee: the person (or people) responsible for implementing that feature
- Due date: the date by which the feature should be fully implemented (generally the end of the sprint)
- Task ID: a unique identification number that can be used to associate commits with tasks (more on this later)

#### ClickUp, GitHub, and commit messages
To keep our commits organized, always include the ClickUp ID of the task related to 
what you implemented in the first line of your commit message. Additionally, verbs should
be in the present imperative tense: `fix bug` rather than `fixes bug` or `fixed bug`.
Example:
```text
CU-elnvv
Write tests for node creation feature.
```

### Code style
For all Python code, we enforce [PEP 8](https://www.python.org/dev/peps/pep-0008/) 
style rules. Code that fails at following those rules will not be accepted.
 
To check if your code follows PEP 8, use the [`pycodestyle`](https://pypi.org/project/pycodestyle/) command.

### API Development
To develop a new endpoint, follow these steps:
1. Locate the correct files to edit. This is based on the first URL parameter of your endpoit.
For example, if you're developing an endpoint that starts with `/projects`, you will edit the `projects.py` controller
and the `test_projects.py` test file.
2. Write comprehensive test cases for the endpoint you want to implement.
3. Run the tests and observe them fail (as expected, since nothing has been implemented)
4. Write code in the controller to perform the desired action for the new endpoint
5. If you need to make database updates, make the necessary documentation updates here and 
use Flask-Migrate to run a database migration after making your updates to the Model classes:
```bash
python manage.py db migrate
python manage.py db upgrade
```
6. Test the code and rewrite as necessary to pass the tests
7. Refactor your code for efficiency and correct style (use `pycodestyle`)
8. Add a clear documentation of your endpoint to the README, following the standard for the other endpoints
9. Only commit code that satisfies our style guidelines and passes all tests


## Getting Started
### Installing Dependencies
#### Python 3.6 (or above)

Follow instructions to install the latest version of python for your platform in the
[python docs](https://docs.python.org/3/using/unix.html#getting-and-installing-the-latest-version-of-python).

#### Virtual Environment

We recommend working within a virtual environment whenever using Python for projects. This keeps your dependencies 
for each project separate and organized. To create a virtual environment, observe the following steps:
1. Install `virtualenv` if you haven't done so yet: `pip3 install virtualenv`
2. From the root directory, create a virtual environment called `env`: `python -m venv env`
3. Activate the virtual environment: `source env/bin/activate`
4. To deactivate the virtual environment, simply run: `deactivate`

#### PIP Dependencies

Once you have your virtual environment setup and running, install dependencies by running the following command
from the root directory:

```bash
pip install -r requirements.txt
```

This will install all of the required packages we selected within the `requirements.txt` file.

##### Key Backend Dependencies

- [Flask](http://flask.pocoo.org/) is a lightweight backend microservices framework. 
Flask is required to handle requests and responses.

- [Flask-Script](https://flask-script.readthedocs.io/en/latest/) is used to set customized commands to run the server,
run tests, and perform database migrations.

- [SQLAlchemy](https://www.sqlalchemy.org/) and [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/en/2.x/) 
are libraries used to handle the [PostgreSQL](https://www.postgresql.org/) database.

- [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/): A library used to manage database migrations.

- [jose](https://python-jose.readthedocs.io/en/latest/): JavaScript Object Signing and Encryption for JWTs. 
Useful for encoding, decoding, and verifying JWTs.

- [unittest](https://docs.python.org/3/library/unittest.html): The default Python unit testing framework, used for our
automated test suite.

#### Key Frontend Dependencies
- [npm](https://www.npmjs.com/): Node Package Manager, used to install and manage dependencies for our frontend code.

- [React.js](https://reactjs.org/): JavaScript library/framework for frontend development.

- [Babel](https://babeljs.io/): JavaScript compiler that enables us to use [JSX](https://reactjs.org/docs/introducing-jsx.html) in React.

- [React Suite](https://rsuitejs.com/): A suite of React components, sensible UI design, and a friendly development experience.

- [vis-network](https://visjs.github.io/vis-network/docs/network/): A part of the [vis.js](https://visjs.org/) library used to display the graph structure of a project.


#### Installing frontend dependencies
From the `frontend` directory, run `npm install`

## Database Setup
Install Postgres following [these instructions](https://www.postgresql.org/download/). 
On Linux, you have to run:
```bash
apt-get install postgresql
```

Start a Postgres server using:
```bash
sudo service postgresql start
```

Create a dev database and a test database:
```bash
createdb knolist
createdb knolist_test
```

Run the database migrations to create the schema of the `knolist` database:
```bash
python manage.py db upgrade
```

### Data Modeling
- The models used for this app can be found in `app/main/models/models.py`
- The database consists of three tables: `projects`, `sources`, and `edges`
- `projects` table:
    - Represents Project objects
    - Contains an `id` (primary key), the `title` of the project, and the `user_id` of the user 
    that owns the project (this ID comes from Auth0 authentication, so there's no local users database)
    - Through SQLAlchemy, the Project object also contains a `sources` field, which represents the one-to-many
    relationship between projects and sources. `sources` holds a list of all Source objects owned by
    the project.
    - The model contains insert, update, delete, and format helper functions.
- `sources` table:
    - Represents Source objects
    - Contains an `id` (primary key), the source's `url`, `title`, `content` (which is extracted based on the URL
    and used for search purposes), `highlights` (stored as a JSON array), `notes` (stored as a JSON array),
    `x_position` and `y_position` (integers representing the position of the source in the project graph),
    and `project_id` (a foreign key that refers to the `projects` table)
    - Through SQLAlchemy, the Source object also contains a `project` field, which returns the Project object
    that owns the source. It also has `next_sources` and `prev_sources`, which are two lists of the sources
    to which the current source is connected. This many-to-many relationship is encapsulated by the `edges` table.
    - The table also has a uniqueness constraint to ensure that, within a given project, there will be no more than one
    instance of any given URL.
    - The model contains insert, update, delete, format_short, and format_long helper functions.
- `edges` table:
    - Represents the many-to-many relationship between sources
    - Contains a `from_id` and a `to_id`, both of which are primary keys, to represent the 
    sources involved in that connection.
## Running the server

From the root directory, first ensure you are working using your created virtual environment.

Each time you open a new terminal session, run the following command to set the necessary environment variables:
```bash
source setup.sh
```

To run the server, execute:
```bash
python manage.py run
```
By default, the server will be run on `localhost:5000`.

By changing the `$BOILERPLATE_ENV` environment variable in `setup.sh`, you can choose the configuration to run the server:
- `"test"`: Testing configuration
- `"dev"`: Development configuration
- `"prod"`: Production configuration

## Testing
To run the `unittest` test suite, run the following command from the root directory:
```bash
python manage.py test
```

A [Postman collection](./knolist.postman_collection.json) with a valid JWT is also included to facilitate testing the 
endpoints. The collection doesn't have any tests, since those are done through unittest.
The [setup.sh](./setup.sh) file contains two valid JWTs for local testing, as well.

## Running the frontend
After installing the frontend dependencies, run `npm start` from the `frontend` folder. The frontend will
be accessible at `http://localhost:3000`.

To create a build that can be accessed from the main Python server, run `npm run build`, then visit `http://localhost:5000`
(with the backend running).

# Knolist API Reference
## Getting Started
- Base URL: `knolist-api.herokuapp.com` (Note: when runing locally, the base URL is `localhost:5000`)
- Authentication:
    - Authentication is done using Auth0, a third-party auth system.
    - Most endpoints require a valid JWT for authorization.
    - JWTs must be passed as a Bearer token in the Authorization header.
    - Login can be done through the following link: 
    https://knolist.us.auth0.com/authorize?audience=knolist&response_type=token&client_id=pBu5uP4mKTQgBttTW13N0wCVgsx90KMi&redirect_uri=https://knolist-api.herokuapp.com/auth/callback
    - There are two different roles:
        - User: A general user of Knolist. Has access to all the basic functionality.
        - Premium User: A user that pays for a Knolist subscription, which allows them to access a few more features. 
        At this stage, the only premium feature is the "search" feature, which allows a premium user to search through
        all the sources in a project.
    - In the authentication process, the user_id is passed as a parameter to all endpoints, so that a user can only access
    their own resources.
    - This application doesn't require any API keys
    
## Error Handling
Errors are returned as JSON objects in the following format:
```json
{
  "success": false,
  "error": 400,
  "message": "bad request"
}
```   
The API will generally return one of seven error types when requests fail:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 405: Method Not Allowed
- 422: Unprocessable Entity
- 500: Internal Server Error
 
## Types of return objects
Whenever a JSON object that represents a database model is returned, there are a few possible formatting options:
- A `project` is an object that contains the following keys:
    - "id": the project's ID in the database
    - "title": the project's title
- A `short source` is an object that contains the following keys:
    - "id": the source's ID in the database
    - "url": the URL of the source
    - "title": the title of the source
    - "x_position" and "y_position": the x and y positions of the source (positions in a graph)
    - "next_sources" and "previous_sources": two lists of source IDs that represent the sources connected to the 
    current source. "next_sources" contains sources that are children of the current source, while "prev_sources" 
    contains parent sources
    - "project_id": the ID of the project where the current source belongs
- A `long source` is a more complete representation of a source. 
It contains all the keys of `short source`, as well as the following:
    - "highlights": an array of all the highlights associated with that source. Each highlight in the array is a string.
    - "notes": analogous to highlights
 
## Endpoints
- NOTE: all `curl` samples omit the Authorization header for the sake of simplicity.
Assume that all `curl` calls include the following:
```bash
-H "Authorization: Bearer <VALID_JWT>"
```

### GET '/projects'
- Returns a list of all projects owned by the requesting user
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "projects": a list of all `project` objects owned by the requesting user
- Sample: `curl https://knolist-api.herokuapp.com/projects`
```
200 OK
```
```json
{
    "projects": [
        {
            "id": 1,
            "title": "New Project"
        },
        {
            "id": 2,
            "title": "New Project 2"
        }
    ],
    "success": true
}
```

### POST '/projects'
- Creates a new project for the requesting user.
- Request arguments (passed as JSON body):
    - `string` "title": The title of the new project *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "project": a `project` object that represents the newly created project
- Sample: `curl https://knolist-api.herokuapp.com/projects -X POST -H "Content-Type: application/json" -d "{"title": "New Project"}"`
```
201 Created
```
```json
{
  "project": {
    "id": 3,
    "title": "New Project"
  },
  "success": true
}

```

### PATCH '/projects/{project_id}'
- Updates the title of an existing project given its ID.
- Request arguments (passed as JSON body):
    - `string` "title": The new title to be applied *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "project": a `project` object that represents the updated project
- Sample: `curl https://knolist-api.herokuapp.com/projects/1 -X PATCH -H "Content-Type: application/json" -d "{"title": "Updated Title"}"`
```
200 OK
```
```json
{
  "project": {
    "id": 1,
    "title": "Updated Title"
  },
  "success": true
}
```

### DELETE '/projects/{project_id}'
- Deletes an existing project given its ID.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "deleted": the ID of the project that was deleted
- Sample: `curl https://knolist-api.herokuapp.com/projects/3 -X DELETE`
```
200 OK
```
```json
{
  "deleted": 3,
  "success": true
}
```

### GET '/projects/{project_id}/sources'
- This endpoint serves two different purposes, depending on whether or not a search query is passed.
1. Get all sources.
    - Fetches all the sources of a given project (based on the project ID)
    - Request arguments: None
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "sources": an array of `short source` objects representing all the sources of the project
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/sources`
```
200 OK
```
```json
{
  "sources": [
    {
      "id": 1,
      "next_sources": [],
      "prev_sources": [
        2
      ],
      "project_id": 1,
      "title": "Robert Browning - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "next_sources": [
        4,
        1
      ],
      "prev_sources": [],
      "project_id": 1,
      "title": "My Last Duchess - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "x_position": null,
      "y_position": null
    },
    {
      "id": 4,
      "next_sources": [],
      "prev_sources": [
        2
      ],
      "project_id": 1,
      "title": "Anthology - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Anthology",
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```

2. Search through sources.
    - Searches through all sources of the given project. The search is case-insensitive and looks through all text 
    fields of all sources (url, title, content, highlights, and notes)
    - Request arguments:
        - `query`: a string passed as a query parameter, indicating the query to be searched *(Required)*
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "sources": an array of `short source` objects representing all the sources in the project
         that contain the given query
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/sources?query=Browning`
```
200 OK
```
```json
{
  "sources": [
    {
      "id": 1,
      "next_sources": [],
      "prev_sources": [
        2
      ],
      "project_id": 1,
      "title": "Robert Browning - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "next_sources": [
        4,
        1
      ],
      "prev_sources": [],
      "project_id": 1,
      "title": "My Last Duchess - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```

3. Search through specific fields of the sources.
    - Searches through all sources of the given project. The search is case-insensitive and looks through the
    fields of the sources as specified by the user.
    - Request arguments:
        - `query`: a string passed as a query parameter, indicating the query to be searched *(Required)*
        - `filter`: a list of fields passed as a filter parameter, indicating the fields to be searched *(Required)*
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "sources": an array of `short source` objects representing all the sources in the project
         that contain the given query in any of the fields specified
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/sources?query=Duchess&filter=title&filter=content`
```
200 OK
```
```json
{
  "sources": [
    {
      "id": 1,
      "next_sources": [],
      "prev_sources": [
        2
      ],
      "project_id": 1,
      "title": "Robert Browning - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "next_sources": [
        4,
        1
      ],
      "prev_sources": [],
      "project_id": 1,
      "title": "My Last Duchess - Wikipedia",
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```

### POST '/projects/{project_id}/sources'
- Creates a new source and adds it to the given project (based on the ID). The source is created based on its URL, 
which is used to extract the page title and content, both of which are saved in the database.
- If the given URL already exists in the given project, no new source is created (URLs must be unique withing a project)
If that is the case, the return status wil be 200 instead of 201, since no new source was created.
- Request arguments (passed as JSON body):
    - `string` "url": the URL of the source that will be added *(Required)*
    - `float` "x_position": the y position to apply to the source *(Optional)*
    - `float` "y_position": the y position to apply to the source *(Optional)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `short source` object representing the newly created source (or the existing source if the URL is 
    already in the project)
- Sample: `curl https://knolist-api.herokuapp.com/projects/1/sources -X POST -H "Content-Type: application/json" -d '{"url": "https://en.wikipedia.org/wiki/English_poetry"}'`
```
201 Created (or 200 OK if the URL already exists in the project)
```
```json
{
  "source": {
    "id": 5,
    "next_sources": [],
    "prev_sources": [],
    "project_id": 1,
    "title": "English poetry - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/English_poetry",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### POST '/projects/{project_id}/connections'
- Creates a new connection between sources in the project. The sources are defined by their URLs, and if a source 
doesn't exist yet, it is first created.
- If the connection already exists in the project, no new connection is created, and a status code 200 is returned to
signify that.
- Request arguments (passed as JSON body):
    - `string` "from_url": the URL of the source with the outgoing connection *(Required)*
    - `string` "to_url": the URL of the source with the incoming connection *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "from_source": a `short source` object representing the source from where the connection leaves
    - "to_source": a `short source` object representing the source to where the connection goes
- Sample: `curl https://knolist-api.herokuapp.com/projects/1/connections -X POST -H "Content-Type: application/json" -d '{"from_url": "https://en.wikipedia.org/wiki/My_Last_Duchess", "to_url": "https://en.wikipedia.org/wiki/English_poetry"}'`
```
201 Created (or 200 OK if the connection already existed)
```
```json
{
  "from_source": {
    "id": 2,
    "next_sources": [
      4,
      1,
      5
    ],
    "prev_sources": [],
    "project_id": 1,
    "title": "My Last Duchess - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
    "x_position": null,
    "y_position": null
  },
  "success": true,
  "to_source": {
    "id": 5,
    "next_sources": [],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "English poetry - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/English_poetry",
    "x_position": null,
    "y_position": null
  }
}
```

### GET '/sources/{source_id}'
- Fetches the detailed information of a specific source.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the requested source
- Sample: `curl https://knolist-api.herokuapp.com/sources/1`
```
200 OK
```
```json
{
  "source": {
    "highlights": [
      "This is a highlight",
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "This is a note"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "Robert Browning - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### DELETE '/sources/{source_id}'
- Deletes a source based on its ID.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "deleted": the ID of the source that was deleted
- Sample: `curl https://knolist-api.herokuapp.com/sources/5 -X DELETE`
```
200 OK
```
```json
{
  "deleted": 5,
  "success": true
}
```

### PATCH '/sources/{source_id}'
- Allows updates to most fields of the given source.
- Request arguments (passed as JSON body, at least one is required):
    - `string` "title": the new title to apply to the source *(Optional)*
    - `string` "content": the new content to apply to the source *(Optional)*
    - `float` "x_position": the new x position to apply to the source *(Optional)*
    - `float` "y_position": the new y position to apply to the source *(Optional)*
    - `array` of `string` "highlights": the new array of highlights to apply to the source *(Optional)*
    - `array` of `string` "notes": the new array of notes to apply to the source *(Optional)*
    - `int` "project_id": the ID of the new project that this source will belong to. It must be a valid ID of an 
    existing project. If the project already has a source with the current URL, error 422 is thrown.
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1 -X PATCH -H "Content-Type: application/json" -d '{"title": "New title", "notes": ["Updated notes", "New notes"]}'`
```
200 OK
```
```json
{
  "source": {
    "highlights": [
      "This is a highlight",
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "Updated notes",
      "New notes"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### POST '/sources/{source_id}/highlights'
- Appends a new highlight to a source's highlights.
- Request arguments (passed as JSON body):
    - `string` "highlight": the string that will be appended to the highlights list *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/highlights -X POST -H "Content-Type: application/json" -d '{"highlight": "This is a new highlight"}'`
```
201 Created
```
```json
{
  "source": {
    "highlights": [
      "This is a highlight",
      "This is another highlight",
      "This is a new highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "Updated notes",
      "New notes"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### DELETE '/sources/{source_id}/highlights'
- Deletes one or more highlights from a source.
- Request arguments (passed as JSON body):
    - `array` of `int` "delete": an array of indices to be deleted from the list of highlights *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/highlights -X DELETE -H "Content-Type: application/json" -d '{"delete": [0, 2]}'`
```
200 OK
```
```json
{
  "source": {
    "highlights": [
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "Updated notes",
      "New notes"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### POST '/sources/{source_id}/notes'
- Appends a new note to a source's notes.
- Request arguments (passed as JSON body):
    - `string` "note": the string that will be appended to the notes list *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/notes -X POST -H "Content-Type: application/json" -d '{"note": "This is a new note"}'`
```
201 Created
```
```json
{
  "source": {
    "highlights": [
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "Updated notes",
      "New notes",
      "This is a new note"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### DELETE '/sources/{source_id}/notes'
- Deletes one or more notes from a source.
- Request arguments (passed as JSON body):
    - `array` of `int` "delete": an array of indices to be deleted from the list of notes *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/notes -X DELETE -H "Content-Type: application/json" -d '{"delete": [1, 2]}'`
```
200 OK
```
```json
{
  "source": {
    "highlights": [
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "Updated notes"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### PATCH '/sources/{source_id}/notes'
- Updates the content of one of a source's notes.
- Request arguments (passed as JSON body):
    - `int` "note_index": the index of the note to be updated in the notes list *(Required)*
    - `string` "new_content": the content the will be inserted in the given index *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "source": a `long source` object representing the source that was just updated
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/notes -X PATCH -H "Content-Type: application/json" -d '{"note_index": 0, "new_content": "New content for the documentation"}'`
```
200 OK
```
```json
{
  "source": {
    "highlights": [
      "This is another highlight"
    ],
    "id": 1,
    "next_sources": [],
    "notes": [
      "New content for the documentation"
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### POST '/connections'
- Creates a connection given two existing source IDs (they must be in the same project). If the connection already exists,
no new connection is created, and a 200 status code is returned to signify that
- Request arguments (passed as JSON body):
    - `id` "from_id": the ID of the source with the outgoing connection *(Required)*
    - `id` "to_id": the ID of the source with the incoming connection *(Required)*
- Returns: A JSON body with the following keys:
    - "success": holds `true` if the request was successful
    - "from_source": a `short source` object representing the source from where the connection leaves
    - "to_source": a `short source` object representing the source to where the connection goes
- Sample: `curl https://knolist-api.herokuapp.com/connections -X POST -H "Content-Type: application/json" -d '{"from_id": 1, "to_id": 4}'`
```
201 Created (or 200 OK if the connection already existed)
```
```json
{
  "from_source": {
    "id": 1,
    "next_sources": [
      4
    ],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true,
  "to_source": {
    "id": 4,
    "next_sources": [],
    "prev_sources": [
      2,
      1
    ],
    "project_id": 1,
    "title": "Anthology - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/Anthology",
    "x_position": null,
    "y_position": null
  }
}
```

### DELETE '/connections'
- Deletes an existing connection.
- Request arguments (passed as JSON body):
    - `id` "from_id": the ID of the source with the outgoing connection *(Required)*
    - `id` "to_id": the ID of the source with the incoming connection *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "from_source": a `short source` object representing the source from where the connection leaves
    - "to_source": a `short source` object representing the source to where the connection goes
- Sample: `curl https://knolist-api.herokuapp.com/connections -X DELETE -H "Content-Type: application/json" -d '{"from_id": 1, "to_id": 4}'`
```
200 OK
```
```json
{
  "from_source": {
    "id": 1,
    "next_sources": [],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "New title",
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",
    "x_position": null,
    "y_position": null
  },
  "success": true,
  "to_source": {
    "id": 4,
    "next_sources": [],
    "prev_sources": [
      2
    ],
    "project_id": 1,
    "title": "Anthology - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/Anthology",
    "x_position": null,
    "y_position": null
  }
}
```
