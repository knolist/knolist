import json

from flask import request, abort, jsonify

from ..models.models import Project, Source
from ..auth import requires_auth, AuthError
from datetime import datetime


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
    Reads the detailed information of a specific source.
    """
    @app.route('/sources/<int:source_id>')
    @requires_auth('read:sources-detail')
    def get_source_detail(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        return jsonify({
            'success': True,
            'source': source.format()
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
    Gets a source by URL.
    """
    @app.route('/sources')
    @requires_auth('read:sources-detail')
    def get_source_by_url(user_id):
        body = request.get_json()
        by_url = body.get('url', None)
        if not by_url:
            abort(400)
        if type(by_url) is not str:
            abort(422)
        final_source = Source.query.filter(Source.url == by_url).first()
        if final_source is None:
            abort(404)
        return jsonify({
            'success': True,
            'source': final_source.format()
        })
    """
    Updates information in a source.
    The information to be updated is passed in a JSON body.
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
        is_included = body.get('is_included', None)
        author = body.get('author', None)
        published_date = body.get('published_date', None)
        access_date = body.get('access_date', None)
        site_name = body.get('site_name', None)

        # Obtain JSON list attributes
        highlights = body.get('highlights', None)
        notes = body.get('notes', None)
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = title is None and content is None
        cond_2 = x_position is None and y_position is None
        cond_3 = highlights is None and notes is None and project_id is None
        cond_4 = is_included is None
        cond_5 = published_date is None and access_date is None
        cond_6 = site_name is None and author is None
        if cond_1 and cond_2 and cond_3 and cond_4 and cond_5 and cond_6:
            abort(400)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if highlights is not None and type(highlights) is not list:
            abort(422)
        if notes is not None and type(notes) is not list:
            abort(422)
        if is_included is not None and type(is_included) is not bool:
            abort(422)
        if author is not None and type(author) is not str:
            abort(422)
        if site_name is not None and type(site_name) is not str:
            abort(422)
        if published_date is not None and type(published_date) is not str:
            abort(422)
        if access_date is not None and type(access_date) is not str:
            abort(422)
        if project_id is not None:
            project = Project.query.get(project_id)
            if project is None:
                abort(422)
            if project.user_id != user_id:
                raise AuthError({
                    'code': 'invalid_user',
                    'description':
                        'This item does not belong to the requesting user.'
                }, 403)
            for existing_source in project.sources:
                if existing_source.url == source.url:
                    # Can't have two sources with the same URL in one project
                    abort(422)

        # Update values that are not None
        source.title = title if title is not None else source.title
        source.content = content if content is not None else source.content
        source.project_id = project_id if project_id is not None \
            else source.project_id

        source.is_included = is_included if is_included is not None else source.is_included
        source.author = author if author is not None else source.author
        source.site_name = site_name if site_name is not None else source.site_name
        fmt = '%a, %d %b %Y %H:%M:%S %z'
        source.published_date = datetime.strptime(published_date, fmt)\
            if published_date is not None else source.published_date
        source.access_date = datetime.strptime(access_date, fmt)\
            if access_date is not None else source.access_date
        
        source.update()

        return jsonify({
            'success': True,
            'source': source.format()
        })

    """
    Adds a new highlight to a source's highlights.
    The highlight is passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>/highlights', methods=['POST'])
    @requires_auth('create:highlights')
    def add_highlights(user_id, source_id):
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
            'source': source.format()
        }), 201

    """
    Deletes one or more highlights from a source.
    Highlights to be deleted are passed as a list of indices in a JSON body.
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
        highlights_list = [v for i, v in enumerate(highlights_list)
                           if i not in indices_to_delete]
        source.highlights = json.dumps(highlights_list)
        source.update()

        return jsonify({
            'success': True,
            'source': source.format()
        })

    """
    Adds a new note to a source's notes. The note is passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>/notes', methods=['POST'])
    @requires_auth('create:notes')
    def add_notes(user_id, source_id):
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
            'source': source.format()
        }), 201

    """
    Deletes one or more notes from a source.
    Notes to be deleted are passed as a list of indices in a JSON body.
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
        notes_list = [v for i, v in enumerate(notes_list)
                      if i not in indices_to_delete]
        source.notes = json.dumps(notes_list)
        source.update()

        return jsonify({
            'success': True,
            'source': source.format()
        })

    """
    Updates the content of one of a source's notes.
    The note ID and new content are passed in a JSON body.
    """
    @app.route('/sources/<int:source_id>/notes', methods=['PATCH'])
    @requires_auth('update:notes')
    def update_note(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        body = request.get_json()
        if body is None:
            abort(400)

        # Get parameters
        note_index = body.get('note_index', None)
        new_content = body.get('new_content', None)
        if note_index is None or new_content is None:
            abort(400)

        # Verify that the index is valid
        # (int, non-negative, and less than the length of notes_list)
        notes_list = json.loads(source.notes)
        if type(note_index) is not int or note_index < 0 \
                or note_index >= len(notes_list):
            abort(422)

        # Update the content
        notes_list[note_index] = new_content
        source.notes = json.dumps(notes_list)
        source.update()

        return jsonify({
            'success': True,
            'source': source.format()
        })
