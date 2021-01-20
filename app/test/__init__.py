import os

from app.main.models.models import Source, Project, Item, Cluster
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
                      author='Nick',
                      content='This is the content of test source 1')
                      #highlights='["First highlight", "Second highlight"]',
                      #notes='["First note", "Second note"]',


    source_2 = Source(url='https://test2.com',
                      title='Test Source 2',
                      author='Vance',
                      content='This is the content of test source 2')

    source_3 = Source(url='https://test3.com',
                      title='Test Source 3',
                      author='Vini',
                      content='This is the content of test source 3')

    item_1 = Item(is_note=True,
                  content="Content of item 1")

    item_2 = Item(is_note=True,
                  content="Content of item 2")

    item_3 = Item(is_note=False,
                  content="Content of item 3")

    item_4 = Item(is_note=False,
                  content="Content of item 4")

    extra_item = Item(is_note=True,
                      content='Content of Extra Item')
    source_1.child_items.append(item_1)
    source_2.child_items.append(item_2)
    source_3.child_items.append(item_3)
    source_3.child_items.append(item_4)
    project_1.sources.append(source_1)
    project_1.sources.append(source_2)
    project_2.sources.append(source_3)
    item_1.project = source_1.project
    item_2.project = source_2.project
    item_3.project = source_3.project
    item_4.project = source_3.project

    cluster_1 = Cluster(name="Test Cluster",
                        x_position=300,
                        y_position=-40)
    cluster_1.child_items.append(item_1)
    project_1.clusters.append(cluster_1)

    project_1.insert()
    project_2.insert()
    source_1.insert()
    source_2.insert()
    source_3.insert()
    item_1.insert()
    item_2.insert()
    item_3.insert()
    item_4.insert()
    cluster_1.insert()

    return project_1, project_2, source_1, source_2, source_3, cluster_1
