from .. import db

'''
Represents a project that contains several sources within it.
'''
class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    sources = db.relationship('Source', backref='project', lazy=True)

    def __repr__(self):
        return f'<Project {self.id}: {self.name}>'

# Relationship table to represent connections between sources
edges = db.Table('edges',
                 db.Column('from_id', db.Integer, db.ForeignKey('sources.id'), primary_key=True),
                 db.Column('to_id', db.Integer, db.ForeignKey('sources.id'), primary_key=True)
                 )

'''
Represents a specific source, which is a node in a directed graph.
'''
class Source(db.Model):
    __tablename__ = 'sources'

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, nullable=False)
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String)
    highlights = db.Column(db.String)
    notes = db.Column(db.String)
    x_position = db.Column(db.Integer)
    y_position = db.Column(db.Integer)

    # Self-referential many-to-many relationship
    next_sources = db.relationship('Source', secondary=edges,
                                   primaryjoin=(id == edges.c.to_id),
                                   secondaryjoin=(id == edges.c.from_id),
                                   backref=db.backref('prev_sources', lazy=True)
                                   )

    def __repr__(self):
        return f'<Source {self.id}: {self.url}>'


