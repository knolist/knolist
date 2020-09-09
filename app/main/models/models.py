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
    # Highlights and notes are stored as JSON arrays
    highlights = db.Column(db.String, default='[]')
    notes = db.Column(db.String, default='[]')
    # x and y positions are used to represent the position of a node on a graph
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)
    # The project that holds this source
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'),
                           nullable=False)

    # Self-referential many-to-many relationship
    next_sources = db.relationship('Source', secondary=edges,
                                   primaryjoin=(id == edges.c.from_id),
                                   secondaryjoin=(id == edges.c.to_id),
                                   backref=db.backref('prev_sources',
                                                      lazy=True)
                                   )

    def __repr__(self):
        return f'<Source {self.id}: {self.url}>'

    def format_long(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'highlights': json.loads(self.highlights),
            'notes': json.loads(self.notes),
            'x_position': self.x_position,
            'y_position': self.y_position,
            'next_sources': [source.id for source in self.next_sources],
            'prev_sources': [source.id for source in self.prev_sources],
            'project_id': self.project_id
        }

    def format_short(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'x_position': self.x_position,
            'y_position': self.y_position,
            'next_sources': [source.id for source in self.next_sources],
            'prev_sources': [source.id for source in self.prev_sources],
            'project_id': self.project_id
        }
