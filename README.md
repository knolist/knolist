# Knolist
This is the repository for the complete Knolist App. It is a Flask-based API that connects to a Postgres database, 
along with a React-based front end.  
Knolist is a research-assistant tool that aims to revolutionize how you organize your sources and find new ideas for 
your projects. It allows users to create projects and save their sources in a mind map style, where each item is 
viewed as a node in a graph.
1. Nodes can be freely moved around by changing the stored (x, y) position.
2. Items are created by receiving the text content of a note or highlight and storing it, 
along with a possible associated source.
3. Sources are created by extractng the text content of a url and storing it, so a user can more easily 
search for sources they added.
3. Users can also add highlights from the page and write notes on each 
source.

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
│   │   │   └── items.py --> Endpoints for /items/...
│   │   │   └── shared_projects.py --> Endpoints for /shared_projects/...
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
│       └── test_items.py
│       └── test_shared_projects.py
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

If you run into issues with this command (`FATAL: password authentication failed for user "postgres"`), try running:
```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
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
    - Through SQLAlchemy, the Project object also contains a `shared_users` field, which represents the 
    many-to-many relationship between shared_projects and shared_users.
    - The model contains insert, update, delete, and format helper functions.
- `sources` table:
    - Represents Source objects
    - Contains an `id` (primary key), the source's `url`, `title`, `content` (which is extracted based on the URL
    and used for search purposes), `x_position` and `y_position` (integers representing the position 
    of the source in the project graph), and `project_id` (a foreign key that refers to the `projects` table)
    - Through SQLAlchemy, the Source object also contains a `project` field, which returns the Project object
    that owns the source. It also contains a `child_items` field, which returns the associated items for a source.
    - The table also has a uniqueness constraint to ensure that, within a given project, there will be no more than one
    instance of any given URL.
    - The model contains insert, update, delete, format_short, and format_long helper functions.
- `items` table:
    - Represents Item objects
    - Contains an `id` (primary key), the items associated `source_id`, `content` (the note or highlight), `x_position`
    and `y_position`, `parent_project` (a foreign key that refers to the `projects` table), and `cluster_id` (another 
    foreign key that refers to the `clusters` table).
    - Through SQLAlchemy, the Item object also contains a `source` field, which returns the Source object that is 
    associated with the Item.

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

To run tests and obtain the code coverage, run the following command:
```bash
coverage run --source=./app/main manage.py test
```
Results can be found after running `coverage html` and opening `./htmlcov/index.html` in the browser.

A [Postman collection](./knolist.postman_collection.json) with a valid JWT is also included to facilitate testing the 
endpoints. The collection doesn't have any tests, since those are done through unittest.
The [setup.sh](./setup.sh) file contains two valid JWTs for local testing, as well.

## Running the frontend
After installing the frontend dependencies, run `npm start` from the `frontend` folder. The frontend will
be accessible at `http://localhost:3000`.

To create a build that can be accessed from the main Python server, run `npm run build`, then visit `http://localhost:5000`
(with the backend running).
