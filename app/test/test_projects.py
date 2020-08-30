import json
import unittest

from manage import app, db
from app.test import create_starter_data, auth_header, json_header

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

    def tearDown(self):
        """Executed after each test."""
        pass

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



