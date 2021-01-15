import json
import unittest

from app.test import create_starter_data, auth_header, app, db
from app.main.models.models import Cluster


class TestClustersEndpoints(unittest.TestCase):

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
        self.cluster_1 = items[5]

        self.new_source = {
            'title': 'New title',
            'content': 'New content',
            'x_position': self.source_1.x_position + 100,
            'y_position': self.source_1.y_position + 100,
            'project_id': self.project_2.id
        }

    def tearDown(self):
        """Executed after each test."""
        pass

    # GET '/sources/{source_id}' #
    def test_get_cluster_detail(self):

        res = self.client().get(f'/clusters/{self.cluster_1.id}',
                                headers=auth_header)

        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        cluster = data['cluster']
        self.assertEqual(cluster['name'], self.cluster_1.name)
        self.assertEqual(cluster['x_position'], self.cluster_1.x_position)
        self.assertEqual(cluster['y_position'], self.cluster_1.y_position)
        self.assertEqual(len(cluster['child_clusters']), 0)
        self.assertEqual(len(cluster['child_items']), 1)

    def test_delete_top_level_cluster(self):
        old_total = len(Cluster.query.filter(
            Cluster.id == self.source_1.id
        ).all())
        old_id = self.cluster_1.id
        cluster_item = self.cluster_1.child_items[0]
        project = self.cluster_1.project
        res = self.client().delete(f'/clusters/{self.cluster_1.id}',
                                   headers=auth_header)
        data = json.loads(res.data)

        new_total = len(Cluster.query.filter(
            Cluster.id == old_id
        ).all())
        deleted_source = Cluster.query.get(self.cluster_1.id)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['deleted'], old_id)
        self.assertIsNone(deleted_source)
        self.assertEqual(new_total, old_total - 1)
        self.assertEqual(cluster_item.cluster, None)

    def test_create_cluster_from_scratch(self):
        # We will try and put item_3 and item_4 into a cluster
        res = self.client()\
            .post(f'/clusters/create_new',
                  json={'item1_id': self.source_3.child_items[0].id,
                        'item2_id': self.source_3.child_items[1].id,
                        'x_position': 400,
                        'y_position': 300,
                        'name': 'Cluster From Scratch'},
                  headers=auth_header)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        cluster = data['cluster']
        self.assertEqual(cluster['name'], 'Cluster From Scratch')
        self.assertEqual(cluster['x_position'], 400)
        self.assertEqual(cluster['y_position'], 300)
        self.assertEqual(len(cluster['child_items']), 2)
        self.assertEqual(len(self.project_2.clusters), 1)

        # Add another sub-cluster to this one
        res = self.client()\
            .post(f'/clusters/create_new',
                  json={'item1_id': self.source_3.child_items[0].id,
                        'item2_id': self.source_3.child_items[1].id,
                        'x_position': 200,
                        'y_position': 100,
                        'name': 'Cluster Within Cluster'},
                  headers=auth_header)

        data = json.loads(res.data)
        self.assertEqual(res.status_code, 201)
        self.assertTrue(data['success'])
        inner_cluster = data['cluster']
        self.assertEqual(inner_cluster['name'], 'Cluster Within Cluster')
        self.assertEqual(len(self.project_2.clusters), 1)
        self.assertEqual(len(inner_cluster['child_items']), 2)

        actual_cluster = self.source_3.child_items[0].cluster
        self.assertEqual(actual_cluster.name, 'Cluster Within Cluster')
        self.assertEqual(len(actual_cluster.child_items), 2)
        self.assertEqual(len(actual_cluster.child_clusters), 0)

        higher_cluster = actual_cluster.parent_cluster
        self.assertEqual(higher_cluster.name, 'Cluster From Scratch')
        self.assertEqual(len(higher_cluster.child_items), 0)
        self.assertEqual(len(higher_cluster.child_clusters), 1)

    def test_cluster_name_update(self):
        old_name = Cluster.query.get(self.cluster_1.id).name
        new_name = 'New Name'
        res = self.client().patch(f'/clusters/{self.cluster_1.id}',
                                  json={'name': new_name},
                                  headers=auth_header)
        data = json.loads(res.data)
        new_name = Cluster.query.get(self.cluster_1.id).name

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertNotEqual(old_name, new_name)
        self.assertEqual(data['cluster']['name'], new_name)

    def test_adding_to_existing_cluster(self):
        res = self.client()\
            .patch(f'/clusters/{self.cluster_1.id}'
                   f'/sources/'
                   f'{self.source_2.child_items[0].id}',
                   headers=auth_header)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        cluster = data['cluster']
        self.assertEqual(len(cluster['child_items']), 2)

    def test_remove_from_existing_cluster(self):
        # After this removal, there should be nothing in the cluster
        res = self.client()\
            .patch(f'/clusters/{self.cluster_1.id}'
                   f'/sources/{self.source_1.child_items[0].id}'
                   f'/remove',
                   headers=auth_header)

        data = json.loads(res.data)
        self.assertTrue(data['success'])
        cluster = data['cluster']
        print(cluster)
        self.assertEqual(len(cluster['child_items']), 0)


if __name__ == '__main__':
    unittest.main()
