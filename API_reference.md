# Knolist API Reference
## Getting Started
- Base URL: `https://app.knolist.com` (Note: when runing locally, the base URL is `localhost:5000`)
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
    - "shared_users": the project's shared users
- A `short source` is an object that contains the following keys:
    - "id": the source's ID in the database
    - "url": the URL of the source
    - "title": the title of the source
    - "x_position" and "y_position": the x and y positions of the source (positions in a graph)
    - "next_sources" and "previous_sources": two lists of source IDs that represent the sources connected to the 
    current source. "next_sources" contains sources that are children of the current source, while "prev_sources" 
    contains parent sources
    - "project_id": the ID of the project where the current source belongs
- An `item` is an object that contains the following keys:
    - "id": the item's ID in the database
    - "url": the URL of the source, if it has one
    - "title": the title of the source, if it has one
    - "parent_project": a foreign key to the project that the item is associacted with  
    - "is_note": a boolean to tell if an item has a note or not
    - "content": the content of the item, which is either a note or a highlight
    - "x_position" and "y_position": the x and y positions of the item(positions in a graph)
 
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
            "title": "New Project",
            "shared_users": 2
        },
        {
            "id": 2,
            "title": "New Project 2",
            "shared_users": 1
        }
    ],
    "success": true
}
```

### POST '/projects'
- Creates a new project for the requesting user.
- Request arguments (passed as JSON body):
    - `string` "title": The title of the new project *(Required)*
    - `string` "description": The description of the new project *(Optional)*
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
    "title": "New Project",
    "shared_users": 2
  },
  "success": true
}

```

### PATCH '/projects/{project_id}'
- Updates the title of an existing project given its ID.
- Request arguments (passed as JSON body, at least one is required):
    - `string` "title": The new title to be applied *(Optional)*
    - `string` "description": The new description to be applied *(Optional)*
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
    "title": "Updated Title",
    "shared_users": 2
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


