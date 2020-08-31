import json
import unittest

from manage import app, db
from app.test import create_starter_data, auth_header, user_id
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

        self.project_1, self.project_2, self.source_1, self.source_2, self.source_3 = create_starter_data()

        self.new_project = {
            'title': 'New Project',
            'user_id': user_id
        }

        self.new_source = {
            'url': 'https://newsource.com',
            'title': 'New Source',
            'content': "This is the new source's content"
        }

    def tearDown(self):
        """Executed after each test."""
        pass

    ### GET '/projects' ###
    # Only one test case since the endpoint is always successful for authenticated users
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

    ### POST '/projects' ###
    def test_create_project(self):
        initial_projects = Project.query.filter(Project.user_id == user_id).all()

        # Create project
        res = self.client().post('/projects', json={'title': self.new_project['title']}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        added_project = Project.query.get(data['project']['id'])
        self.assertEqual(len(new_projects), len(initial_projects) + 1)
        self.assertIsNotNone(added_project)
        self.assertEqual(data['project']['title'], added_project.title)

    def test_create_project_no_body(self):
        initial_projects = Project.query.filter(Project.user_id == user_id).all()

        # Attempt to create project
        res = self.client().post('/projects', headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    def test_create_project_no_title(self):
        initial_projects = Project.query.filter(Project.user_id == user_id).all()

        # Attempt to create project
        res = self.client().post('/projects', json={'some_field': 'some_data'}, headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    ### PATCH '/projects/{project_id}' ###
    def test_update_project(self):
        old_title = Project.query.get(self.project_1.id).title
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'title': self.new_project['title']}, headers=auth_header)
        data = json.loads(res.data)
        new_title = Project.query.get(self.project_1.id).title
        
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertNotEqual(new_title, old_title)
        self.assertEqual(data['project']['title'], new_title)

    def test_update_project_no_body(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_title(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'some_field': 'some_data'}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_id(self):
        # Attempt to update project
        res = self.client().patch('/projects', json={'title': self.new_project['title']}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertFalse(data['success'])

    def test_update_project_nonexistent_project(self):
        # Attempt to update project
        res = self.client().patch('/projects/2000', json={'title': self.new_project['title']}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    ### DELETE '/projects/{project_id}' ###
    def test_delete_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete(f'/projects/{self.project_1.id}', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        deleted_project = Project.query.get(self.project_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsNone(deleted_project)
        self.assertEqual(new_total, old_total - 1)

    def test_delete_project_nonexistent_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete(f'/projects/2000', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    ### GET '/projects/{project_id}/sources' ###
    # Only one test case since the endpoint is always successful for authenticated users
    def test_get_sources(self):
        res = self.client().get(f'/projects/{self.project_1.id}/sources', headers=auth_header)
        data = json.loads(res.data)

        expected_sources = Project.query.get(self.project_1.id).sources
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['sources']), len(expected_sources))
        # Assert that only sources from this project were obtained
        for source in data['sources']:
            self.assertEqual(source['project_id'], self.project_1.id)



        





