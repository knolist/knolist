import requests
from bs4 import BeautifulSoup
from datetime import date, datetime


# Takes list of string urls
def url_to_citation(url):
    today = date.today()
    citation_fields = {
        "title": "",
        "author": "",
        "publish_date": "",
        "site_name": "",
        # Set access_date to time of creating source
        # TODO: update with access history
        "access_date": today.strftime("%m/%d/%Y"),
    }

    r = requests.get(url)
    html_source_string = r.text
    soup = BeautifulSoup(html_source_string, 'html.parser')

    # Only one version of each these fields should be
    # in a page source, but there is more than one way to denote each field
    title1 = soup.title
    title2 = soup.find("meta",  property="og:title")
    title3 = soup.find(attrs={'name': 'dc.Title'})
    title4 = soup.find("meta", property="twitter:title")

    author1 = soup.find(attrs={'name': 'twitter:data1'})
    author2 = soup.find(attrs={'name': 'dc.Creator'})
    author3 = soup.find(attrs={'name': 'author'})

    # TODO: If Author name (not "Staff") split into First and Last to order

    publish_date1 = soup.find("meta",  property="article:published_time")
    publish_date2 = soup.find(attrs={'name': 'dc.Date'})

    site_name1 = soup.find("meta",  property="site_name")
    site_name2 = soup.find(attrs={'name': 'citation_journal_title'})
    site_name3 = soup.find("meta",  property="og:site_name")

    # Populate field with whichever method does not return None
    if title2:
        citation_fields["title"] = title2["content"]
    elif title3:
        citation_fields["title"] = title3["content"]
    elif title1:
        citation_fields["title"] = title1.string
    elif title4:
        citation_fields["title"] = title4["content"]
    else:
        citation_fields["title"] = None

    if author2:
        citation_fields["author"] = author2["content"]
    elif author3:
        citation_fields["author"] = author3["content"]
    elif author1:
        citation_fields["author"] = author1["content"]
    else:
        citation_fields["author"] = None

    if publish_date1:
        citation_fields["publish_date"] = datetime.strftime(
            datetime.strptime(publish_date1["content"][0:10], "%Y-%m-%d"),
            "%m/%d/%Y"
        )
    elif publish_date2:
        citation_fields["publish_date"] = datetime.strftime(
            datetime.strptime(publish_date2["content"][0:10], "%Y-%m-%d"),
            "%m/%d/%Y"
        )
    else:
        citation_fields["publish_date"] = None

    if site_name1:
        citation_fields["site_name"] = site_name1["content"]
    elif site_name2:
        citation_fields["site_name"] = site_name2["content"]
    elif site_name3:
        citation_fields["site_name"] = site_name3["content"]
    else:
        citation_fields["site_name"] = None

    return citation_fields
