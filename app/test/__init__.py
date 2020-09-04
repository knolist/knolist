from app.main.models.models import Source, Project

# Set variables for all tests
user_id = 'auth0|5f4737ec9c5106006de161bc'
jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE1OTkxODU2NDAsImV4cCI6MTU5OTI3MjA0MCwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.pGVfilciVsmXG4IfFC1ikMhQE463bEDjHEQQ_zAZH1NZnZRgASl6Y1vquQ42sALhtWq04J8YUNHswkB2Oo1euvnege6maXEyyJZmrmbDTwS8C6CmaMLBuyJb1EIWuC6N7LxxqbRP36j7EG8MS_w4EnHh9bBsncAG9PhAu5fqo51JYx_4LJ_tbVhWh8RMWfeyiow6-d1NkXAleHMtgQjfKLYlPDqKuOKu8FCJhzXtAJPVtySksJbD0bisZldzeaiuFdQ11_IH-ow6bQIU5rzHd-GmLOUUjyIE7hm5rP7OsB5ek1hy_5WmLZxodk2zKM3puv5dk-p76_8ePVCLILzL7g'
auth_header = {'Authorization': f'Bearer {jwt}'}
other_user_jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczZGJhOWI3MjU0MDA2ZDlhZTFiMCIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE1OTkxODYzMzcsImV4cCI6MTU5OTI3MjczNywiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJ1cGRhdGU6bm90ZXMiLCJ1cGRhdGU6cHJvamVjdHMiLCJ1cGRhdGU6c291cmNlcyJdfQ.dSMb1Yuq41DyJr9QTV0U42_a9XTYtWKqM_DnS422iMZNVjAvIRmrItiBERApy_7m0HLj4N0XKyh5HZY_rsB5ZJQ3XQ3JBe8mAd8RI4ngCM1hwogFx516uQmN8hVffLy9ue9T35H_rae64epE1UgulLo_6rs2sXnZnHqlcvQHZtHui9tXrX9FK7r7cc3DUSviRBCsqYPtNeV-B03T0Oahx4rml1KOmur46NpVcImg4G3goiIh6FyRUngkLgiOJ4k1k9QyirpOKu4RgQOIPktJ0S1YpsKQnw3Ge2BpSxo9eCh7g3aCJVvTcGrrjdwTYv94P1Y1z6hA8TB82KV_704pYg'

def create_starter_data():
    project_1 = Project('Test Project 1', user_id)
    project_2 = Project('Test Project 2', user_id)

    source_1 = Source(url='https://test1.com',
                      title='Test Source 1',
                      content='This is the content of test source 1',
                      highlights='["First highlight", "Second highlight"]',
                      notes='["First note", "Second note"]',
                      x_position=100,
                      y_position=-30)

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
