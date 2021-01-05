import json
import unittest
from urllib.parse import quote

from app.test import create_starter_data, auth_header, user_id, app, db
from app.main.models.models import Project, Source


class TestProjectsEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/projects'."""

    def setUp(self):
        """Define test variables and initialize app."""
        self.app = app
        self.client = self.app.test_client
        self.db = db

        with self.app.app_context():
            self.db.session.commit()
            self.db.drop_all()
            self.db.create_all()

        items = create_starter_data()
        self.project_1 = items[0]
        self.project_2 = items[1]
        self.source_1 = items[2]
        self.source_2 = items[3]
        self.source_3 = items[4]

        self.new_project_title = 'New Project'

        self.new_source_url = 'https://en.wikipedia.org/wiki/Test'

    def tearDown(self):
        """Executed after each test."""
        pass

    # GET '/projects' #
    # Only one test case since the endpoint
    # is always successful for authenticated users
    def test_get_projects(self):
        res = self.client().get('/projects', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        projects = data['projects']
        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]['id'], self.project_1.id)
        self.assertEqual(projects[0]['title'], self.project_1.title)
        self.assertEqual(projects[1]['id'], self.project_2.id)
        self.assertEqual(projects[1]['title'], self.project_2.title)

    # POST '/projects' #
    def test_create_project(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Create project
        res = self.client().post('/projects',
                                 json={'title': self.new_project_title},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        added_project = Project.query.get(data['project']['id'])
        self.assertEqual(len(new_projects), len(initial_projects) + 1)
        self.assertIsNotNone(added_project)
        self.assertEqual(data['project']['title'], added_project.title)

    def test_create_project_no_body(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Attempt to create project
        res = self.client().post('/projects', headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    def test_create_project_no_title(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Attempt to create project
        res = self.client().post('/projects', json={'some_field': 'some_data'},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    # PATCH '/projects/{project_id}' #
    def test_update_project(self):
        old_title = Project.query.get(self.project_1.id).title
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)
        new_title = Project.query.get(self.project_1.id).title

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertNotEqual(new_title, old_title)
        self.assertEqual(data['project']['title'], new_title)

    def test_update_project_no_body(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_title(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'some_field': 'some_data'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_id(self):
        # Attempt to update project
        res = self.client().patch('/projects',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertFalse(data['success'])

    def test_update_project_nonexistent_project(self):
        # Attempt to update project
        res = self.client().patch('/projects/2000',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/projects/{project_id}' #
    def test_delete_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete(f'/projects/{self.project_1.id}',
                                   headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        deleted_project = Project.query.get(self.project_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsNone(deleted_project)
        self.assertEqual(new_total, old_total - 1)

    def test_delete_project_nonexistent_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete('/projects/2000', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    # GET '/projects/{project_id}/sources' #
    def test_get_sources(self):
        res = self.client().get(f'/projects/{self.project_1.id}/sources',
                                headers=auth_header)
        data = json.loads(res.data)

        expected_sources = Project.query.get(self.project_1.id).sources
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['sources']), len(expected_sources))
        # Assert that only sources from this project were obtained
        for source in data['sources']:
            self.assertEqual(source['project_id'], self.project_1.id)

    def test_search_sources(self):
        query = quote('test1')
        path_str = f'/projects/{self.project_1.id}/sources?query={query}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['sources']), 1)  # Only source 1

    # POST '/projects/{project_id}/sources' #
    def test_create_source(self):
        old_total = len(Project.query.get(self.project_1.id).sources)
        res = self.client().post(f'/projects/{self.project_1.id}/sources',
                                 json={'url': self.new_source_url,
                                       'x_position': self.source_1.x_position,
                                       'y_position': self.source_1.y_position},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_source = data['source']
        self.assertIsNotNone(Source.query.get(added_source['id']))
        self.assertEqual(added_source['project_id'], self.project_1.id)
        self.assertEqual(added_source['url'], self.new_source_url)
        self.assertEqual(added_source['x_position'], self.source_1.x_position)
        self.assertEqual(added_source['y_position'], self.source_1.y_position)
        self.assertEqual(new_total, old_total + 1)

    def test_create_existing_source(self):
        old_total = len(Project.query.get(self.project_1.id).sources)
        res = self.client().post(f'/projects/{self.project_1.id}/sources',
                                 json={'url': self.source_1.url},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).sources)
        # Status code 200 since no new source was created
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['source']['id'], self.source_1.id)
        self.assertEqual(new_total, old_total)

    def test_create_source_no_body(self):
        old_items = Source.query.filter(Source.project_id == self.project_1.id)
        old_total = len(old_items.all())

        # Attempt to create project
        res = self.client().post(f'/projects/{self.project_1.id}/sources',
                                 headers=auth_header)
        data = json.loads(res.data)

        new_items = Source.query.filter(Source.project_id == self.project_1.id)
        new_total = len(new_items.all())
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    def test_create_source_no_url(self):
        old_items = Source.query.filter(Source.project_id == self.project_1.id)
        old_total = len(old_items.all())

        # Attempt to create project
        res = self.client().post(f'/projects/{self.project_1.id}/sources',
                                 json={'some_field': 'some_data'},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_items = Source.query.filter(Source.project_id == self.project_1.id)
        new_total = len(new_items.all())
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    def test_create_source_nonexistent_project(self):
        old_items = Source.query.filter(Source.project_id == self.project_1.id)
        old_total = len(old_items.all())

        # Attempt to create project
        res = self.client().post('/projects/2000/sources',
                                 json={'url': self.new_source_url},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_items = Source.query.filter(Source.project_id == self.project_1.id)
        new_total = len(new_items.all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    # POST '/projects/{project_id}/connections' #
    def test_create_connection_from_urls(self):
        # Assert that connection initially doesn't exist
        self.assertFalse(self.source_2 in self.source_1.next_sources)

        json_body = {
            'from_url': self.source_1.url,
            'to_url': self.source_2.url
        }
        res = self.client().post(f'/projects/{self.project_1.id}/connections',
                                 json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

    def test_create_connection_that_already_exists_from_urls(self):
        # Create a connection
        self.source_1.next_sources.append(self.source_2)
        self.source_1.update()
        self.assertTrue(self.source_2 in self.source_1.next_sources)

        json_body = {
            'from_url': self.source_1.url,
            'to_url': self.source_2.url
        }
        res = self.client().post(f'/projects/{self.project_1.id}/connections',
                                 json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)  # In this case, 200 is returned
        self.assertTrue(data['success'])
        # Assert that the connection is still there
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

    def create_connection_from_nonexistent_source_from_urls(self):
        # New source originally doesn't exist
        source = Source.query.filter(Source.project_id == self.project_1.id,
                                     Source.url == self.new_source_url).first()
        self.assertIsNone(source)

        json_body = {
            'from_url': self.source_1.url,
            'to_url': self.new_source_url
        }
        res = self.client().post(f'/projects/{self.project_1.id}/connections',
                                 json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        source = Source.query.filter(Source.project_id == self.project_1.id,
                                     Source.url == self.new_source_url).first()
        self.assertIsNotNone(source)
        self.assertTrue(source in self.source_1.next_sources)
        self.assertTrue(self.source_1 in source.prev_sources)

    def test_create_connection_no_body_from_urls(self):
        res = self.client().post(f'/projects/{self.project_1.id}/connections',
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_create_connection_incomplete_body_from_urls(self):
        json_body = {
            'from_url': self.source_1.url
        }
        res = self.client().post(f'/projects/{self.project_1.id}/connections',
                                 json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
