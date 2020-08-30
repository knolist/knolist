from app.main.models.models import Source, Project

# Set variables for all tests
user_id = 'auth0|5f4737ec9c5106006de161bc'
jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE1OTg3NTYxOTksImV4cCI6MTU5ODg0MjU5OSwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.RvmT2O4j6o-YPkWWVjNscvMfX409qulp56biIVFxQky0xfKT6n-fjB3T5LHV2D_qUnB4BFubdeFFnM4aF1lso7yNgCZPP0GLD5FvP7L_fE1_kEpv_kxTLyWwIJTGXFyyGefY6wgOqQosM_w2FvGjW0F7TCUvh_87CWYpXX1F8lCIEQ8pzWL9eY9JCaKC6XnSUVG9stvq5CGg7-dxdo-5rM7_gyAeDPOEKlqUxVYEdcQSQbr3xViCgi3TVd6HrjYvYXVzcqV4_ZQxnEI0j_xObgKBZvRpqElyeDDpOIzxkDaVJAxPFXllJspJ1lEec-QG3WhIPfGGwEZVMMjsj_n1eA'
auth_header = {'Authorization': f'Bearer {jwt}'}

def create_starter_data():
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