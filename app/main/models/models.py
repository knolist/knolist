import json

from .. import db

# Relationship table to represent connections between sources
edges = db.Table('edges',
                 db.Column('from_id', db.Integer, db.ForeignKey('sources.id'), primary_key=True),
                 db.Column('to_id', db.Integer, db.ForeignKey('sources.id'), primary_key=True)
                 )

'''
Represents a project that contains several sources within it.
'''
class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    sources = db.relationship('Source', backref='project', lazy=True)

    def __init__(self, title):
        self.title = title

    def __repr__(self):
        return f'<Project {self.id}: {self.title}>'

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def format(self):
        return {
            'id': self.id,
            'title': self.title
        }


'''
Represents a specific source, which is a node in a directed graph.
'''
class Source(db.Model):
    __tablename__ = 'sources'

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String)
    # Highlights and notes are stored as JSON arrays
    highlights = db.Column(db.String)
    notes = db.Column(db.String)
    # x and y positions are used to represent the position of the node on a graph
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)
    # The project that holds this source
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)

    # Self-referential many-to-many relationship
    next_sources = db.relationship('Source', secondary=edges,
                                   primaryjoin=(id == edges.c.to_id),
                                   secondaryjoin=(id == edges.c.from_id),
                                   backref=db.backref('prev_sources', lazy=True)
                                   )

    def __repr__(self):
        return f'<Source {self.id}: {self.url}>'

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def format(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'content': self.content,
            'highlights': json.loads(self.highlights),
            'notes': json.loads(self.notes),
            'x_position': self.x_position,
            'y_position': self.y_position,
            'next_sources': self.next_sources,
            'prev_sources': self.prev_sources
        }
