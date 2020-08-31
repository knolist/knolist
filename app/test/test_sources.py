import json
import unittest

from manage import app, db
from app.test import create_starter_data, auth_header, user_id
from app.main.models.models import Project, Source

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

        self.project_1, self.project_2, self.source_1, self.source_2, self.source_3 = create_starter_data()

    def tearDown(self):
        """Executed after each test."""
        pass

    ### GET '/sources/{source_id}' ###
    def test_get_source_detail(self):
        res = self.client().get(f'/sources/{self.source_1.id}', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(source['id'], self.source_1.id)
        self.assertEqual(source['url'], self.source_1.url)
        self.assertEqual(source['title'], self.source_1.title)
        self.assertEqual(source['content'], self.source_1.content)
        self.assertEqual(len(source['highlights']), len(json.loads(self.source_1.highlights)))
        self.assertEqual(len(source['notes']), len(json.loads(self.source_1.notes)))
        self.assertEqual(source['x_position'], self.source_1.x_position)
        self.assertEqual(source['y_position'], self.source_1.y_position)
        self.assertEqual(source['project_id'], self.source_1.project_id)

    def test_get_source_detail_nonexistent_source(self):
        res = self.client().get('/sources/2000', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])