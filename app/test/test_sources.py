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
            'highlights': ['New highlight'],
            'notes': ['New notes'],
            'x_position': self.source_1.x_position + 100,
            'y_position': self.source_1.y_position + 100,
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
        self.assertEqual(len(source['highlights']),
                         len(json.loads(self.source_1.highlights)))
        self.assertEqual(len(source['notes']),
                         len(json.loads(self.source_1.notes)))
        self.assertEqual(source['x_position'], self.source_1.x_position)
        self.assertEqual(source['y_position'], self.source_1.y_position)
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
        self.assertEqual(source['highlights'], self.new_source['highlights'])
        self.assertEqual(source['notes'], self.new_source['notes'])
        self.assertEqual(source['x_position'], self.new_source['x_position'])
        self.assertEqual(source['y_position'], self.new_source['y_position'])
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

    def test_update_source_invalid_highlights(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'highlights': 'not list'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_source_invalid_notes(self):
        res = self.client().patch(f'/sources/{self.source_1.id}',
                                  json={'notes': 'not list'},
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

    # POST '/sources/{source_id}/highlights' #
    def test_add_highlights(self):
        highlight = 'New highlight'
        old_highlights = json.loads(
            Source.query.get(self.source_1.id).highlights
        )
        res = self.client().post(f'/sources/{self.source_1.id}/highlights',
                                 json={'highlight': highlight},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(len(source['highlights']), len(old_highlights) + 1)
        self.assertEqual(source['highlights'][-1], highlight)

    def test_add_highlights_no_body(self):
        res = self.client().post(f'/sources/{self.project_1.id}/highlights',
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_add_highlights_no_highlight(self):
        res = self.client().post(f'/sources/{self.project_1.id}/highlights',
                                 json={'some_field': 'some_data'},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_add_highlights_nonexistent_project(self):
        highlight = 'New highlight'
        res = self.client().post('/sources/2000/highlights',
                                 json={'highlight': highlight},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/sources/{source_id}/highlights' #
    def test_delete_highlights(self):
        old_highlights = json.loads(self.source_1.highlights)
        indices_to_delete = [0, 1]
        res = self.client().delete(f'/sources/{self.source_1.id}/highlights',
                                   json={'delete': indices_to_delete},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(len(source['highlights']),
                         len(old_highlights) - len(indices_to_delete))

    def test_delete_highlights_no_body(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/highlights',
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_highlights_no_indices(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/highlights',
                                   json={'some_field': 'some_data'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_highlights_invalid_indices_format(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/highlights',
                                   json={'delete': 'not list'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_highlights_nonexistent_project(self):
        indices_to_delete = [0, 1]
        res = self.client().delete('/sources/2000/highlights',
                                   json={'delete': indices_to_delete},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # POST '/sources/{source_id}/notes' #
    def test_add_notes(self):
        note = 'New note'
        old_notes = json.loads(Source.query.get(self.source_1.id).notes)
        res = self.client().post(f'/sources/{self.source_1.id}/notes',
                                 json={'note': note}, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(len(source['notes']), len(old_notes) + 1)
        self.assertEqual(source['notes'][-1], note)

    def test_add_highlighnotey(self):
        res = self.client().post(f'/sources/{self.project_1.id}/notes',
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_add_notes_no_note(self):
        res = self.client().post(f'/sources/{self.project_1.id}/notes',
                                 json={'some_field': 'some_data'},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_add_notes_nonexistent_project(self):
        note = 'New note'
        res = self.client().post('/sources/2000/notes',
                                 json={'note': note},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/sources/{source_id}/notes' #
    def test_delete_notes(self):
        old_notes = json.loads(self.source_1.notes)
        indices_to_delete = [0, 1]
        res = self.client().delete(f'/sources/{self.source_1.id}/notes',
                                   json={'delete': indices_to_delete},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        source = data['source']
        self.assertEqual(len(source['notes']),
                         len(old_notes) - len(indices_to_delete))

    def test_delete_notes_no_body(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/notes',
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_notes_no_indices(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/notes',
                                   json={'some_field': 'some_data'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_notes_invalid_indices_format(self):
        res = self.client().delete(f'/sources/{self.source_1.id}/notes',
                                   json={'delete': 'not list'},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_delete_notes_nonexistent_project(self):
        indices_to_delete = [0, 1]
        res = self.client().delete('/sources/2000/notes',
                                   json={'delete': indices_to_delete},
                                   headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    def test_update_note(self):
        index_to_update = 0
        old_note = json.loads(self.source_1.notes)[index_to_update]
        new_content = 'This is the new content'
        json_body = {
            'note_index': index_to_update,
            'new_content': new_content
        }
        res = self.client().patch(f'/sources/{self.source_1.id}/notes',
                                  json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        new_note = data['source']['notes'][index_to_update]
        self.assertEqual(new_note, new_content)
        self.assertNotEqual(new_note, old_note)

    def test_update_note_no_body(self):
        res = self.client().patch(f'/sources/{self.source_1.id}/notes',
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_note_missing_field(self):
        json_body = {
            'note_index': 0  # Missing content
        }
        res = self.client().patch(f'/sources/{self.source_1.id}/notes',
                                  json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_note_invalid_index(self):
        json_body = {
            'note_index': 99999,
            'new_content': 'New content'
        }
        res = self.client().patch(f'/sources/{self.source_1.id}/notes',
                                  json=json_body, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 422)
        self.assertFalse(data['success'])

    def test_update_note_nonexistent_source(self):
        json_body = {
            'note_index': 0,
            'new_content': 'New content'
        }
        res = self.client().patch('/sources/2000/notes', json=json_body,
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
