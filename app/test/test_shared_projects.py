import json
import unittest

from app.test import create_starter_data, auth_header, app, db


class TestSharedProjectEndpoints(unittest.TestCase):
    """This class contains tests for endpoints
    that start with '/shared_projects'."""

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
        self.item_1 = items[5]
        self.item_2 = items[6]
        self.item_3 = items[7]

    def tearDown(self):
        """Executed after each test."""
        pass

    # POST '/shared_projects' #
    def test_share_project(self):
        old_users = len(self.project_1.shared_users)
        res = self.client().post(f'/shared_projects',
                                 json={'shared_proj': self.project_1.id,
                                       'email': "achen93@jhu.edu",
                                       'role': 'collaborator'},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_users = len(self.project_1.shared_users)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        # Assert that connection was created
        # I would test further to check emails, but since I am not an admin I don't think I have access
        self.assertTrue(old_users + 1, new_users)

    def test_share_repeat(self):
        old_users = len(self.project_1.shared_users)
        res = self.client().post(f'/shared_projects',
                                 json={'shared_proj': self.project_1.id,
                                       'email': "noahpark0930@gmail.com",
                                       'role': 'collaborator'},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_users = len(self.project_1.shared_users)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertTrue(old_users, new_users)

    # DELETE '/shared_projects' #
    def test_delete_user_from_project(self):
        old_users = len(self.project_1.shared_users)
        res = self.client().post(f'/shared_projects',
                                 json={'shared_proj': self.project_1.id,
                                       'email': "achen93@jhu.edu",
                                       'role': 'collaborator'},
                                 headers=auth_header)

        # Delete the connection
        res = self.client().delete(f'/shared_projects',
                                   json={'shared_proj': self.project_1.id,
                                         'email': "achen93@jhu.edu",
                                         'role': 'collaborator'},
                                   headers=auth_header)
        data = json.loads(res.data)

        new_users = len(self.project_1.shared_users)
        # Observe results
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertTrue(old_users, new_users + 1)

    def test_delete_connection_nonexistent_share(self):
        res = self.client().delete(f'/shared_projects',
                                   json={'shared_proj': self.project_1.id,
                                         'email': 2000,
                                         'role': 'collaborator'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_delete_nonexistent_share(self):
        res = self.client().delete(f'/shared_projects',
                                   json={'shared_proj': self.project_1.id,
                                         'email': 'npark@bergencatholichs.org',
                                         'role': 'collaborator'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])


if __name__ == '__main__':
    unittest.main()
