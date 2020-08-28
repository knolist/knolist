from flask import request, abort, jsonify

from .projects import set_project_routes
from .sources import set_sources_routes

def set_routes(app):
    @app.route('/')
    def index():
        return '<h1>Welcome to the Knolist API!</h1>'

    @app.route('/auth/callback')
    def auth_callback():
        return jsonify({
            'success': True,
            'message': 'Authenticated'
        })

    set_project_routes(app)
    set_sources_routes(app)