### GET '/projects/{project_id}/items'
- This endpoint serves two different purposes, depending on whether or not a search query is passed.
1. Get all items.
    - Fetches all the items of a given project (based on the project ID)
    - Request arguments: None
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "items": an array of `item` objects representing all the items of the project
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/items`
```
200 OK
```
```json
{
  "items": [
    {
      "id": 1,    
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",      
      "parent_project": 1,
      "title": "Robert Browning - Wikipedia",
      "content": "This is a highlight",
      "is_note": false,
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "parent_project": 1,
      "title": "My Last Duchess - Wikipedia",
      "is_note": false,
      "x_position": null,
      "y_position": null
    },
    {
      "id": 4,
      "parent_project": 1,
      "is_note": true,
      "content": "This is a note",
      "url": null,
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```
2. Search through items.
    - Searches through all items of the given project. The search is case-insensitive and looks through all text 
    fields of all items (url, title, source content, and item content)
    - Request arguments:
        - `query`: a string passed as a query parameter, indicating the query to be searched *(Required)*
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "items": an array of `item` objects representing all the items in the project
         that contain the given query
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/items?query=Browning`
```
200 OK
```
```json
{
  "items": [
    {
      "id": 1,    
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",      
      "parent_project": 1,
      "title": "Robert Browning - Wikipedia",
      "content": "This is a highlight",
      "is_note": false,
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "parent_project": 1,
      "title": "My Last Duchess - Wikipedia",
      "is_note": false,
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```

3. Search through specific fields of the items.
    - Searches through all items of the given project. The search is case-insensitive and looks through the
    fields of the items as specified by the user.
    - Request arguments:
        - `query`: a string passed as a query parameter, indicating the query to be searched *(Required)*
        - `filter`: a list of fields passed as a filter parameter, indicating the fields to be searched *(Required)*
    - Returns: A JSON object with the following keys:
        - "success": holds `true` if the request was successful
        - "sources": an array of `item` objects representing all the items in the project
         that contain the given query in any of the fields specified
    - Sample: `curl https://knolist-api.herokuapp.com/projects/1/items?query=Wikipedia&filter=title`
```
200 OK
```
```json
{
  "items": [
    {
      "id": 1,    
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",      
      "parent_project": 1,
      "title": "Robert Browning - Wikipedia",
      "content": "This is a highlight",
      "is_note": false,
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "parent_project": 1,
      "title": "My Last Duchess - Wikipedia",
      "is_note": false,
      "x_position": null,
      "y_position": null
    }
  ],
  "success": true
}
```

### GET '/projects/{project_id}/statistics'
- Fetches all the items of a given project (based on the project ID), given an appropriate auth_header.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "num_items", "num_notes", and "num_clusters": hold the number of that thing for this project
    - "max_depth": holds the maximum level of nested clusters in a project (no clusters = 0 depth)
    - "date_accessed", "date_created": Hold string representations project date events
    - "avg_depth_per_item": a measure of how intricate or specific a project is, is taken by summing over all items 
    the depth it is in the project
    - "url_breakdown": a json (dictionary) that maps each url in the source (defined up to the .com / .edu / etc.) and
    that url's number of occurences

    - "items": an array of `item` objects representing all the items of the project
 - Sample: `curl https://knolist-api.herokuapp.com/projects/1/statistics`
```
200 OK
```
```json
{
	"avg_depth_per_item": 0.0,
	"date_accessed": "Thu, 11 Feb 2021 19:51:18 GMT",
	"date_created": "Thu, 11 Feb 2021 19:51:18 GMT",
	"max_depth": 0,
	"num_clusters": 0,
	"num_items": 2,
	"num_notes": 0,
	"num_sources": 1,
	"success": true,
	"url_breakdown": {
        "https://test3.com": 1
	}
}
```

### GET '/projects/{project_id}/similarity'
- For a given project, compute a measure of similarity between all pairs of sources.
The diagonal entries are also included, where if the i-ith entry is 0, then there was no
content for that source. Additionally, a map from the source id to its index in the array
is stored. Also, please note that JS forces int indices to be strings for dictionaries, so regular
indexing / iterating may require casting
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "index": maps a integer (0 to n sources) to the source_id in the database
    - "similarity": a JSON-style upper-triangular matrix who's i-jth entry is the similarity 
    between source i and source j
 - Sample: `curl https://knolist-api.herokuapp.com/projects/1/similarity`
```
200 OK
```
```json
{
  "index": {"1": 0, "2": 1}, 
  "similarity": 
      {
        "0": {"0": 1.0}, 
        "1": {"0": 0.326, "1": 1.0}
      }, 
  "success": true
}
```

### POST 'items'
- Creates a new item and adds it to the given project (based on the ID). The item is created based on its type, checking
 that the item has at least fields URL and content (highlight or note).  If the URL is unique, a new source is created
 for the item.  If not, then the item is pointed to the existing source.  Otherwise, the note is created as its own
 node.
- If the given URL already exists in the given project, no new source is created (URLs must be unique withing a project)
If that is the case, the return status wil be 200 instead of 201, since no new source was created.
- Request arguments (passed as JSON body):
    - `string` "url": the URL of the item that will be added *(Optional)*
    - `string` "content": the note or highlight of the item that will be added *(Optional)*
    - `float` "parent_project": the item's associated project id *(Optional)*
    - `bool` "is_note": a boolean to tell whether the item has a note or not *(Required)*
    - `float` "x_position": the y position to apply to the source *(Optional)*
    - `float` "y_position": the y position to apply to the source *(Optional)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "item": an `item` object representing the newly created source (or the existing source if the URL is 
    already in the project)
- Sample: `curl https://knolist-api.herokuapp.com/projects/1/items -X POST -H "Content-Type: application/json" -d '{"url": "https://en.wikipedia.org/wiki/English_poetry"}'`
```
201 Created (or 200 OK if the URL already exists in the project)
```
```json
{
  "item": {
    "id": 1,    
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",      
    "parent_project": 1,
    "title": "Robert Browning - Wikipedia",
    "content": "This is a highlight",
    "is_note": false,
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

### GET '/sources/{source_id}/items'
- Gets all items that belong to a single source.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "items": an array of formatted items
- Sample: `curl https://knolist-api.herokuapp.com/sources/1/items`
```
{
  "items": [
    {
      "id": 1,    
      "url": "https://en.wikipedia.org/wiki/Robert_Browning",      
      "parent_project": 1,
      "title": "Robert Browning - Wikipedia",
      "content": "This is a highlight",
      "is_note": false,
      "x_position": null,
      "y_position": null
    },
    {
      "id": 2,
      "url": "https://en.wikipedia.org/wiki/My_Last_Duchess",
      "parent_project": 1,
      "title": "My Last Duchess - Wikipedia",
      "is_note": false,
      "x_position": null,
      "y_position": null
    }
  ],
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

### GET '/items/{item_id}'
- Fetches the detailed information of a specific item.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "item": an `item` object representing the requested item
- Sample: `curl https://knolist-api.herokuapp.com/items/1`
```
200 OK
```
```json
{
  "item": {
    "id": 1,
    "url": "https://en.wikipedia.org/wiki/Robert_Browning",  
    "title": "Robert Browning - Wikipedia",    
    "parent_project": 1,
    "is_note": true,
    "content": "This is a note",
    "x_position": null,
    "y_position": null
  },
  "success": true
}
```

### DELETE '/items/{item_id}'
- Deletes an item based on its ID.
- Request arguments: None
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "deleted": the ID of the item that was deleted
- Sample: `curl https://knolist-api.herokuapp.com/items/5 -X DELETE`
```
200 OK
```
```json
{
  "deleted": 5,
  "success": true
}
```

### PATCH '/items/{item_id}'
- Allows updates to most fields of the given item.
- Request arguments (passed as JSON body, at least one is required):
    - `string` "is_note": a bool that tells if an item has a note or not *(Required)*
    - `string` "content": the new note or highlight to apply to the item *(Optional)*    
    - `string` "title": the new title to apply to the source associated with the item *(Optional)*
    - `float` "x_position": the new x position to apply to the item *(Optional)*
    - `float` "y_position": the new y position to apply to the item *(Optional)*
    - `int` "parent_project": the ID of the new project that this source will belong to. It must be a valid ID of an 
    existing project. If the project already has a source with the current URL, error 422 is thrown.
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "item": an `item` object representing the item that was just updated
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


### POST '/shared_projects'
- Adds a new shared_user to the shared_users table.  The route checks to make sure that the user exists in the auth0 
database.  If the user is already a shared user or the user tries to add itself, the database does not add it.
- Request arguments (passed as a JSON body):
    - `id` "shared_proj": the id of the project to share *(Required)*
    - `string` "email": the email of the new user *(Required)*
    - `string` "role": the role of the new user *(Required)*
- Returns: A JSON body with the following keys:
    - "success": holds `true` if the request was successful
    - "project": The project returned, with the new user in the shared_users table
- Sample: `curl https://knolist-api.herokuapp.com/shared_projects -X POST -H "Content-Type: application/json" -d '{"shared_proj":1, email:"test@email.com", role: "collaborator""}'`
```
201 Created (or 200 OK if the connection between users already existed)
```
```json
{
 "project": {
    "id": 3,
    "title": "New Project",
    "shared_users": 2
  },
  "success": true
}
```

### DELETE '/shared_projects'
- Deletes an existing connection between a user and a project.
- Request arguments (passed as JSON body):
    - `int` "shared_proj": the id of the project to share *(Required)*
    - `string` "email": the email of the new user *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "project": The project returned, with the new user in the shared_users table
- Sample: `curl https://knolist-api.herokuapp.com/shared_projects -X DELETE -H "Content-Type: application/json" -d '{"shared_proj":2, "email": "test@email.com"}'`
```
200 OK
```
```json
{
 "project": {
    "id": 2,
    "title": "New Project",
    "shared_users": null
  },
  "success": true
}
```

### PATCH '/shared_projects/{project_id}'
- Updates the role of a user within a shared_users table given the project's ID.
- Request arguments (passed as JSON body):
    - `string` "role": The role of the shared_user *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "project": a `project` object that represents the updated project
- Sample: `curl https://knolist-api.herokuapp.com/shared_projects/1 -X PATCH -H "Content-Type: application/json" -d "{"role": "Updated Title"}"`
```
200 OK
```
```json
{
  "project": {
    "id": 1,
    "shared_users": 2
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

### GET '/clusters/{cluster_id}'
- Gets information about the specified cluster (location, child clusters' ids, child items' ids)
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "cluster": a `cluster` object representing the cluster that was requested
```
200 OK
```
```json
{
  "success": true,
  "cluster": {
    "id": 1,
    "name": "Test Cluster",
    "child_clusters": [
      2,
      3
    ],
    "child_items": [
      4,
      5
    ],
    "project_id": null,
    "x_position": null,
    "y_position": null
  }
}
```

### DELETE '/clusters/{cluster_id}'
- Deletes a given cluster and all 
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "deleted": a `cluster` object representing the cluster that was updated
```
200 OK
```
```json
{
  "success": true,
  "deleted": 1
}
```

### PATCH '/clusters/{cluster_id}'
- Updates properties of a given cluster.
- Request arguments (passed as JSON body, either `name` or both `x` and `y` required):
    - `string` "name": The new name of the cluster *(Optional)*
    - `int` x: The new x position of the cluster *(Optional)*
    - `int` y: The new y position of the cluster *(Optional)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "cluster": a `cluster` object representing the id of the cluster that was deleted
```
200 OK
```
```json
{
  "success": true,
  "cluster": {
    "id": 1,
    "name": "Test Cluster with New Name",
    "child_clusters": [
      2,
      3
    ],
    "child_items": [
      4,
      5
    ],
    "project_id": null,
    "x_position": null,
    "y_position": null
  }
}
```

## POST '/clusters'
- Adds a new cluster from scratch when given 2 items coming from the same cluster (no previous cluster is ok too)
- Request arguments (passed as JSON body):
    - `id` "item1_id": The id of one of the items that will be part of the cluster *(Required)*
    - `id` "item2_id": The id of the other item that will be part of the cluster *(Required)*
    - `int` "x_position": The x position of the new cluster *(Required)*
    - `int` "y_position": The y position of the new cluster *(Required)*
    - `string` "name": The name of the new cluster *(Required)*
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "cluster": a `cluster` object representing the cluster that was just created 
```
200 OK
```
```json
{
  "success": true,
  "cluster": {
    "id": 1,
    "name": "Cluster From Scratch",
    "child_clusters": [
    ],
    "child_items": [
      4,
      5
    ],
    "project_id": 10,
    "x_position": 400,
    "y_position": 300
  }
}
```

## POST '/clusters/{cluster_id}/items/{item_id}'
- Adds a new item to an existing cluster
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "cluster": a `cluster` object representing the cluster after update
```
200 OK
```
```json
{
  "success": true,
  "cluster": {
    "id": 1,
    "name": "Cluster Added To",
    "child_clusters": [
      2,
      3
    ],
    "child_items": [
      4,
      5
    ],
    "project_id": 10,
    "x_position": 400,
    "y_position": 300
  }
}
```

## DELETE '/clusters/{cluster_id}/items/{item_id}'
- Removes specified item from the cluster
- Returns: A JSON object with the following keys:
    - "success": holds `true` if the request was successful
    - "cluster": a `cluster` object representing the cluster that was updated
```
200 OK
```
```json
{
  "success": true,
  "cluster": {
    "id": 1,
    "name": "Cluster Being Removed From",
    "child_clusters": [
    ],
    "child_items": [
      4,
      5
    ],
    "project_id": 10,
    "x_position": 400,
    "y_position": 300
  }
}
```