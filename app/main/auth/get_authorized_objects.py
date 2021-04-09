from flask import abort
from app.main.models.models import Project, Source, Cluster, Item, Shared_User
from app.main.auth import AuthError


def get_authorized_project(user_id, project_id):
    project = Project.query.get(project_id)
    if project is None:
        abort(404)

    if project.user_id != user_id and \
            (user_id not in project.shared_users):
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return project

def get_authorized_shareduser(user_id, project_id):
    shared_user = Shared_User.query.get(project_id)
    if shared_user is None:
        abort(404)

    if shared_user.shared_proj != project_id:
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This user does not have access to the shared user.'
        })

    return shared_user

def get_authorized_cluster(user_id, cluster_id):
    cluster = Cluster.query.get(cluster_id)
    if cluster is None:
        abort(404)

    temp_cluster = cluster
    while temp_cluster.project is None:
        temp_cluster = temp_cluster.parent_cluster
    if (temp_cluster.project.user_id != user_id) \
            and (user_id not in temp_cluster.project.shared_users):
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)
    return cluster


def get_authorized_source(user_id, source_id):
    source = Source.query.get(source_id)
    if source is None:
        abort(404)

    if (source.project.user_id != user_id) \
            and (user_id not in source.project.shared_users):
        raise AuthError({
            'code': 'invalid_user',
            'description': 'This item does not belong to the requesting user.'
        }, 403)

    return source


def get_authorized_item(user_id, item_id):
    item = Item.query.get(item_id)

    if item is None:
        abort(404)

    if not item.project and not item.cluster:
        abort(400)
    if item.project:
        if (item.project.user_id != user_id) and \
                (user_id not in item.project.shared_users):
            raise AuthError({
                'code': 'invalid_user',
                'description':
                    'This item does not belong to the requesting user.'
            }, 403)

    else:
        temp_cluster = item.cluster
        while temp_cluster:
            if temp_cluster.parent_cluster:
                temp_cluster = temp_cluster.parent_cluster
            else:
                if temp_cluster.project.user_id != user_id:
                    raise AuthError({
                        'code': 'invalid_user',
                        'description':
                            'This item does not belong to the requesting user'
                    }, 403)
                break

    return item
