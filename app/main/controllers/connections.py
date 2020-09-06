from flask import jsonify, abort, request

from ..auth import requires_auth
from ..models.models import Source
from .sources import get_authorized_source

def set_connection_routes(app):

    """
    Creates a connection given two existing source IDs.
    """
    @app.route('/connections', methods=['POST'])
    @requires_auth('create:connections')
    def create_connection_from_ids(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        from_id = body.get('from_id', None)
        to_id = body.get('to_id', None)

        if from_id is None or to_id is None:
            abort(400)

        from_source = get_authorized_source(user_id, from_id)
        to_source = get_authorized_source(user_id, to_id)

        # Verify that both sources belong to the same project
        if from_source.project_id != to_source.project_id:
            abort(422)

        # Only add connection if it doesn't exist
        status_code = 200
        if to_source not in from_source.next_sources:
            from_source.next_sources.append(to_source)
            from_source.update()
            status_code = 201  # Set status_code to 201 to indicate new connection created

        return jsonify({
            'success': True,
            'from_source': from_source.format_short(),
            'to_source': to_source.format_short()
        }), status_code


    """
    Deletes a connection.
    """
    @app.route('/connections', methods=['DELETE'])
    @requires_auth('delete:connections')
    def delete_connection(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        from_id = body.get('from_id', None)
        to_id = body.get('to_id', None)
        if from_id is None or to_id is None:
            abort(400)

        from_source = get_authorized_source(user_id, from_id)
        to_source = get_authorized_source(user_id, to_id)

        if to_source not in from_source.next_sources:
            abort(422)

        from_source.next_sources.remove(to_source)
        from_source.update()

        return jsonify({
            'success': True,
            'from_source': from_source.format_short(),
            'to_source': to_source.format_short()
        })
