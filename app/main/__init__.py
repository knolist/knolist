# Based on
# https://www.freecodecamp.org/news/structuring-a-flask-restplus-web-service-for-production-builds-c2ec676de563/
from flask import Flask
from flask_cors import CORS

from .config import config_by_name
from app.main.controllers import set_routes
from app.main.error_handlers import set_error_handlers
from app.main.models.models import db


def create_app(config_name):
    app = Flask(__name__, static_folder='../../frontend/build')
    app.config.from_object(config_by_name[config_name])
    db.init_app(app)

    # Set up CORS
    cors_config = {
        'origins': ['http://localhost:3000',
                    'http://localhost:3001',
                    'http://knolist.herokuapp.com',
                    'http://knolist-api.herokuapp.com',
                    'https://app.knolist.com'],
        'methods': ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        'allow_headers': ['Content-Type', 'Authorization', 'true']
    }
    CORS(app, resources={r'/*': cors_config})

    set_routes(app)
    set_error_handlers(app)

    return app
