from flask import jsonify, abort

from ..auth import requires_auth
from ..models.models import Source
from .sources import get_authorized_source

def set_connection_routes(app):

    """
    Creates a connection given two existing source IDs.
    """
    @app.route('/connections/<int:from_id>/<int:to_id>', methods=['POST'])
    @requires_auth('create:connections')
    def create_connection_from_ids(user_id, from_id, to_id):
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
            'from_id': from_id,
            'to_id': to_id
        }), status_code
