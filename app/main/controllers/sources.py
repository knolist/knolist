import json

from flask import request, abort, jsonify
from sqlalchemy import String, VARCHAR
from flask_sqlalchemy import SQLAlchemy

from ..models.models import Project, Source, Item
from ..auth import requires_auth, AuthError


def get_authorized_source(user_id, source_id):
    source = Source.query.get(source_id)
    if source is None:
        abort(404)

    if (source.project.user_id != user_id) \
            and (user_id not in source.project.shared_users):
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
        if content is not None and type(content) is not str:
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

        source.update()

        return jsonify({
            'success': True,
            'source': source.format_long()
        })
