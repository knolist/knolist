import http.client
import os

from flask import jsonify, abort, request

from ..auth import requires_auth, verify_decode_jwt
from ..models.models import Source
from .sources import get_authorized_source
from .items import get_authorized_item
from .items import get_authorized_project


def set_shared_project_routes(app):
    """
    Adds a new user to a shared project
    """

    @app.route('/shared_projects', methods=['POST'])
    @requires_auth('create:shared_projects')
    def create_share_from_ids(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        # Project ID to share
        shared_proj = body.get('shared_proj', None)
        # Email of the user to share
        email = body.get('email', None)
        # Role of the new user
        role = body.get('role', None)

        if shared_proj is None or email is None or role is None:
            abort(400)

        conn = http.client.HTTPSConnection("")

        # Code to get MGMT token access
        payload = "grant_type=client_credentials&client_id=%24%7Baccount.clientId%7D&client_secret=zMZtScJRq7ZSiFzvRnnMIYsIcLRDoYWmKXh56O8n4dni6kRjvPQHy6e0irQZuJao&audience=https%3A%2F%2F%24%7Baccount.namespace%7D%2Fapi%2Fv2%2F"
        headers = { 'content-type': "application/x-www-form-urlencoded" }
        conn.request("POST", "/knolist.us.auth0.com/oauth/token", payload, headers)
        res = conn.getresponse()
        data = res.read()

        # Code to get the user id from email
        headers = {'authorization': "Bearer " + data.decode("utf-8").access_token}
        conn.request("GET", "/shared_projects/api/v2/users-by-email?email=" +
                     email, headers=headers)
        res = conn.getresponse()
        data = res.read()
        new_user = data.decode("utf-8")
        new_user_id = new_user.user_id
        project = get_authorized_project(user_id, shared_proj)

        if new_user.email_verified is False:
            abort(400)
        status_code = 200
        # In case a user tries to add themself
        if project.user_id == user_id:
            return jsonify({
                'success': True,
                'project': project.format()
            }), status_code
        # Only share project if the project isn't already shared
        elif new_user_id not in project.shared_users:
            project.shared_users.append(new_user_id)
            project.update()
            # Set status_code to 201 to indicate new shared user created
            status_code = 201

        return jsonify({
            'success': True,
            'project': project.format()
        }), status_code

    """
    Removes a user from the projects shared users.
    """

    @app.route('/shared_projects', methods=['DELETE'])
    @requires_auth('delete:shared_projects')
    def delete_shared_user(user_id):
        body = request.get_json()
        if body is None:
            abort(400)

        # Project ID to share
        shared_proj = body.get('shared_proj', None)
        # Email of user to delete from project
        email = body.get('email', None)

        if shared_proj is None or email is None:
            abort(400)

        conn = http.client.HTTPSConnection("")

        # Code to get MGMT token access
        payload = "grant_type=client_credentials&client_id=%24%7Baccount.clientId%7D&client_secret=zMZtScJRq7ZSiFzvRnnMIYsIcLRDoYWmKXh56O8n4dni6kRjvPQHy6e0irQZuJao&audience=https%3A%2F%2F%24%7Baccount.namespace%7D%2Fapi%2Fv2%2F"
        headers = { 'content-type': "application/x-www-form-urlencoded" }
        conn.request("POST", "/knolist.us.auth0.com/oauth/token", payload, headers)
        res = conn.getresponse()
        data = res.read()

        headers = {'authorization': "Bearer " + data.decode("utf-8").access_token}
        conn.request("GET", "/shared_projects/api/v2/users-by-email?email=" +
                     email, headers=headers)
        res = conn.getresponse()
        data = res.read()
        new_user = data.decode("utf-8")
        new_user_id = new_user.user_id

        project = get_authorized_project(user_id, shared_proj)

        if new_user_id not in project.shared_users:
            abort(422)

        project.shared_users.remove(new_user_id)
        project.update()

        return jsonify({
            'success': True,
            'project': project.format()
        })

    """
    Update the role of a user in the shared project
    """

    @app.route('/shared_projects/<int:project_id>', methods=['UPDATE'])
    @requires_auth('update:shared_projects')
    def update_shared_user(user_id, project_id):
        body = request.get_json()
        if body is None:
            abort(400)

        role = body.get('role', None)
        if role is None:
            abort(400)

        project = get_authorized_project(user_id, project_id)

        if user_id != project.user_id:
            abort(422)

        project.shared_users.role = role
        project.update()

        return jsonify({
            'success': True,
            'project': project.format()
        })
