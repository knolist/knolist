from flask import request, abort, jsonify
from justext import justext, get_stoplist
from requests import get as requests_get

from app.main.auth.get_authorized_objects import get_authorized_project
from app.main.helpers.url_to_citation import url_to_citation
from app.main.helpers.statistics import compute_cluster_stats, \
    compute_source_dist
from ..models.models import Project, Source, Item
from ..auth import requires_auth
from datetime import datetime


def get_title(html):
    """
    Gets title of project
    """
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title


def update_project_access_date(project):
    """
    Update the most recent access date of project
    """
    project.recent_access_date = datetime.utcnow()
    project.update()


def extract_content_from_url(url):
    """
    Extracts all content from a url
    """
    try:
        response = requests_get(url)
    except Exception:
        abort(422)
    else:
        paragraphs = justext(response.content, get_stoplist("English"))
        real_text = ""

        for paragraph in paragraphs:
            real_text += paragraph.text
            real_text += "\n\n"

        return {
            'content': real_text,
            'title': get_title(response.content)
        }


def create_and_insert_source(url, project_id):
    """
    Helper to create and insert a source
    """
    extraction_results = extract_content_from_url(url)
    content = extraction_results['content']
    citation_fields = url_to_citation(url)
    title = citation_fields['title']
    author = citation_fields['author']
    published_date = citation_fields['publish_date']
    site_name = citation_fields['site_name']
    access_date = citation_fields['access_date']

    source = Source(url=url, title=title,
                    content=content, project_id=project_id, is_included=True,
                    author=author, published_date=published_date,
                    site_name=site_name, access_date=access_date)
    source.insert()

    return source


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
        description = body.get('description', None)
        if title is None:
            abort(400)

        project = Project(title, description, user_id)
        project.creation_date = datetime.utcnow()
        project.recent_access_date = datetime.utcnow()
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
        new_description = body.get('description', None)
        if new_title is None and new_description is None:
            abort(400)

        project.title = new_title if new_title is not None else project.title
        project.description = new_description if new_description is not None \
            else project.description
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
        filter_query = request.args.getlist('filter', None)
        if not filter_query:
            results = Source.query.filter(Source.project_id == project_id) \
                .filter(Source.url.ilike(pattern)
                        | Source.title.ilike(pattern)
                        | Source.content
                        .ilike(pattern)).order_by(Source.id).all()
            return jsonify({
                'success': True,
                'sources': [source.format() for source in results]
            })

        results = []
        for filter_type in filter_query:
            temp = Source.query.filter(Source.project_id == project_id) \
                .filter(getattr(Source, filter_type)
                        .ilike(pattern)).order_by(Source.id).all()
            for sources in temp:
                if sources not in results:
                    results.append(sources)
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
        update_project_access_date(project)

        search_query = request.args.get('query', None)
        if search_query is None:
            # Returns all items
            return jsonify({
                'success': True,
                'items': [i.format() for i in project.items]
            })

        pattern = '%' + search_query + '%'
        filter_query = request.args.getlist('filter', None)
        if not filter_query:
            results = Item.query.join(Source)\
                .filter(Item.parent_project == project_id) \
                .filter(Source.url.ilike(pattern)
                        | Source.title.ilike(pattern)
                        | Source.content.ilike(pattern)
                        | Item.content.ilike(pattern)).order_by(Item.id).all()
            return jsonify({
                'success': True,
                'items': [i.format() for i in results]
            })

        results = []
        for filter_type in filter_query:
            if filter_type == 'notes' or filter_type == 'highlights':
                temp = Item.query.filter(Item.parent_project == project_id) \
                    .filter(Item.content
                            .ilike(pattern)).order_by(Item.id).all()
            else:
                temp = Item.query.join(Source)\
                    .filter(Item.parent_project == project_id) \
                    .filter(getattr(Source, filter_type)
                            .ilike(pattern)).order_by(Item.id).all()
            for item in temp:
                if item not in results:
                    results.append(item)
        return jsonify({
            'success': True,
            'items': [i.format() for i in results]
        })

    """
    Gets a collection of stats relevant to a specific project.
    No additional parameters are required.
    Statistics are computed on each endpoint call, and
    thus will be recomputed on successive GETs.
    """

    @app.route('/projects/<int:project_id>/statistics')
    @requires_auth('read:projects')
    def get_project_statistics(user_id, project_id):
        project = get_authorized_project(user_id, project_id)
        if (len(project.clusters) == 0):
            max_depth = 0
            n_clusters = 0
            sum_item_depth = 0
        else:
            # Get statistics through tree traversal
            # Note: n_items is stored and returned for future purposes
            # If at any point all items will not be stored at the project
            # leve, n_items can be returned.
            max_depth, n_items, n_clusters, \
                sum_item_depth = compute_cluster_stats(
                    project.clusters, depth=0,
                    n_items=len(project.items), n_clusters=0,
                    sum_item_depth=0)
        # Compute URL breakdown from helper method
        url_breakdown = compute_source_dist(project.sources)

        return jsonify({
            'success': True,
            'num_sources': len(project.sources),
            'num_items': len(project.items),
            'num_clusters': n_clusters,
            'avg_depth_per_item': sum_item_depth / len(project.items),
            'max_depth': max_depth,
            'num_notes': len([i for i in project.items if i.is_note]),
            'date_created': project.creation_date,
            'date_accessed': project.recent_access_date,
            'url_breakdown': url_breakdown
        }), 200

    '''
    Gets all clusters within a project.
    '''

    @app.route('/projects/<int:project_id>/clusters')
    @requires_auth('read:clusters')
    def get_clusters(user_id, project_id):
        # Will only get the top level clusters associated with the project
        # project = Project.query.filter(Project.user_id == user_id,
        #                                Project.id == project_id).first()
        project = get_authorized_project(user_id, project_id)
        clusters = project.clusters

        return jsonify({
            'success': True,
            'clusters': [cluster.format() for cluster in clusters]
        })
