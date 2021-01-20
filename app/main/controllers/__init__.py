import os

from flask import jsonify, send_from_directory
from .projects import set_project_routes
from .sources import set_source_routes
from .items import set_item_routes
from .connections import set_connection_routes
from .clusters import set_cluster_routes


def set_routes(app):
    # Serve React App
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    @app.route('/auth/callback')
    def auth_callback():
        return jsonify({
            'success': True,
            'message': 'Authenticated'
        })

    set_project_routes(app)
    set_source_routes(app)
    set_item_routes(app)
    set_connection_routes(app)
    set_cluster_routes(app)


