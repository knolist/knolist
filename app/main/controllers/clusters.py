from flask import request, abort, jsonify
from justext import justext, get_stoplist
from requests import get as requests_get

from ..models.models import Project, Source, Cluster, Item
from ..auth import requires_auth, AuthError


def get_authorized_project(user_id, project_id):
    project = Project.query.get(project_id)
    if project is None:
        abort(404)

    if project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return project


def get_authorized_cluster(user_id, cluster_id):
    cluster = Cluster.query.get(cluster_id)
    if cluster is None:
        abort(404)

    tempcluster = cluster
    while tempcluster.project is None:
        tempcluster = tempcluster.parent_cluster
    if tempcluster.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)
    return cluster


def get_authorized_source(user_id, source_id):
    source = Source.query.get(source_id)
    if source is None:
        abort(404)

    if source.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return source


def get_authorized_item(user_id, item_id):
    item = Item.query.get(item_id)

    if item is None:
        abort(404)
    if item.project.user_id != user_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return item


def set_cluster_routes(app):
    '''
    Displays clusters and items of a cluster
    '''
    @app.route('/clusters/<int:cluster_id>')
    @requires_auth('read:clusters')
    def get_cluster_info(user_id, cluster_id):
        cluster = Cluster.query.filter(Cluster.id == cluster_id).first()
        return jsonify({
            'success': True,
            'cluster': cluster.format()
        })

    """
    Deletes a cluster.
    """
    @app.route('/clusters/<int:cluster_id>', methods=['DELETE'])
    @requires_auth('delete:clusters')
    def delete_cluster(user_id, cluster_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        # Set source parent cluster equal to the parent cluster
        # of the cluster being deleted(could be none)
        cluster_parent = cluster.parent_cluster
        for item in cluster.child_items:
            if cluster_parent is None:
                # items now just belong to the project -
                cluster.project.items.append(item)
                item.cluster_id = None
            else:
                cluster_parent.child_items.append(item)
                # I may not need to explicitly do this
                item.cluster_id = cluster_parent.id
            item.update()

        if cluster_parent is None:
            cluster.project.update()
        else:
            cluster_parent.update()
        cluster.delete()

        return jsonify({
            'success': True,
            'deleted': cluster_id
        })

    '''
    Update cluster name
    '''
    @app.route('/clusters/<int:cluster_id>', methods=['PATCH'])
    @requires_auth('update:clusters')
    def update_cluster_name(user_id, cluster_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        body = request.get_json()
        if body is None:
            abort(400)

        new_name = body.get('name', None)
        if new_name is None:
            abort(400)

        cluster.name = new_name
        cluster.update()

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        })

    '''
    Creates a new cluster from scratch (two sources come near each other)
    '''
    @app.route('/clusters/create_new', methods=['POST'])
    @requires_auth('create:clusters')
    def create_cluster_from_scratch(user_id):
        # Check to ensure user is authorized to make changes

        body = request.get_json()
        if body is None:
            abort(400)

        item1_id = body.get('item1_id', None)
        item2_id = body.get('item2_id', None)
        if item1_id is None or item2_id is None:
            abort(400)

        # Get sources and create them if necessary
        item1 = get_authorized_item(user_id, item1_id)
        item2 = get_authorized_item(user_id, item2_id)
        if item1 is None or item2 is None:
            abort(400)

        # Clusters should start with same parent cluster
        if item1.cluster != item2.cluster:
            abort(400)

        x = body.get('x_position', None)
        y = body.get('y_position', None)
        name = body.get('name', None)
        if not name:
            abort(400)

        cluster = Cluster(name=name, x_position=x, y_position=y)
        if item1.cluster is not None:
            cluster.parent_cluster = item1.cluster
        else:
            cluster.project = item1.project
        cluster.insert()
        cluster.child_items.append(item1)
        cluster.child_items.append(item2)
        cluster.update()
        status_code = 201

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code

    @app.route('/clusters/<int:cluster_id>/sources/<int:item_id>',
               methods=['PATCH'])
    @requires_auth('update:clusters')
    def add_to_existing_cluster(user_id, cluster_id, item_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        item = get_authorized_item(user_id, item_id)

        if item.cluster == cluster:
            abort(400)
        if cluster.parent_cluster is not None:
            if item.cluster != cluster.parent_cluster:
                abort(400)

        item.cluster = cluster

        item.update()
        cluster.child_items.append(item)
        cluster.update()
        status_code = 201

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code

    @app.route('/clusters/<int:cluster_id>/sources/<int:item_id>/remove',
               methods=['PATCH'])
    @requires_auth('update:clusters')
    def remove_from_existing_cluster(user_id, cluster_id, item_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        item = get_authorized_item(user_id, item_id)

        if item.cluster != cluster:
            abort(400)
        item.cluster = cluster.parent_cluster
        item.update()
        status_code = 201
        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code
