import json

from flask import request, abort, jsonify
import justext
import requests

from ..models.models import Project, Source
from ..auth import requires_auth, AuthError

def get_title(html):
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title

def extract_content_from_url(url):
    try:
        response = requests.get(url)
    except Exception:
        abort(422)
    else:
        paragraphs = justext.justext(response.content, justext.get_stoplist("English"))
        real_text = ""

        for paragraph in paragraphs:
            if not paragraph.is_boilerplate:
                real_text += paragraph.text
                real_text += "\n\n"

        return {
            'content': real_text,
            'title': get_title(response.content)
        }

def get_authorized_source(user_id, source_id):
    source = Source.query.get(source_id)
    if source is None:
        abort(404)

    if source.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return source

def set_source_routes(app):
    """
    Gets all the sources of a given project.
    """
    @app.route('/projects/<int:project_id>/sources')
    @requires_auth('read:sources')
    def get_project_sources(user_id, project_id):
        project = Project.query.get(project_id)
        if project is None:
            abort(404)

        if project.user_id != user_id:
            raise AuthError({
                'code': 'invalid_user',
                'description': 'This item does not belong to the requesting user.'
            }, 403)

        return jsonify({
            'success': True,
            'sources': [source.format_short() for source in project.sources]
        })

    """
    Creates a new source inside an existing project. The necessary data is passed as a JSON body.
    """
    @app.route('/projects/<int:project_id>/sources', methods=['POST'])
    @requires_auth('create:sources')
    def create_source(user_id, project_id):
        project = Project.query.get(project_id)
        if project is None:
            abort(404)

        if project.user_id != user_id:
            raise AuthError({
                'code': 'invalid_user',
                'description': 'This item does not belong to the requesting user.'
            }, 403)

        body = request.get_json()
        if body is None:
            abort(400)

        url = body.get('url', None)
        if url is None:
            abort(400)

        # Check if source already exists
        existing_source = Source.query.filter(Source.url == url, Source.project_id == project_id).first()
        if existing_source is not None:
            return jsonify({
                'success': True,
                'id': existing_source.id
            })  ## Status code 200 to represent that no new object was created

        # Extract content to create source object
        extraction_results = extract_content_from_url(url)
        content = extraction_results['content']
        title = extraction_results['title']

        source = Source(url=url, title=title, content=content, project_id=project.id)
        source.insert()

        return jsonify({
            'success': True,
            'id': source.id
        }), 201

    """
    Reads the detailed information of a specific source.
    """
    @app.route('/sources/<int:source_id>')
    @requires_auth('read:sources-detail')
    def get_source_detail(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        return jsonify({
            'success': True,
            'id': source_id,
            'source': source.format_long()
        })

    """
    Deletes a source.
    """
    @app.route('/sources/<int:source_id>', methods=['DELETE'])
    @requires_auth('delete:sources')
    def delete_source(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        source.delete()

        return jsonify({
            'success': True,
            'deleted': source_id
        })

    """
    Updates information in a source. The information to be updated is passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>', methods=['PATCH'])
    @requires_auth('update:sources')
    def update_source(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        # Obtain the simple attributes
        title = body.get('title', None)
        content = body.get('content', None)
        x_position = body.get('x_position', None)
        y_position = body.get('y_position', None)
        # Obtain JSON list attributes
        highlights = body.get('highlights', None)
        notes = body.get('notes', None)
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if highlights is not None and type(highlights) is not list:
            abort(422)
        if notes is not None and type(notes) is not list:
            abort(422)
        if project_id is not None:
            project = Project.query.get(project_id)
            if project is None:
                abort(422)
            if project.user_id != user_id:
                raise AuthError({
                    'code': 'invalid_user',
                    'description': 'This item does not belong to the requesting user.'
                }, 403)

        # Update values that are not None
        source.title = title if title is not None else source.title
        source.content = content if content is not None else source.content
        source.x_position = x_position if x_position is not None else source.x_position
        source.y_position = y_position if y_position is not None else source.y_position
        source.highlights = json.dumps(highlights) if highlights is not None else source.highlights
        source.notes = json.dumps(notes) if notes is not None else source.notes
        source.project_id = project_id if project_id is not None else source.project_id

        source.update()

        return jsonify({
            'success': True,
            'source_id': source_id
        })

    """
    Adds a new highlight to a source's highlights. The highlight is passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>/highlights', methods=['POST'])
    @requires_auth('create:highlights')
    def create_highlights(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        highlight = body.get('highlight', None)
        if highlight is None:
            abort(400)

        highlights_list = json.loads(source.highlights)
        highlights_list.append(highlight)
        source.highlights = json.dumps(highlights_list)
        source.update()

        return jsonify({
            'success': True,
            'id': source_id,
            'highlights': highlights_list
        })

    """
    Deletes one or more highlights from a source. Highlights to be deleted are passed as a list of indices 
    in a JSON body.
    """
    @app.route('/sources/<int:source_id>/highlights', methods=['DELETE'])
    @requires_auth('delete:highlights')
    def delete_highlights(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        indices_to_delete = body.get('delete', None)
        if indices_to_delete is None or type(indices_to_delete) is not list:
            abort(400)

        highlights_list = json.loads(source.highlights)
        highlights_list = [v for i, v in enumerate(highlights_list) if i not in indices_to_delete]
        source.highlights = json.dumps(highlights_list)
        source.update()

        return jsonify({
            'success': True,
            'id': source_id,
            'highlights': highlights_list
        })

    """
    Adds a new note to a source's notes. The note is passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>/notes', methods=['POST'])
    @requires_auth('create:notes')
    def create_notes(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        note = body.get('note', None)
        if note is None:
            abort(400)

        notes_list = json.loads(source.notes)
        notes_list.append(note)
        source.notes = json.dumps(notes_list)
        source.update()

        return jsonify({
            'success': True,
            'id': source_id,
            'notes': notes_list
        })

    """
    Deletes one or more notes from a source. Notes to be deleted are passed as a list of indices 
    in a JSON body.
    """
    @app.route('/sources/<int:source_id>/notes', methods=['DELETE'])
    @requires_auth('delete:notes')
    def delete_notes(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        indices_to_delete = body.get('delete', None)
        if indices_to_delete is None or type(indices_to_delete) is not list:
            abort(400)

        notes_list = json.loads(source.notes)
        notes_list = [v for i, v in enumerate(notes_list) if i not in indices_to_delete]
        source.notes = json.dumps(notes_list)
        source.update()

        return jsonify({
            'success': True,
            'id': source_id,
            'notes': notes_list
        })