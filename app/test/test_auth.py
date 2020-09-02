import json
import unittest

from manage import app, db
from app.test import create_starter_data, other_user_jwt

class TestAuthentication(unittest.TestCase):
    """This class contains tests related to authentication. Not all endpoints are tested, for simplicity's sake."""
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

    def test_auth_missing_authorization_header(self):
        res = self.client().get(f'/sources/{self.source_1.id}')
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_auth_not_bearer_token(self):
        auth_header = {'Authorization': 'not bearer'}
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_auth_missing_token(self):
        auth_header = {'Authorization': 'Bearer'}
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_auth_too_long_header(self):
        auth_header = {'Authorization': 'Bearer too long'}
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_auth_invalid_token(self):
        auth_header = {'Authorization': 'Bearer some_random_token'}
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_auth_incorrect_user(self):
        auth_header = {'Authorization': f'Bearer {other_user_jwt}'}
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 403)
        self.assertFalse(data['success'])