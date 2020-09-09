import json
import unittest

from app.test import create_starter_data, other_user_jwt, app, db, auth_header


class TestRBAC(unittest.TestCase):
    """This class contains tests related to RBAC
    (Role-Based Access Control)."""

    def setUp(self):
        """Define test variables and initalize app."""
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

    def tearDown(self):
        """Executed after each test."""
        pass

    def test_search_unauthorized_role(self):
        # Expected to fail, since search is a premium feature
        regular_user_auth_header = {
            'Authorization': f'Bearer {other_user_jwt}'
        }
        path_str = f'/projects/{self.project_1.id}/sources?query=test'
        res = self.client().get(path_str, headers=regular_user_auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 403)
        self.assertFalse(data['success'])

    def test_search_authorized_role(self):
        # Expected to succeed, since search is a premium feature
        path_str = f'/projects/{self.project_1.id}/sources?query=test'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

    def test_get_projects_regular_user(self):
        # Expected to succeed, since this endpoint is available to all users
        regular_user_auth_header = {
            'Authorization': f'Bearer {other_user_jwt}'
        }
        res = self.client().get('/projects', headers=regular_user_auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

    def test_get_projects_premium_user(self):
        # Expected to succeed, since this endpoint is available to all users
        res = self.client().get('/projects', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
