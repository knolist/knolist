import http.client
import os

from flask import jsonify, abort, request

from ..auth import requires_auth
from app.main.auth.get_authorized_objects \
    import get_authorized_project

"""
Helper to access auth0 and to find a user 
in the auth0 database based on their email.
"""
def access_auth0(email):
    # GET MGMT Token
    conn = http.client.HTTPSConnection("")
    client_beg = "zMZtScJRq7ZSiFzvRnnMIYsIcLRDoYWmKXh56"
    client_end = "O8n4dni6kRjvPQHy6e0irQZuJao"
    payload = "grant_type=client_credentials&client_id=%24%7Baccount.clientId%7D&client_secret=" \
              + client_beg + client_end + "&audience=https%3A%2F%2F%24%7Baccount.namespace%7D%2Fapi%2Fv2%2F"
    headers = {'content-type': "application/x-www-form-urlencoded"}
    conn.request("POST", "/knolist.us.auth0.com/oauth/token", payload, headers)

    res = conn.getresponse()
    data = res.read()

    # Code to get user id from email
    conn = http.client.HTTPSConnection("")

    headers = {'authorization': "Bearer " + data.decode("utf-8").access_token}

    conn.request("GET", "/knolist.us.auth0.com/api/v2/users-by-email?email=" + email, headers=headers)

    res = conn.getresponse()
    data = res.read()

    new_user = data.decode("utf-8")
    return new_user


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

        # Get user from auth0 database
        new_user = access_auth0(email)
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

        # Get user from auth0 database
        new_user = access_auth0(email, user_id, shared_proj)
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
