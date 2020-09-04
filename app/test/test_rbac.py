import json
import unittest

from app.test import create_starter_data, other_user_jwt, app, db, auth_header

class TestRBAC(unittest.TestCase):
    """This class contains tests related to RBAC (Role-Based Access Control)."""

    def setUp(self):
        """Define test variables and initalize app."""
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

    def test_search_unauthorized_role(self):
        # Expected to fail, since search is a premium feature
        regular_user_auth_header = {'Authorization': f'Bearer {other_user_jwt}'}
        res = self.client().get(f'/projects/{self.project_1.id}/sources?query=test', headers=regular_user_auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 403)
        self.assertFalse(data['success'])

    def test_search_authorized_role(self):
        # Expected to succeed, since search is a premium feature
        res = self.client().get(f'/projects/{self.project_1.id}/sources?query=test', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

    def test_get_sources_regular_user(self):
        # Expected to succeed, since this endpoint is available to all users
        regular_user_auth_header = {'Authorization': f'Bearer {other_user_jwt}'}
        res = self.client().get(f'/projects/{self.project_1.id}/sources', headers=regular_user_auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

    def test_get_sources_premium_user(self):
        # Expected to succeed, since this endpoint is available to all users
        res = self.client().get(f'/projects/{self.project_1.id}/sources', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
