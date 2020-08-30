import json
import unittest

from manage import app, db
from app.main.models.models import Source, Project

def create_starter_data(user_id):
    project_1 = Project('Test Project 1', user_id)
    project_2 = Project('Test Project 2', user_id)

    source_1 = Source(url='https://test1.com',
                    title='Test Source 1',
                    content='This is the content of test source 1')

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

class TestConnectionsEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/connections'."""

    def setUp(self):
        """Define test variables and initialize app."""
        self.app = app
        self.client = self.app.test_client
        self.db = db
        self.user_id = 'auth0|5f4737ec9c5106006de161bc'
        self.jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE1OTg3NTYxOTksImV4cCI6MTU5ODg0MjU5OSwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.RvmT2O4j6o-YPkWWVjNscvMfX409qulp56biIVFxQky0xfKT6n-fjB3T5LHV2D_qUnB4BFubdeFFnM4aF1lso7yNgCZPP0GLD5FvP7L_fE1_kEpv_kxTLyWwIJTGXFyyGefY6wgOqQosM_w2FvGjW0F7TCUvh_87CWYpXX1F8lCIEQ8pzWL9eY9JCaKC6XnSUVG9stvq5CGg7-dxdo-5rM7_gyAeDPOEKlqUxVYEdcQSQbr3xViCgi3TVd6HrjYvYXVzcqV4_ZQxnEI0j_xObgKBZvRpqElyeDDpOIzxkDaVJAxPFXllJspJ1lEec-QG3WhIPfGGwEZVMMjsj_n1eA'
        self.auth_header = {'Authorization': f'Bearer {self.jwt}'}
        self.json_header = {'Content-Type': 'application/json'}

        with self.app.app_context():
            self.db.session.commit()
            self.db.drop_all()
            self.db.create_all()

        self.project_1, self.project_2, self.source_1, self.source_2, self.source_3 = create_starter_data(self.user_id)

    def tearDown(self):
        """Executed after each test."""
        pass

    ### POST '/connections/{from_id}/{to_id}' ###
    def test_create_connection(self):
        # Assert that connection initially doesn't exist
        self.assertFalse(self.source_2 in self.source_1.next_sources)

        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        # Assert that connection was created
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

    def test_create_connection_that_already_exists(self):
        # Create a connection
        self.source_1.next_sources.append(self.source_2)
        self.source_1.update()
        self.assertTrue(self.source_2 in self.source_1.next_sources)

        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)  # In this case, 200 is returned
        self.assertTrue(data['success'])
        # Assert that the connection is still there

    def test_create_connection_nonexistent_source(self):
        res = self.client().post(f'/connections/{self.source_1.id}/2000', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_create_connection_different_projects(self):
        res = self.client().post(f'/connections/{self.source_1.id}/{self.source_3.id}', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    ### DELETE '/connections/{from_id}/{to_id}' ###
    def test_delete_connection(self):
        # Create a connection
        self.source_1.next_sources.append(self.source_2)
        self.source_1.update()
        self.assertTrue(self.source_2 in self.source_1.next_sources)
        self.assertTrue(self.source_1 in self.source_2.prev_sources)

        # Delete the connection
        res = self.client().delete(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=self.auth_header)
        data = json.loads(res.data)

        # Observe results
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertFalse(self.source_2 in self.source_1.next_sources)
        self.assertFalse(self.source_1 in self.source_2.prev_sources)

    def test_delete_connection_nonexistent_source(self):
        res = self.client().delete(f'/connections/{self.source_1.id}/2000', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_delete_nonexistent_connection(self):
        res = self.client().delete(f'/connections/{self.source_1.id}/{self.source_2.id}', headers=self.auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])




if __name__ == '__main__':
    unittest.main()
