from flask import request, abort, jsonify

from app.main.auth.get_authorized_objects import get_authorized_source
from ..models.models import Project, Source
from ..auth import requires_auth, AuthError
from datetime import datetime


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
    Gets all items of a specific source
    """
    @app.route('/sources/<int:source_id>/items')
    @requires_auth('read:sources-detail')
    def get_source_items(user_id, source_id):
        source = get_authorized_source(user_id, source_id)

        return jsonify({
            'success': True,
            'items': [i.format() for i in source.child_items]
        }), 200

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
        is_included = body.get('is_included', None)
        author = body.get('author', None)
        published_date = body.get('published_date', None)
        access_date = body.get('access_date', None)
        site_name = body.get('site_name', None)

        # Obtain project ID
        project_id = body.get('project_id', None)

        # Verify that at least one parameter was passed
        cond_1 = title is None and content is None
        cond_2 = x_position is None and y_position is None
        cond_3 = project_id is None
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
        if content is not None and type(content) is not str:
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

        source.is_included = is_included if is_included is not None \
            else source.is_included
        source.author = author if author is not None else source.author
        source.site_name = site_name if site_name is not None \
            else source.site_name
        if published_date:
            published_date = published_date[0:10]
        if access_date:
            access_date = access_date[0:10]
        fmt = '%Y-%m-%d'
        source.published_date = datetime.strptime(published_date, fmt)\
            if published_date is not None else source.published_date
        source.access_date = datetime.strptime(access_date, fmt)\
            if access_date is not None else source.access_date

        source.update()

        return jsonify({
            'success': True,
            'source': source.format()
        })
