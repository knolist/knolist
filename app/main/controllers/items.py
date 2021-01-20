import json

from flask import request, abort, jsonify
from sqlalchemy import String, Boolean

from .projects import get_authorized_project, create_and_insert_source
from ..models.models import Project, Source, Item
from ..auth import requires_auth, AuthError


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


def create_and_insert_item(content, is_note, project_id,
                           source_id, x=None, y=None):
    item = Item(source_id=source_id, is_note=is_note,
                content=content, x_position=x,
                project_id=project_id, y_position=y)
    item.insert()

    return item


def set_item_routes(app):
    """
    Creates a new item inside an existing project.
    The necessary data is passed as a JSON body.
    """

    @app.route('/items', methods=['POST'])
    @requires_auth('create:items')
    def create_item(user_id):

        body = request.get_json()
        if body is None:
            abort(400)

        url = body.get('url', None)
        content = body.get('content', None)
        project_id = body.get('project_id', None)
        x = body.get('x_position', None)
        y = body.get('y_position', None)
        is_note = body.get('is_note', None)
        get_authorized_project(user_id, project_id)

        if url is None and content is None:
            # Neither url nor content, so abort
            abort(400)
        if url is None and is_note is False:
            # Highlight without url is not allowed
            abort(400)
        # Referenced source is by default None
        source_id_temp = None
        # Check if source already exists in sources table
        temp_filter = Source.query.filter(Source.url == url,
                                          Source.project_id == project_id)
        existing_source = temp_filter.first()
        if existing_source is not None:
            # Refer source_id to existing source
            source_id_temp = existing_source.id
        elif url is not None and existing_source is None:
            # Create new source for item
            source = create_and_insert_source(url, project_id, x, y)
            source_id_temp = source.id
        elif url is None and is_note is True:
            # Regular Note
            source_id_temp = None
        item = create_and_insert_item(content, is_note,
                                      project_id, source_id_temp, x, y)
        return jsonify({
            'success': True,
            'item': item.format()
        }), 201

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
    Updates the information in an item.
    The information to be updated is passed in a JSON body.
    """

    @app.route('/items/<int:item_id>', methods=['PATCH'])
    @requires_auth('update:items')
    def update_item(user_id, item_id):
        item = get_authorized_item(user_id, item_id)

        body = request.get_json()
        if body is None:
            abort(400)

        # Obtain the simple attributes
        is_note = body.get('is_note', None)
        content = body.get('content', None)
        x_position = body.get('x_position', None)
        y_position = body.get('y_position', None)
        title = body.get('title', None)
        # Obtain source id
        source_id = body.get('source_id', None)
        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = is_note is None and content is None
        cond_2 = x_position is None and y_position is None
        cond_3 = source_id is None and project_id is None and title is None
        if cond_1 and cond_2 and cond_3:
            abort(400)

        # Verify that parameters are correctly formatted
        if x_position is not None and type(x_position) is not int:
            abort(422)
        if y_position is not None and type(y_position) is not int:
            abort(422)
        if content is not None and type(content) is not str:
            abort(422)
        if is_note is not None and type(is_note) is not bool:
            abort(422)
        if title is not None and type(title) is not str:
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
        item.content = content if content \
                                  is not None else item.content
        if item.source:
            item.source.title = title if title is not None else item.source.title
        item.x_position = x_position if x_position \
                                        is not None else item.x_position
        item.y_position = y_position if y_position \
                                        is not None else item.y_position
        item.project_id = project_id if project_id \
                                        is not None else item.project_id

        item.update()

        return jsonify({
            'success': True,
            'item': item.format()
        })
