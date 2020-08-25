from flask import request, abort, jsonify
import justext
import requests

def get_title(html):
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title

def set_routes(app):
    @app.route('/')
    def index():
        return '<h1>Welcome to the Knolist API!</h1>'

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