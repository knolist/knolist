import json

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Relationship table to represent connections between sources
edges = db.Table('edges',
                 db.Column('from_id', db.Integer,
                           db.ForeignKey('sources.id'), primary_key=True),
                 db.Column('to_id', db.Integer,
                           db.ForeignKey('sources.id'), primary_key=True)
                 )


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
    clusters = db.relationship('Cluster', backref='project',
                               cascade='all, delete-orphan', lazy=True)
    items = db.relationship('Item', backref='project',
                            cascade='all, delete-orphan', lazy=True)

    def __init__(self, title, user_id):
        self.title = title
        self.user_id = user_id

    def __repr__(self):
        return f'<Project {self.id}: {self.title}>'

    def format(self):
        return {
            'id': self.id,
            'title': self.title
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
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'),
                           nullable=True)
    parent_cluster_id = db.Column(db.Integer, db.ForeignKey('clusters.id'),
                                  nullable=True)
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
            'child_items': [item.id for item in self.child_items]
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
    title = db.Column(db.String, nullable=False)
    # All of the content of the URL, only used for search purposes
    content = db.Column(db.String)
    is_included = db.Column(db.Boolean)
    author = db.Column(db.String)
    published_date = db.Column(db.DateTime)
    site_name = db.Column(db.String)
    access_date = db.Column(db.DateTime)

    # The project that holds this source
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'),
                           nullable=True)
    # Self-referential many-to-many relationship
    next_sources = db.relationship('Source', secondary=edges,
                                   primaryjoin=(id == edges.c.from_id),
                                   secondaryjoin=(id == edges.c.to_id),
                                   backref=db.backref('prev_sources',
                                                      lazy=True)
                                   )
    child_items = db.relationship('Item', backref='source',
                                    cascade='all, delete-orphan',
                                    lazy=True)

    def __repr__(self):
        return f'<Source {self.id}: {self.url}>'

    def format_long(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'author': self.author,
            'site_name': self.site_name,
            'is_included': self.is_included,
            'next_sources': [source.id for source in self.next_sources],
            'prev_sources': [source.id for source in self.prev_sources],
            'project_id': self.project_id
        }

    def format_short(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'next_sources': [source.id for source in self.next_sources],
            'prev_sources': [source.id for source in self.prev_sources],
            'project_id': self.project_id
        }


class Item(BaseModel):
    """
    Represents the different types of items.
    """
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'))
    is_note = db.Column(db.BOOLEAN, nullable=False)
    # The content of the highlight or note
    content = db.Column(db.String)
    # x and y positions are used to represent the position of a node on a graph
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)
    # The project that holds this source
    parent_project = db.Column(db.Integer, db.ForeignKey('projects.id'),
                               nullable=False)
    # parent_cluster
    parent_cluster = db.Column(db.Integer, db.ForeignKey('clusters.id'))

    def __repr__(self):
        return f'<Item {self.id}: {self.content}>'

    def format(self):
        return {
            'id': self.id,
            'source_id': self.source_id,
            'content': json.loads(self.content),
            'x_position': self.x_position,
            'y_position': self.y_position,
            'parent_project': self.parent_project
        }