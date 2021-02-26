import json
import unittest

from app.test import create_starter_data, auth_header, app, db
from app.main.models.models import Item, Source


class TestItemsEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/items'."""

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
        self.cluster = items[8]

        self.new_item_note = {
            'is_note': True,
            'content': 'New content',
            'x_position': self.item_1.x_position + 100,
            'y_position': self.item_1.y_position + 100,
            'parent_project': self.project_2.id
        }

        self.new_item_highlight = {
            'is_note': False,
            'content': '"New highlight"',
            'x_position': self.item_1.x_position + 50,
            'y_position': self.item_1.y_position + 50,
            'parent_project': self.project_2.id
        }

        self.new_item_in_cluster = {
            'url': self.source_1.url,
            'is_note': False,
            'content': 'Item in cluster',
            'x_position': self.item_1.x_position + 50,
            'y_position': self.item_1.y_position + 50,
            'parent_cluster': self.cluster.id
        }

    def tearDown(self):
        """Executed after each test."""
        pass

    # GET '/items/{item_id}' #
    def test_get_item_detail(self):
        res = self.client().get(f'/items/{self.item_1.id}',
                                headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        item = data['item']
        self.assertEqual(item['id'], self.item_1.id)
        self.assertEqual(item['content'], self.item_1.content)
        self.assertEqual(item['x_position'], self.item_1.x_position)
        self.assertEqual(item['y_position'], self.item_1.y_position)
        self.assertEqual(item['parent_project'], self.item_1.parent_project)

    def test_get_item_detail_nonexistent_item(self):
        res = self.client().get('/items/2000', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/items/{item_id}' #
    def test_delete_item(self):
        old_total = len(Item.query.filter(
            Item.parent_project == self.item_1.parent_project
        ).all())
        res = self.client().delete(f'/items/{self.item_1.id}',
                                   headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Item.query.filter(
            Item.parent_project == self.item_1.parent_project
        ).all())
        deleted_item = Item.query.get(self.project_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsNone(deleted_item)
        self.assertEqual(new_total, old_total - 1)

    def test_delete_item_nonexistent_item(self):
        old_total = len(Item.query.filter(
            Item.parent_project == self.item_1.parent_project
        ).all())
        res = self.client().delete('/items/2000', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Item.query.filter(
            Item.parent_project == self.item_1.parent_project
        ).all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    # PATCH '/items/{item_id}' #
    def test_update_item(self):
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  json=self.new_item_note, headers=auth_header)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        item = data['item']
        self.assertEqual(item['content'], self.new_item_note['content'])
        self.assertEqual(item['x_position'], self.new_item_note['x_position'])
        self.assertEqual(item['y_position'], self.new_item_note['y_position'])
        self.assertEqual(item['parent_project'], self.new_item_note['parent_project'])
        self.assertTrue(self.item_1 in self.project_2.items)
        self.assertTrue(self.item_1 not in self.project_1.items)

    def test_update_item_no_body(self):
        # Attempt to update item
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_item_no_data_in_body(self):
        # Attempt to update source
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  json={'some_field': 'some_data'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_item_no_id(self):
        # Attempt to update source
        res = self.client().patch('/items', json=self.new_item_note,
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertFalse(data['success'])

    def test_update_item_nonexistent_items(self):
        # Attempt to update item
        res = self.client().patch('/items/2000', json=self.new_item_note,
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_update_item_invalid_x_position(self):
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  json={'x_position': 'not int'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_item_invalid_y_position(self):
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  json={'y_position': 'not int'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_item_nonexistent_project(self):
        res = self.client().patch(f'/items/{self.item_1.id}',
                                  json={'parent_project': 2000},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_create_item_inside_cluster(self):
        self.assertEqual(len(self.cluster.child_items), 1)
        res = self.client().post('/items',
                                 json=self.new_item_in_cluster,
                                 headers=auth_header)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(self.cluster.child_items), 2)
