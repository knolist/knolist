from flask import request, abort, jsonify
import justext
import requests

from ..models.models import Project, Source

def get_title(html):
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title

def set_routes(app):
    @app.route('/')
    def index():
        return '<h1>Welcome to the Knolist API!</h1>'

    """
    Returns a list of all projects in the database.
    """
    @app.route('/projects')
    def get_projects():
        projects = Project.query.order_by(Project.id).all()

        return jsonify({
            'success': True,
            'projects': [project.format() for project in projects]
        })

    """
    Creates a new project. Data is passed as a JSON argument. Returns information about the new project.
    """
    @app.route('/projects', methods=['POST'])
    def create_project():
        body = request.get_json()
        if body is None:
            abort(400)

        title = body.get('title', None)
        if title is None:
            abort(400)

        project = Project(title)
        project.insert()

        return jsonify({
            'success': True,
            'id': project.id,
            'title': project.title
        })

    """
    Updates the title of a project. New title is passed as a JSON body. Returns the id and updated title of the project
    """
    @app.route('/projects/<int:project_id>', methods=['PATCH'])
    def update_project(project_id):
        body = request.get_json()
        if body is None:
            abort(400)

        project = Project.query.get(project_id)
        if project is None:
            abort(404)

        new_title = body.get('title', None)
        if new_title is None:
            abort(400)

        project.title = new_title
        project.update()

        return jsonify({
            'success': True,
            'id': project_id,
            'title': new_title
        })


    @app.route('/extract')
    def extract():
        url = request.args.get('url')
        response = requests.get(url)

        paragraphs = justext.justext(response.content, justext.get_stoplist("English"))
        real_text = ""

        for paragraph in paragraphs:
            if not paragraph.is_boilerplate:
                real_text += paragraph.text
                real_text += "\n\n"
        
        return jsonify({
            'success': True,
            'content': real_text,
            'url': url,
            'title': get_title(response.content)
        })