from flask import request, abort, jsonify
from datetime import datetime

from app.main.auth.get_authorized_objects \
    import get_authorized_item, get_authorized_cluster
from .projects import get_authorized_project, create_and_insert_source
from ..models.models import Project, Source, Item
from ..auth import requires_auth, AuthError


def create_and_insert_item(content, is_note, source_id, parent_project=None,
                           parent_cluster=None, x=None, y=None):
    item = Item(source_id=source_id, is_note=is_note,
                content=content, parent_cluster=parent_cluster,
                parent_project=parent_project, x_position=x, y_position=y)
    item.date_of_creation = datetime.utcnow()
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
        parent_project = body.get('parent_project', None)
        x = body.get('x_position', None)
        y = body.get('y_position', None)
        is_note = body.get('is_note', None)
        parent_cluster = body.get('cluster_id', None)

        if parent_cluster is None and parent_project is None:
            # Need at least one of them
            abort(400)

        # Find root project if we are adding to a cluster
        if parent_project is None:
            cluster = get_authorized_cluster(user_id, parent_cluster)
            temp_cluster = cluster
            while temp_cluster.project_id is None:
                temp_cluster = temp_cluster.parent_cluster
            parent_project = temp_cluster.project_id

        get_authorized_project(user_id, parent_project)

        if url is None and content is None:
            # Neither url nor content, so abort
            abort(400)
        if url is None and not is_note:
            # Highlight without url is not allowed
            abort(400)
        if is_note and content is None:
            # Note without content
            abort(400)
        # Referenced source is by default None
        source_id_temp = None
        # Check if source already exists in sources table
        temp_filter = Source.query.filter(Source.url == url,
                                          Source.project_id == parent_project)
        existing_source = temp_filter.first()
        if existing_source is not None:
            # Refer source_id to existing source
            source_id_temp = existing_source.id
        elif url is not None and existing_source is None:
            # Create new source for item
            source = create_and_insert_source(url, parent_project)
            source_id_temp = source.id
        elif url is None and is_note is True:
            # Regular Note
            source_id_temp = None

        # Add item
        if parent_cluster is None:
            item = create_and_insert_item(content, is_note, source_id_temp,
                                          parent_project, None, x, y)
        else:
            item = create_and_insert_item(content, is_note, source_id_temp,
                                          None, parent_cluster, x, y)

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
        item_source = item.source
        item.delete()
        if item_source and len(item_source.child_items) == 0:
            item_source.update()
            item_source.delete()
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
        parent_project = body.get('parent_project', None)

        # Verify that at least one parameter was passed
        cond_1 = is_note is None and content is None
        cond_2 = x_position is None and y_position is None
        cond_3 = source_id is None and parent_project is None and title is None
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

        if parent_project is not None:
            project = Project.query.get(parent_project)
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
        item.content = content if content is not None else item.content
        # TODO: fix this (maybe we don't need title anymore? Since items don't really have titles)
        if item.source is not None:
            item.source.title = title if title is not None else item.source.title
        item.x_position = x_position if x_position \
                                        is not None else item.x_position
        item.y_position = y_position if y_position \
                                        is not None else item.y_position
        item.parent_project = parent_project if parent_project \
                                                is not None else item.parent_project

        item.update()

        return jsonify({
            'success': True,
            'item': item.format()
        })
