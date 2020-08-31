from app.main.models.models import Source, Project

# Set variables for all tests
user_id = 'auth0|5f4737ec9c5106006de161bc'
jwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE1OTg4NDI5MDUsImV4cCI6MTU5ODkyOTMwNSwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.LgDUhuS7tjaaV1a9Vz1_7P49Sk0ylLbV5-WKaQJGCYysu-I2sSQffD56A77PTElzT6Xxw8oBgNfIO7UWWil_NRbAdL43zqTK2UsIaNKWOgqOn9rqkaWkJVNGl2L8r4xgAVqC-JihjbpqfyO81n7-_hm_D62hJVclPnl63ZtG_cZX27dRGWltXlkDzolvaSvwhm-rWLbAvuFsOk60eLIkPschZoWXVTwLrJzjxQamscmaYx_2g0dED696V9zBrqB-grI9zJmPih0mI1KuAtHTvXh6ZLnogH7CbjSGZhU_-ZIHpGsibukHvF-V4mDBe503Bdo06YdvTNihg7_ACedkiQ'
auth_header = {'Authorization': f'Bearer {jwt}'}


def create_starter_data():
    project_1 = Project('Test Project 1', user_id)
    project_2 = Project('Test Project 2', user_id)

    source_1 = Source(url='https://test1.com',
                      title='Test Source 1',
                      content='This is the content of test source 1',
                      highlights='["This is a highlight"]',
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
