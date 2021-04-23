from flask import request, abort, jsonify

from app.main.auth.get_authorized_objects \
    import get_authorized_cluster, get_authorized_item
from ..models.models import Cluster
from ..auth import requires_auth


def set_cluster_routes(app):
    # Displays clusters and items of a cluster
    @app.route('/clusters/<int:cluster_id>')
    @requires_auth('read:clusters')
    def get_cluster_info(user_id, cluster_id):
        cluster = get_authorized_cluster(user_id, cluster_id)

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
                item.parent_cluster = None
            else:
                cluster_parent.child_items.append(item)
                # I may not need to explicitly do this
                item.parent_cluster = cluster_parent.id
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
        new_x = body.get('x', None)
        new_y = body.get('y', None)
        # if both are somewhat missing
        if new_name is None and (new_x is None or new_y is None):
            abort(400)
        if new_name:
            cluster.name = new_name
        if new_x is not None and new_y is not None:
            cluster.x_position = new_x
            cluster.y_position = new_y
        cluster.update()

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        })

    '''
    Creates a new cluster from scratch (two sources come near each other)
    '''

    @app.route('/clusters', methods=['POST'])
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

        # Clusters should start with same parent cluster or project
        if item1.parent_cluster != item2.parent_cluster \
                and item1.parent_project != item2.parent_project:
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

        item1.project = None
        item2.project = None
        status_code = 201

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code

    @app.route('/clusters/<int:cluster_id>/items/<int:item_id>',
               methods=['POST'])
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
        item.parent_project = None

        item.update()
        cluster.child_items.append(item)
        cluster.update()
        status_code = 201

        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code

    @app.route('/clusters/<int:cluster_id>/items/<int:item_id>',
               methods=['DELETE'])
    @requires_auth('update:clusters')
    def remove_from_existing_cluster(user_id, cluster_id, item_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        item = get_authorized_item(user_id, item_id)

        if item.cluster != cluster:
            abort(400)

        if not cluster.parent_cluster:
            item.cluster = None
            cluster.project.items.append(item)
        else:
            cluster.parent_cluster.child_items.append(item)
        item.update()
        status_code = 200
        return jsonify({
            'success': True,
            'cluster': cluster.format()
        }), status_code

    """
    For a cluster, set all sources to 'included'
    if it exists in a sub cluster of that cluster
    """

    @app.route('/clusters/<int:cluster_id>/subsources', methods=["GET"])
    @requires_auth('read:clusters')
    def get_sources_under_clusters(user_id, cluster_id):
        cluster = get_authorized_cluster(user_id, cluster_id)
        if not cluster:
            abort(404)  # Cluster not found
        cluster_queue = [cluster]
        sources = []
        while len(cluster_queue) > 0:
            for c in cluster_queue:
                if c.child_clusters:
                    cluster_queue.extend(c.child_clusters)
            for item in cluster_queue[0].child_items:
                if item.source_id:
                    sources.append(item.source.format())
            cluster_queue.pop(0)
        return jsonify({
            'success': True,
            'sources': sources
        }), 200
