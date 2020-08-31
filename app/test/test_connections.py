import json
import unittest

from manage import app, db
from app.test import create_starter_data, auth_header

class TestConnectionsEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/connections'."""

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

    ### POST '/connections/{from_id}/{to_id}' ###
    def test_create_connection_from_ids(self):
        # Assert that connection initially doesn't exist
        self.assertFalse(self.source_2 in self.source_1.next_sources)

        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        # Assert that connection was created
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

    def test_create_connection_that_already_exists_from_ids(self):
        # Create a connection
        self.source_1.next_sources.append(self.source_2)
        self.source_1.update()
        self.assertTrue(self.source_2 in self.source_1.next_sources)

        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)  # In this case, 200 is returned
        self.assertTrue(data['success'])
        # Assert that the connection is still there
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

    def test_create_connection_nonexistent_source_from_ids(self):
        res = self.client().post(f'/connections/{self.source_1.id}/2000', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_create_connection_different_projects_from_ids(self):
        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_3.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])
        self.assertFalse(self.source_3 in self.source_1.next_sources)
        self.assertFalse(self.source_1 in self.source_3.prev_sources)

    ### DELETE '/connections/{from_id}/{to_id}' ###
    def test_delete_connection(self):
        # Create a connection
        self.source_1.next_sources.append(self.source_2)
        self.source_1.update()
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

        # Delete the connection
        res = self.client().delete(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=auth_header)
        data = json.loads(res.data)

        # Observe results
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertFalse(self.source_2 in self.source_1.next_sources)
        self.assertFalse(self.source_1 in self.source_2.prev_sources)

    def test_delete_connection_nonexistent_source(self):
        res = self.client().delete(f'/connections/{self.source_1.id}/2000', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_delete_nonexistent_connection(self):
        res = self.client().delete(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
