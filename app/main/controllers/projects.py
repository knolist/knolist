from flask import request, abort, jsonify
from justext import justext, get_stoplist
from requests import get as requests_get
from sqlalchemy import String

from ..models.models import Project, Source, Item, Cluster
from ..auth import requires_auth, AuthError


def get_title(html):
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title


def extract_content_from_url(url):
    try:
        response = requests_get(url)
    except Exception:
        abort(422)
    else:
        paragraphs = justext(response.content, get_stoplist("English"))
        real_text = ""

        for paragraph in paragraphs:
            if not paragraph.is_boilerplate:
                real_text += paragraph.text
                real_text += "\n\n"

        return {
            'content': real_text,
            'title': get_title(response.content)
        }


def create_and_insert_source(url, project_id):
    extraction_results = extract_content_from_url(url)
    content = extraction_results['content']
    title = extraction_results['title']

    source = Source(url=url, title=title,
                    content=content, project_id=project_id)
    source.insert()

    return source


def get_authorized_project(user_id, project_id):
    project = Project.query.get(project_id)
    if project is None:
        abort(404)

    if project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return project


def set_project_routes(app):
    """
    Returns a list of all projects in the database.
    """

    @app.route('/projects')
    @requires_auth('read:projects')
    def get_projects(user_id):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        projects = temp_filter.order_by(Project.id).all()

        return jsonify({
            'success': True,
            'projects': [project.format() for project in projects]
        })

    """
    Creates a new project. Data is passed as a JSON argument.
    Returns information about the new project.
    """

    @app.route('/projects', methods=['POST'])
    @requires_auth('create:projects')
    def create_project(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        title = body.get('title', None)
        if title is None:
            abort(400)

        project = Project(title, user_id)
        project.insert()

        return jsonify({
            'success': True,
            'project': project.format()
        }), 201

    """
    Updates the title of a project. New title is passed as a JSON body.
    Returns the id and updated title of the project
    """

    @app.route('/projects/<int:project_id>', methods=['PATCH'])
    @requires_auth('update:projects')
    def update_project(user_id, project_id):
        project = get_authorized_project(user_id, project_id)

        body = request.get_json()
        if body is None:
            abort(400)

        new_title = body.get('title', None)
        if new_title is None:
            abort(400)

        project.title = new_title
        project.update()

        return jsonify({
            'success': True,
            'project': project.format()
        })

    """
    Deletes a project given the project ID.
    Returns the id of the deleted project.
    """
    @app.route('/projects/<int:project_id>', methods=['DELETE'])
    @requires_auth('delete:projects')
    def delete_project(user_id, project_id):
        project = get_authorized_project(user_id, project_id)

        project.delete()

        return jsonify({
            'success': True,
            'deleted': project_id
        })

    """
    Gets all the sources of a given project
    or searches through them if a search query is passed.
    Search looks at all text fields of a source.
    """
    @app.route('/projects/<int:project_id>/sources')
    @requires_auth('read:sources')
    def get_project_sources(user_id, project_id):
        project = get_authorized_project(user_id, project_id)

        search_query = request.args.get('query', None)
        if search_query is None:
            # Returns all sources
            return jsonify({
                'success': True,
                'sources': [s.format() for s in project.sources]
            })

        pattern = '%' + search_query + '%'
        results = Source.query.filter(Source.project_id == project_id) \
            .filter(Source.url.ilike(pattern)
                    | Source.title.ilike(pattern)
                    | Source.content.ilike(pattern)).order_by(Source.id).all()

        return jsonify({
            'success': True,
            'sources': [source.format() for source in results]
        })

    """
    Gets all the items of a given project
    or searches through them if a search query is passed.
    Search looks at all text fields of a source.
    """
    @app.route('/projects/<int:project_id>/items')
    @requires_auth('read:items')
    def get_project_items(user_id, project_id):
        project = get_authorized_project(user_id, project_id)

        search_query = request.args.get('query', None)
        if search_query is None:
            # Returns all items
            return jsonify({
                'success': True,
                'items': [i.format() for i in project.items]
            })

        pattern = '%' + search_query + '%'
        results = Item.query.filter(Item.project_id == project_id) \
            .filter(Item.source.url.ilike(pattern)
                    | Item.source.title.ilike(pattern)
                    | Item.source.content.ilike(pattern)
                    | Item.content.ilike(pattern)).\
            order_by(Item.source.id).all()

        return jsonify({
            'success': True,
            'items': [item.format() for item in results]
        })

    """
    Adds a new connection to a project.
    The parameters are from_url and to_url, the two URLs to be connected.
    The parameters are passed in a JSON body.
    If any of the URLs is not a source in the project,
    a source is first created.
    """

    @app.route('/projects/<int:project_id>/connections', methods=['POST'])
    @requires_auth('create:connections')
    def create_connection_from_urls(user_id, project_id):
        get_authorized_project(user_id, project_id)

        body = request.get_json()
        if body is None:
            abort(400)

        from_url = body.get('from_url', None)
        to_url = body.get('to_url', None)
        if from_url is None or to_url is None:
            abort(400)

        # Get sources and create them if necessary
        from_source = Source.query.filter(Source.project_id == project_id,
                                          Source.url == from_url).first()
        to_source = Source.query.filter(Source.project_id == project_id,
                                        Source.url == to_url).first()

        if from_source is None:
            from_source = create_and_insert_source(from_url, project_id)
        if to_source is None:
            to_source = create_and_insert_source(to_url, project_id)

        # Only add connection if it doesn't exist
        status_code = 200
        if to_source not in from_source.next_sources:
            from_source.next_sources.append(to_source)
            from_source.update()
            # Set status_code to 201 to indicate new connection created
            status_code = 201

        return jsonify({
            'success': True,
            'from_source': from_source.format(),
            'to_source': to_source.format()
        }), status_code

    '''
    
    Gets all clusters within a project.
    '''
    @app.route('/projects/<int:project_id>/clusters')
    @requires_auth('read:clusters')
    def get_clusters(user_id, project_id):
        # Will only get the top level clusters associated with the project
        project = Project.query.filter(Project.user_id == user_id,
                                        Project.id==project_id).first()
        clusters = project.clusters
        return jsonify({
            'success': True,
            'clusters': [cluster.format() for cluster in clusters]
        })