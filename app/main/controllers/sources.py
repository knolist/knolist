import json

from flask import request, abort, jsonify
from sqlalchemy import String, BOOLEAN

from ..models.models import Project, Source, Item
from ..auth import requires_auth, AuthError


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


def get_authorized_item(user_id, item_id):
    item = Item.query.get(item_id)
    if item is None:
        abort(404)

    if item.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user'
        }, 403)

    return item


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
            'source': source.format_long()
        })

    """
    Reads the detailed information of a specific item.
    """

    @app.route('/items/<int:item_id>')
    @requires_auth('read:items-detail')
    def get_item_detail(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        return jsonify({
            'success': True,
            'item': item.format()
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
    Deletes an item
    """

    @app.route('/items/<int:item_id>', methods=['DELETE'])
    @requires_auth('delete:items')
    def delete_item(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        item.delete()

        return jsonify({
            'success': True,
            'deleted': item_id
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
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = title is None and content is None
        cond_2 = x_position is None and y_position is None
        cond_3 = project_id is None
        if cond_1 and cond_2 and cond_3:
            abort(400)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if content is not None and type(content) is not String:
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
        source.x_position = x_position if x_position is not None \
            else source.x_position
        source.y_position = y_position if y_position is not None \
            else source.y_position
        source.project_id = project_id if project_id is not None \
            else source.project_id

        source.update()

        return jsonify({
            'success': True,
            'source': source.format_long()
        })


    """
    Updates the information in an item.
    The information to be updated is passed in a JSON body.
    """

    @app.route('/item/<int:item_id>', methods=['PATCH'])
    @requires_auth('update:items')
    def update_item(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        body = request.get_json()
        if body is None:
            abort(400)

        # Obtain the simple attributes
        is_note = body.get('is_note', None)
        is_highlight = body.get('is_highlight', None)
        content = body.get('content', None)
        x_position = body.get('x_position', None)
        y_position = body.get('y_position', None)
        # Obtain source id
        source_id = body.get('source_id', None)
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = is_note is None and is_highlight is None
        cond_2 = content is None and x_position is None
        cond_3 = y_position is None and source_id is None and project_id is None
        if cond_1 and cond_2 and cond_3:
            abort(400)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if content is not None and type(content) is not String:
            abort(422)
        if is_note is not None and type(is_note) is not BOOLEAN:
            abort(422)
        if is_highlight is not None and type(is_highlight) is not BOOLEAN:
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

        # Update values that are not None
        item.source_id = source_id if source_id is not None else item.source_id
        item.is_note = is_note if is_note is not None else item.is_note
        item.is_highlight = is_highlight if is_highlight is not None else item.is_highlight
        item.content = content if content is not None else item.content
        item.x_position = x_position if x_position is not None else item.x_position
        item.y_position = y_position if y_position is not None else item.y_position
        item.parent_project = project_id if project_id is not None else item.parent_project

        item.update()

        return jsonify({
            'success': True,
            'source': item.format()
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
            'source': source.format_long()
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
            'source': source.format_long()
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
            'source': source.format_long()
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
            'source': source.format_long()
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
            'source': source.format_long()
        })
