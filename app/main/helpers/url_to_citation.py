# Knolist
# Conner Delahanty
# Spring 2020
#
# File contains method that parses a source URL and
# returns relevant information about the source.
# Relies heavily on the open servers of ZoteroBib,
# for which we are extremely thankful for their open
# source logic

import requests
from datetime import date, datetime


# Takes list of string urls
def url_to_citation(url):
    today = date.today()
    citation_fields = {
        "title": "",
        "author": "",
        "publish_date": None,
        "site_name": "",
        # Set access_date to time of creating source
        "access_date": today.strftime("%m/%d/%Y"),
    }

    ZOTERO_SERVER = 'https://t0guvf0w17.execute-api.us-east-1.amazonaws.com/Prod/web'
    # Relevant headers for API call
    headers = {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'text/plain',
        'origin': 'https://zbib.org',
        'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36'
    }

    result = requests.post(ZOTERO_SERVER, data=url, headers=headers)
    if (not result.status_code == 200):
        return citation_fields

    citation_entry = result.json()[0]

    if ('title' in citation_entry):
        citation_fields['title'] = citation_entry['title']
    if ('libraryCatalog' in citation_entry):
        citation_fields['site_name'] = citation_entry['libraryCatalog']
    elif ('websiteTitle' in citation_entry):
        citation_fields['site_name'] = citation_entry['websiteTitle']
    if ('date' in citation_entry):
        citation_fields['publish_date'] = datetime.strftime(
                                                      datetime.strptime(citation_entry['date'][0:10], "%Y-%m-%d"),
                                                      "%m/%d/%Y")
    if ('creators' in citation_entry):
        for c in citation_entry['creators']:
            if (c['creatorType'] == 'author'):
                citation_fields['author'] = c['lastName'] + ", " + c['firstName']

    return citation_fields
