import json
import unittest
from urllib.parse import quote

from app.test import create_starter_data, auth_header, user_id, app, db
from app.main.models.models import Project, Source, Item, Cluster


class TestProjectsEndpoints(unittest.TestCase):
    """This class contains tests for endpoints that start with '/projects'."""

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

        self.new_project_title = 'New Project'

        self.new_source_url = 'https://en.wikipedia.org/wiki/Test'

        self.new_item_only_note = {
            'content': 'This is a new pure note item',
            'is_note': True,
            'parent_project': self.project_1.id
        }

        self.new_item_only_highlight = {
            'content': '"This is a new highlight item"',
            'is_note': False,
            'parent_project': self.project_1.id
        }

        self.new_item_note_url_first = {
            'url': 'https://en.wikipedia.org/wiki/WandaVision',
            'content': 'This is a first note',
            'parent_project': self.project_1.id,
            'is_note': True
        }

        self.new_item_note_url = {
            'url': 'https://en.wikipedia.org/wiki/WandaVision',
            'content': 'This is a new note url item',
            'parent_project': self.project_1.id,
            'is_note': True
        }

        self.new_item_note_new_url = {
            'url': 'https://en.wikipedia.org/wiki/Aunty_Donna',
            'content': 'This is a new note and a new url item',
            'parent_project': self.project_1.id,
            'is_note': True
        }

        # Used to test that a new item can be made with the same url
        self.new_item_url_first = {
            'url': 'https://en.wikipedia.org/wiki/Odunlade_Adekola',
            'content': '"This is a new highlight url item first"',
            'parent_project': self.project_2.id,
            'is_note': False
        }

        self.new_item_highlight_url = {
            'url': 'https://en.wikipedia.org/wiki/Odunlade_Adekola',
            'content': '"This is a new highlight url item"',
            'parent_project': self.project_2.id,
            'is_note': False
        }

        self.new_item_highlight_new_url = {
            'url': 'https://en.wikipedia.org/'
                   'wiki/Michael_Jackson%27s_Thriller',
            'content': '"This is a highlight item with a new url"',
            'parent_project': self.project_2.id,
            'is_note': True
        }

        self.new_item_url = {
            'url': 'https://en.wikipedia.org/wiki/George_Michael',
            'content': None,
            'parent_project': self.project_1.id,
            'is_note': False
        }

        self.new_item_repeat_url = {
            'url': self.source_1.url,
            'content': None,
            'parent_project': self.project_1.id,
            'is_note': False
        }

        self.new_item_same_note = {
            'url': None,
            'content': self.item_1.content,
            'parent_project': self.project_1.id,
            'is_note': True
        }

    def tearDown(self):
        """Executed after each test."""
        pass

    # GET '/projects' #
    # Only one test case since the endpoint
    # is always successful for authenticated users
    def test_get_projects(self):
        res = self.client().get('/projects', headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        projects = data['projects']
        # 2
        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]['id'], self.project_1.id)
        self.assertEqual(projects[0]['title'], self.project_1.title)
        self.assertEqual(projects[1]['id'], self.project_2.id)
        self.assertEqual(projects[1]['title'], self.project_2.title)

    # POST '/projects' #
    def test_create_project(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Create project
        res = self.client().post('/projects',
                                 json={'title': self.new_project_title},
                                 headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        added_project = Project.query.get(data['project']['id'])
        self.assertEqual(len(new_projects), len(initial_projects) + 1)
        self.assertIsNotNone(added_project)
        self.assertEqual(data['project']['title'], added_project.title)

    def test_create_project_no_body(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Attempt to create project
        res = self.client().post('/projects', headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    def test_create_project_no_title(self):
        temp_filter = Project.query.filter(Project.user_id == user_id)
        initial_projects = temp_filter.all()

        # Attempt to create project
        res = self.client().post('/projects', json={'some_field': 'some_data'},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_projects = Project.query.filter(Project.user_id == user_id).all()
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(len(new_projects), len(initial_projects))

    # PATCH '/projects/{project_id}' #
    def test_update_project(self):
        old_title = Project.query.get(self.project_1.id).title
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)
        new_title = Project.query.get(self.project_1.id).title

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertNotEqual(new_title, old_title)
        self.assertEqual(data['project']['title'], new_title)

    def test_update_project_no_body(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_title(self):
        # Attempt to update project
        res = self.client().patch(f'/projects/{self.project_1.id}',
                                  json={'some_field': 'some_data'},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_update_project_no_id(self):
        # Attempt to update project
        res = self.client().patch('/projects',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertFalse(data['success'])

    def test_update_project_nonexistent_project(self):
        # Attempt to update project
        res = self.client().patch('/projects/2000',
                                  json={'title': self.new_project_title},
                                  headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])

    # DELETE '/projects/{project_id}' #
    def test_delete_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete(f'/projects/{self.project_1.id}',
                                   headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        deleted_project = Project.query.get(self.project_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsNone(deleted_project)
        self.assertEqual(new_total, old_total - 1)

    def test_delete_project_nonexistent_project(self):
        old_total = len(Project.query.filter(Project.user_id == user_id).all())
        res = self.client().delete('/projects/2000', headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.filter(Project.user_id == user_id).all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    # GET '/projects/{project_id}/sources' #
    def test_get_sources(self):
        res = self.client().get(f'/projects/{self.project_1.id}/sources',
                                headers=auth_header)
        data = json.loads(res.data)

        expected_sources = Project.query.get(self.project_1.id).sources
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['sources']), len(expected_sources))
        # Assert that only sources from this project were obtained
        for source in data['sources']:
            self.assertEqual(source['project_id'], self.project_1.id)

    # GET '/projects/{project_id}/items' #
    def test_get_items(self):
        res = self.client().get(f'/projects/{self.project_1.id}/items',
                                headers=auth_header)
        data = json.loads(res.data)

        expected_items = Project.query.get(self.project_1.id).items
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['items']), len(expected_items))
        # Assert that only items form this project were obtained
        for item in data['items']:
            self.assertEqual(item['parent_project'], self.project_1.id)

    # GET '/projects/{project_id}/statistics' #
    def test_get_statistics_1(self):
        res = self.client().get(f'/projects/{self.project_1.id}/statistics',
                                headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['counts']['num_sources'], 2)
        self.assertEqual(data['counts']['num_items'], 2)
        self.assertEqual(data['counts']['num_clusters'], 1)
        self.assertEqual(data['avg_depth_per_item'], 0.5)
        self.assertEqual(data['max_depth'], 1)
        self.assertEqual(data['counts']['num_notes'], 2)

        url_breakdown = data['url_breakdown']
        self.assertEqual(url_breakdown["www.nationalgeographic.com"], 1)
        self.assertEqual(url_breakdown["www.messenger.com"], 1)

    # GET '/projects/{project_id}/statistics' #
    def test_get_statistics_2(self):
        res = self.client().get(f'/projects/{self.project_2.id}/statistics',
                                headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['counts']['num_sources'], 1)
        self.assertEqual(data['counts']['num_items'], 1)
        self.assertEqual(data['counts']['num_clusters'], 0)
        self.assertEqual(data['avg_depth_per_item'], 0)
        self.assertEqual(data['max_depth'], 0)
        self.assertEqual(data['counts']['num_notes'], 0)

        url_breakdown = data['url_breakdown']
        self.assertEqual(url_breakdown["www.test3.com"], 1)


    def test_get_all_stats(self):
        res = self.client().get(f'/projects/statistics',
                                headers=auth_header)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(data), 2)


    def test_single_filter_search_items(self):
        query = quote('Source')
        filter = quote('title')
        path_str = f'/projects/{self.project_1.id}/items?query={query}&filter={filter}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['items']), 2)  # All items of project 1

    def test_single_filter_search_items_no_match(self):
        query = quote('a')
        filter = quote('content')
        path_str = f'/projects/{self.project_1.id}/items?query={query}&filter={filter}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['items']), 0)  # None of the sources

    def test_multiple_filter_search_items(self):
        query = quote('1')
        filter_one = quote('notes')
        filter_two = quote('url')
        path_str = f'/projects/{self.project_1.id}/items?query={query}&filter={filter_one}&filter={filter_two}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['items']), 1)  # Only source 1

    def test_multiple_filter_search_items_no_match(self):
        query = quote('knolist')
        filter_one = quote('url')
        filter_two = quote('content')
        filter_three = quote('title')
        path_str = f'/projects/{self.project_1.id}/items?query={query}&filter={filter_one}&filter={filter_two}&filter={filter_three}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['items']), 0)  # No sources have knolist


    def test_search_sources(self):
        query = quote('test1')
        path_str = f'/projects/{self.project_1.id}/sources?query={query}'
        res = self.client().get(path_str, headers=auth_header)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['sources']), 1)  # Only source 1

    # POST '/items' #
    def test_create_item_note_only(self):

        old_total = len(Project.query.get(self.project_1.id).items)
        res = self.client().post(f'/items',
                                 json=self.new_item_only_note,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['url'], None)
        self.assertEqual(new_total, old_total + 1)

    # POST '/items' #
    def test_create_item_note_old_url(self):
        old_total = len(Project.query.get(self.project_1.id).items)
        old_sources = len(Project.query.get(self.project_1.id).sources)
        res_first = self.client().post(f'/items',
                                       json=self.new_item_note_url_first,
                                       headers=auth_header)
        res = self.client().post(f'/items',
                                 json=self.new_item_note_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        new_sources = len(Project.query.get(self.project_1.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['url'],
                         'https://en.wikipedia.org/wiki/WandaVision')
        self.assertEqual(new_total, old_total + 2)
        self.assertEqual(new_sources, old_sources + 1)

    # POST '/items' #
    def test_create_item_highlight_old_url(self):
        old_total = len(Project.query.get(self.project_2.id).items)
        old_sources = len(Project.query.get(self.project_2.id).sources)
        res_first = self.client().post(f'/items',
                                       json=self.new_item_url_first,
                                       headers=auth_header)
        res = self.client().post(f'/items',
                                 json=self.new_item_highlight_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_2.id).items)
        new_sources = len(Project.query.get(self.project_2.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_2.id)
        self.assertEqual(added_item['url'],
                         'https://en.wikipedia.org/wiki/Odunlade_Adekola')
        self.assertEqual(new_total, old_total + 2)
        self.assertEqual(new_sources, old_sources + 1)

    # POST '/items' #
    def test_create_item_note_new_url(self):
        old_total = len(Project.query.get(self.project_1.id).items)
        old_sources = len(Project.query.get(self.project_1.id).sources)
        res = self.client().post(f'/items',
                                 json=self.new_item_note_new_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        new_sources = len(Project.query.get(self.project_1.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['url'],
                         'https://en.wikipedia.org/wiki/Aunty_Donna')
        self.assertEqual(new_total, old_total + 1)
        self.assertEqual(new_sources, old_sources + 1)

    # POST '/items' #
    def test_create_item_highlight_new_url(self):
        old_total = len(Project.query.get(self.project_2.id).items)
        old_sources = len(Project.query.get(self.project_2.id).sources)
        res = self.client().post(f'/items',
                                 json=self.new_item_highlight_new_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_2.id).items)
        new_sources = len(Project.query.get(self.project_2.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_2.id)
        self.assertEqual(added_item['url'],
                         'https://en.wikipedia.org/wiki/'
                         'Michael_Jackson%27s_Thriller')
        self.assertEqual(new_total, old_total + 1)
        self.assertEqual(new_sources, old_sources + 1)

    # POST '/items' #
    def test_create_item_url(self):
        old_total = len(Project.query.get(self.project_1.id).items)
        old_sources = len(Project.query.get(self.project_1.id).sources)
        res = self.client().post(f'/items',
                                 json=self.new_item_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        new_sources = len(Project.query.get(self.project_1.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['url'],
                         'https://en.wikipedia.org/wiki/George_Michael')
        self.assertEqual(new_total, old_total + 1)
        self.assertEqual(new_sources, old_sources + 1)

    # POST '/items' #
    def test_create_item_repeat_url(self):
        old_total = len(Project.query.get(self.project_1.id).items)
        old_sources = len(Project.query.get(self.project_1.id).sources)
        res = self.client().post(f'/items',
                                 json=self.new_item_repeat_url,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        new_sources = len(Project.query.get(self.project_1.id).sources)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertIsNotNone(Item.query.get(added_item['id']))
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['url'], self.source_1.url)
        self.assertEqual(new_total, old_total + 1)
        self.assertEqual(new_sources, old_sources)

    def test_create_existing_item_note(self):
        old_total = len(Project.query.get(self.project_1.id).items)
        res = self.client().post(f'/items',
                                 json=self.new_item_same_note,
                                 headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Project.query.get(self.project_1.id).items)
        # Status code 201 since a new item was made
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        added_item = data['item']
        self.assertEqual(added_item['parent_project'], self.project_1.id)
        self.assertEqual(added_item['content'],
                         self.new_item_same_note['content'])
        self.assertEqual(new_total, old_total + 1)

    def test_create_item_no_body(self):
        old_items = Item.query.filter(Item.parent_project == self.project_1.id)
        old_total = len(old_items.all())

        res = self.client().post(f'/items',
                                 headers=auth_header)
        data = json.loads(res.data)

        new_items = Item.query.filter(Item.parent_project == self.project_1.id)
        new_total = len(new_items.all())
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    def test_create_item_nonexistent_project(self):
        old_items = Item.query.filter(Item.parent_project == self.project_1.id)
        old_total = len(old_items.all())

        # Attempt to create project
        res = self.client().post('/items',
                                 json={'url': self.new_source_url,
                                       'parent_project': 2000},
                                 headers=auth_header)
        data = json.loads(res.data)

        new_items = Item.query.filter(Item.parent_project == self.project_1.id)
        new_total = len(new_items.all())
        self.assertEqual(res.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(new_total, old_total)

    def test_project_no_clusters(self):
        # json_body = {}
        res = self.client().get(f'/projects/{self.project_2.id}/clusters',
                                headers=auth_header)
        data = json.loads(res.data)
        self.assertEqual(len(data['clusters']), 0)

    def test_project_with_clusters(self):
        res = self.client().get(f'/projects/{self.project_1.id}/clusters',
                                headers=auth_header)
        data = json.loads(res.data)
        self.assertEqual(len(data['clusters']), 1)

    def test_get_content_similarity_matrix(self):
        res = self.client().get(f'/projects/{self.project_1.id}/similarity',
                                        headers=auth_header)
        data = json.loads(res.data)
        print(data)
        for i in range(len(data['index'])):
            for j in range(i + 1):
                self.assertTrue(data['similarity'][str(i)][str(j)] >= 0.)
                self.assertTrue(data['similarity'][str(i)][str(j)] <= 1.)
        self.assertTrue(data['success'])