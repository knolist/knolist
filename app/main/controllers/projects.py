from flask import request, abort, jsonify

from ..models.models import Project
from ..auth import requires_auth, AuthError

def set_project_routes(app):
    """
    Returns a list of all projects in the database.
    """
    @app.route('/projects')
    @requires_auth('read:projects')
    def get_projects(user_id):
        projects = Project.query.filter(Project.user_id == user_id).order_by(Project.id).all()

        return jsonify({
            'success': True,
            'projects': [project.format() for project in projects]
        })

    """
    Creates a new project. Data is passed as a JSON argument. Returns information about the new project.
    """
    @app.route('/projects', methods=['POST'])
    @requires_auth('create:projects')
    def create_project(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        title = body.get('title', None)
        if title is None:
            abort(400)

        project = Project(title, user_id)
        project.insert()

        return jsonify({
            'success': True,
            'id': project.id,
            'title': project.title
        }), 201

    """
    Updates the title of a project. New title is passed as a JSON body. Returns the id and updated title of the project
    """
    @app.route('/projects/<int:project_id>', methods=['PATCH'])
    @requires_auth('update:projects')
    def update_project(user_id, project_id):
        project = Project.query.get(project_id)
        if project is None:
            abort(404)

        body = request.get_json()
        if body is None:
            abort(400)

        new_title = body.get('title', None)
        if new_title is None:
            abort(400)

        if project.user_id != user_id:
            raise AuthError({
                'code': 'invalid_user',
                'description': 'This item does not belong to the requesting user.'
            }, 403)

        project.title = new_title
        project.update()

        return jsonify({
            'success': True,
            'id': project_id,
            'title': new_title
        })

    """
    Deletes a project given the project ID. Returns the id of the deleted project.
    """
    @app.route('/projects/<int:project_id>', methods=['DELETE'])
    @requires_auth('delete:projects')
    def delete_project(user_id, project_id):
        project = Project.query.get(project_id)
        if project is None:
            abort(404)

        if project.user_id != user_id:
            raise AuthError({
                'code': 'invalid_user',
                'description': 'This item does not belong to the requesting user.'
            }, 403)

        project.delete()

        return jsonify({
            'success': True,
            'deleted': project_id
        })