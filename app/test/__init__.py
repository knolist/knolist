import os

from app.main.models.models import Source, Project
from app.main.auth import verify_decode_jwt
from manage import app, db

# Set variables for all tests
# First user has premium user role
jwt = os.environ.get('PREMIUM_USER_JWT')
# Get user_id from JWT
jwt_payload = verify_decode_jwt(jwt)
user_id = jwt_payload['sub']
auth_header = {'Authorization': f'Bearer {jwt}'}
# User with regular user role
other_user_jwt = os.environ.get('GENERAL_USER_JWT')

# Set up app and db for all tests
app.config.from_object('app.main.config.TestingConfig')
db.init_app(app)


def create_starter_data():
    project_1 = Project('Test Project 1', user_id)
    project_2 = Project('Test Project 2', user_id)

    source_1 = Source(url='https://test1.com',
                      title='Test Source 1',
                      content='This is the content of test source 1',
                      highlights='["First highlight", "Second highlight"]',
                      notes='["First note", "Second note"]',
                      x_position=100,
                      y_position=-30)

    source_2 = Source(url='https://test2.com',
                      title='Test Source 2',
                      content='This is the content of test source 2')

    source_3 = Source(url='https://test3.com',
                      title='Test Source 3',
                      content='This is the content of test source 3')

    project_1.sources.append(source_1)
    project_1.sources.append(source_2)
    project_2.sources.append(source_3)
    project_1.insert()
    project_2.insert()
    source_1.insert()
    source_2.insert()
    source_3.insert()

    return project_1, project_2, source_1, source_2, source_3
