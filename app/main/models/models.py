import json

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

"""
# Relationship table to represent the shared users that can access a project
shared_projects = db.Table('shared_projects',
                           db.Column('shared_proj', db.Integer,
                                     db.ForeignKey('projects.id'), primary_key=True),
                           db.Column('shared_user', db.String),
                           db.Column('role', db.String, nullable=False)
                           )
"""

class BaseModel(db.Model):
    """
    Extend the base Model class to add common methods
    """
    __abstract__ = True

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()


class Project(BaseModel):
    """
    Represents a project that contains several sources within it.
    """
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    # ID provided by Auth0, no need for local users table
    user_id = db.Column(db.String, nullable=False)
    sources = db.relationship('Source', backref='project',
                              cascade='all, delete-orphan', lazy=True)
    description = db.Column(db.String)
    creation_date = db.Column(db.DateTime, nullable=False)
    recent_access_date = db.Column(db.DateTime, nullable=False)
    is_archived = db.Column(db.Boolean, nullable=False, default=False)
    clusters = db.relationship('Cluster', backref='project',
                               cascade='all, delete-orphan', lazy=True)
    items = db.relationship('Item', backref='project',
                            cascade='all, delete-orphan', lazy=True)
    # Many to many relationship
    shared_users = db.relationship('Shared_User', backref='project')

    def __init__(self, title, description, user_id):
        self.title = title
        self.description = description
        self.user_id = user_id

    def __repr__(self):
        return f'<Project {self.id}: {self.title}>'

    def format(self):
        return {
            'id': self.id,
            'title': self.title,
            'shared_users': [shared.format() for shared in self.shared_users],
            'description': self.description,
            'creation_date': self.creation_date,
            'recent_access_date': self.recent_access_date,
            'is_archived': self.is_archived
        }


class Cluster(BaseModel):
    """
    Represents a specific cluster, which is a grouping of nodes.
    """
    __tablename__ = 'clusters'
    __table_args__ = (
        db.CheckConstraint('(NOT(project_id IS NULL AND parent_cluster_id IS NULL)) AND'
                           '(NOT(project_id IS NOT NULL AND parent_cluster_id IS NOT NULL))'),
    )
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    # represents the cartesian coordinates of the center of the cluster
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)
    # The project that holds this source
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    parent_cluster_id = db.Column(db.Integer, db.ForeignKey('clusters.id'))
    # References to outermost clusters within a given cluster
    child_clusters = db.relationship('Cluster',
                                     backref=db.backref('parent_cluster',
                                                        remote_side=[id]))
    # References to sources not in another subcluster within a cluster
    child_items = db.relationship('Item', backref='cluster',
                                  cascade='all',
                                  lazy=True)

    def __repr__(self):
        return f'<Cluster {self.id}: {self.name}>'

    def format(self):
        return {
            'id': self.id,
            'name': self.name,
            'x_position': self.x_position,
            'y_position': self.y_position,
            'project_id': self.project_id,
            'child_clusters': [cluster.id for cluster in self.child_clusters],
            'child_items': [item.format() for item in self.child_items],
            'parent_cluster': self.parent_cluster_id
        }


class Source(BaseModel):
    """
    Represents a specific source, which is a node in a directed graph.
    """
    __tablename__ = 'sources'

    # Ensure unique URLs within a project
    __table_args__ = (
        db.UniqueConstraint('project_id', 'url'),
    )

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, nullable=False)
    title = db.Column(db.String)
    # All of the content of the URL, only used for search purposes
    content = db.Column(db.String)
    is_included = db.Column(db.Boolean)
    author = db.Column(db.String)
    published_date = db.Column(db.DateTime)
    site_name = db.Column(db.String)
    access_date = db.Column(db.DateTime)
    # The project that holds this source
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))

    child_items = db.relationship('Item', backref='source',
                                  cascade='all, delete-orphan',
                                  lazy=True)

    def __repr__(self):
        return f'<Source {self.id}: {self.url}>'

    def format(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'author': self.author,
            'site_name': self.site_name,
            'is_included': self.is_included,
            'published_date': self.published_date,
            'access_date': self.access_date,
            'project_id': self.project_id
        }


class Item(BaseModel):
    """
    Represents the different types of items.
    """
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'))
    is_note = db.Column(db.Boolean, nullable=False)
    # The content of the highlight or note
    content = db.Column(db.String)
    # x and y positions are used to represent the position of a node on a graph
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)
    date_of_creation = db.Column(db.DateTime, nullable=False)
    # The project that holds this source
    parent_project = db.Column(db.Integer, db.ForeignKey('projects.id'))
    # parent_cluster
    parent_cluster = db.Column(db.Integer, db.ForeignKey('clusters.id'))

    def __repr__(self):
        return f'<Item {self.id}: {self.content}>'

    def format(self):
        return {
            'id': self.id,
            'url': None if self.source is None else self.source.url,
            'title': None if self.source is None else self.source.title,
            'parent_project': self.parent_project,
            'parent_cluster': self.parent_cluster,
            'is_note': self.is_note,
            'content': self.content,
            'x_position': self.x_position,
            'y_position': self.y_position
        }


class Shared_User(BaseModel):
    """
    Represents the user (used for shared_projects feature)
    """
    __tablename__ = 'shared_users'
    shared_proj = db.Column(db.Integer, db.ForeignKey('projects.id'), primary_key=True)
    shared_user = db.Column(db.String)
    role = db.Column(db.String, nullable=False)
    name = db.Column(db.String)
    email = db.Column(db.String)

    def __repr__(self):
        return f'<Shared_user {self.shared_proj}: {self.shared_user}>'

    def format(self):
        return {
            'shared_proj': self.shared_proj,
            'shared_user': self.shared_user,
            'role': self.role,
            'name': self.name,
            'email': self.email
        }
