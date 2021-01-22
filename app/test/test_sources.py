import json
import unittest

from app.test import create_starter_data, auth_header, app, db
from app.main.models.models import Source


class TestSourcesEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/sources'."""

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

        self.new_source = {
            'title': 'New title',
            'content': 'New content',
            'project_id': self.project_2.id
        }

    def tearDown(self):
        """Executed after each test."""
        pass

    # GET '/sources/{source_id}' #
    def test_get_source_detail(self):
        res = self.client().get(f'/sources/{self.source_1.id}',
                                headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(source['id'], self.source_1.id)
        self.assertEqual(source['url'], self.source_1.url)
        self.assertEqual(source['title'], self.source_1.title)
        self.assertEqual(source['project_id'], self.source_1.project_id)

    def test_get_source_detail_nonexistent_source(self):
        res = self.client().get('/sources/2000', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/sources/{source_id}' #
    def test_delete_source(self):
        old_total = len(Source.query.filter(
            Source.project_id == self.source_1.project_id
        ).all())
        res = self.client().delete(f'/sources/{self.source_1.id}',
                                   headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Source.query.filter(
            Source.project_id == self.source_1.project_id
        ).all())
        deleted_source = Source.query.get(self.project_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsNone(deleted_source)
        self.assertEqual(new_total, old_total - 1)

    def test_delete_source_nonexistent_source(self):
        old_total = len(Source.query.filter(
            Source.project_id == self.source_1.project_id
        ).all())
        res = self.client().delete('/sources/2000', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Source.query.filter(
            Source.project_id == self.source_1.project_id
        ).all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    # PATCH '/sources/{source_id}' #
    def test_update_source(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json=self.new_source, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(source['title'], self.new_source['title'])
        self.assertEqual(source['project_id'], self.new_source['project_id'])
        self.assertTrue(self.source_1 in self.project_2.sources)
        self.assertTrue(self.source_1 not in self.project_1.sources)

    def test_update_source_no_body(self):
        # Attempt to update source
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_source_no_data_in_body(self):
        # Attempt to update source
        res = self.client().patch(f'/sources/{self.project_1.id}',
                                  json={'some_field': 'some_data'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_source_no_id(self):
        # Attempt to update source
        res = self.client().patch('/sources', json=self.new_source,
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertFalse(data['success'])

    def test_update_source_nonexistent_source(self):
        # Attempt to update source
        res = self.client().patch('/sources/2000', json=self.new_source,
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_update_source_invalid_x_position(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'x_position': 'not int'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_source_invalid_y_position(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'y_position': 'not int'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_source_nonexistent_project(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'project_id': 2000},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_source_project_with_already_existing_url(self):
        # Create source with same URL as source 1, but in project 2
        other_source = Source(url=self.source_1.url, title=self.source_1.title)
        self.project_2.sources.append(other_source)
        other_source.insert()

        # Attempt to change source 1's project ID to project 2
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'project_id': 2}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])
<<<<<<< HEAD

    def test_get_by_good_url(self):
        good_url = 'https://test1.com'

        res = self.client().get(f'/sources',
                                json={'url': good_url},
                                headers=auth_header)

        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        source = data['source']
        self.assertEqual(source['url'], good_url)

    def test_get_by_nonexistent_url(self):
        bad_url = 'https://test100.com'
        res = self.client().get(f'/sources',
                                json={'url': bad_url},
                                headers=auth_header)

        data = json.loads(res.data)
        self.assertEqual(res.status_code, 404)


=======
>>>>>>> updated-api
