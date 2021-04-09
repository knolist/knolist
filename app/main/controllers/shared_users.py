import http.client, json, requests
from requests.exceptions import RequestException, HTTPError, URLRequired
from flask import jsonify, abort, request

from ..auth import requires_auth
from app.main.auth.get_authorized_objects \
    import get_authorized_project, get_authorized_shareduser
from ..models.models import Shared_User, db, Project
from sqlalchemy import and_

"""
Helper to access auth0 and to find a user 
in the auth0 database based on their email.
"""


def access_auth0(email):
    domain = 'knolist.us.auth0.com'
    audience = f'https://{domain}/api/v2/'
    client_id = 'JpvsDDxBhVup3uosyIr4bYTNKE0PqDZB'
    client_secret = 'Gr1EZNVy19GW6X_vyvpOtN51YFhZ8YE5tGPxCBrZQE2U2bqwmYSI2-GYhpCV6OZB'
    grant_type = "client_credentials"  # OAuth 2.0 flow to use

    # Get an Access Token from Auth0
    base_url = f"https://{domain}"
    payload = {
        'grant_type': grant_type,
        'client_id': client_id,
        'client_secret': client_secret,
        'audience': audience
    }
    response = requests.post(f'{base_url}/oauth/token', data=payload)
    oauth = response.json()
    access_token = oauth.get('access_token')

    # Add the token to the Authorization header of the request
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    # Get all Applications using the token
    try:
        res = requests.get(f'{base_url}/api/v2/users-by-email?email=' + email, headers=headers)
        data = res.json()
        new_user = data
        return new_user
    except HTTPError as e:
        print(f'HTTPError: {str(e.code)} {str(e.reason)}')
    except URLRequired as e:
        print(f'URLRequired: {str(e.reason)}')
    except RequestException as e:
        print(f'RequestException: {e}')
    except Exception as e:
        print(f'Generic Exception: {e}')


def set_shared_user_routes(app):
    """
    Adds a new user to a shared project
    """

    @app.route('/shared_users', methods=['POST'])
    @requires_auth('create:shared_users')
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
        temp = access_auth0(email)
        if temp is not None:
            new_user = temp[0]  #access_auth0(email)[0]
            new_user_id = new_user["user_id"]
            new_user_name = new_user["name"]
            project = get_authorized_project(user_id, shared_proj)
        else:
            abort(404)

        if new_user["email_verified"] is False:
            abort(400)
        status_code = 200

        exist = db.session.query(Shared_User).filter(Shared_User.shared_proj == shared_proj).filter(Shared_User.shared_user == new_user_id).scalar()

        exist2 = db.session.query(Shared_User).filter(Shared_User.shared_proj == shared_proj).scalar()
        # In case a user tries to add someone who is already shared
        if project.user_id == new_user_id or exist is not None:
            return jsonify({
                'success': True,
                'project': project.format()
            }), status_code

        # If a project is aleady in the table, then we add the new user to the list of shared users
        elif exist2 is not None:
            shared_user = Shared_User(shared_proj=shared_proj, shared_user=new_user_id, role=role, name=new_user_name, email=email)
            project.shared_users.append(shared_user)
            project.update()
            status_code = 201
        # Only share project if the project isn't already shared
        elif exist is None:
            shared_user = Shared_User(shared_proj=shared_proj, shared_user=new_user_id, role=role, name=new_user_name, email=email)
            shared_user.insert()
            #statement = Shared_User.insert().values(shared_proj=shared_proj, shared_user=new_user_id, role=role)
            #db.session.execute(statement)
            #shared_user.update()
            #project.update()
            # Set status_code to 201 to indicate new shared user created
            status_code = 201
        return jsonify({
            'success': True,
            'project': project.format()
        }), status_code

    """
    Removes a user from the projects shared users.
    """

    @app.route('/shared_users', methods=['DELETE'])
    @requires_auth('delete:shared_users')
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
        temp = access_auth0(email)
        if temp is not None:
            new_user = access_auth0(email)[0]
            new_user_id = new_user["user_id"]
            project = get_authorized_project(user_id, shared_proj)
        else:
            abort(404)

        exist = db.session.query(Shared_User).filter(Shared_User.shared_proj == shared_proj).filter(Shared_User.shared_user == new_user_id).scalar()
        if exist is None:
            abort(422)
        else:
            shared_user = get_authorized_shareduser(user_id, shared_proj)
            # shared_user = Shared_User(shared_proj=shared_proj, shared_user=new_user_id)
            shared_user.delete()
            # statement = Shared_User.delete().where(shared_proj=shared_proj, shared_user=new_user_id)
            # db.session.execute(statement)
            # shared_user.update()

            return jsonify({
                'success': True,
                'project': project.format()
            })

    """
    Update the role of a user in the shared project
    """

    @app.route('/shared_users/<int:project_id>', methods=['UPDATE'])
    @requires_auth('update:shared_users')
    def update_shared_user(user_id, project_id):
        body = request.get_json()
        if body is None:
            abort(400)

        role = body.get('role', None)
        if role is None:
            abort(400)

        shared_user = get_authorized_shareduser(user_id, project_id)

        shared_user.role = role
        shared_user.update()

        return jsonify({
            'success': True,
            'shared_user': shared_user.format()
        })
