import requests
from bs4 import BeautifulSoup
from datetime import date

# Takes list of string urls
def urlToCitation(url):
    today = date.today()
    citationFields = {
        "title": "", 
        "author": "", 
        "publishDate": "", 
        "siteName": "", 
        # Set accessDate to time of creating source (future TODO: update with access history)
        "accessDate": today.strftime("%m/%d/%Y"), 
    }

    r = requests.get(url)
    html_source_string = r.text
    soup = BeautifulSoup(html_source_string, 'html.parser')

    # Only one version of each these fields should be 
    # in a page source, but there is more than one way to denote each field
    title1 = soup.title
    title2 = soup.find("meta",  property="og:title")
    title3 = soup.find(attrs={'name':'dc.Title'})
    title4 = soup.find("meta", property="twitter:title")

    author1 = soup.find(attrs={'name':'twitter:data1'})
    author2 = soup.find(attrs={'name':'dc.Creator'})
    author3 = soup.find(attrs={'name':'author'})

    # TODO: If Author name (not "Staff") split into First and Last to order

    publishDate1 = soup.find("meta",  property="article:published_time")
    publishDate2 = soup.find(attrs={'name':'dc.Date'})

    siteName1 = soup.find("meta",  property="site_name")
    siteName2 = soup.find(attrs={'name':'citation_journal_title'})
    siteName3 = soup.find("meta",  property="og:site_name")

    # Populate field with whichever method does not return None
    if title2:
        citationFields["title"] = title2["content"]
    elif title3:
        citationFields["title"] = title3["content"]
    elif title1:
        citationFields["title"] = title1.string
    else:
        citationFields["title"] = None

    if author2:
        citationFields["author"] = author2["content"]
    elif author3:
        citationFields["author"] = author3["content"]
    elif author1:
        citationFields["author"] = author1["content"]
    else:
        citationFields["author"] = None

    if publishDate1:
        citationFields["publishDate"] = datetime.datetime.strftime(datetime.datetime.strptime(publishDate1["content"][0:10], "%Y-%m-%d"),"%m/%d/%Y")
    elif publishDate2:
        citationFields["publishDate"] = datetime.datetime.strftime(datetime.datetime.strptime(publishDate2["content"][0:10], "%Y-%m-%d"),"%m/%d/%Y")
    else:
        citationFields["publishDate"] = None
    
    if siteName1:
        citationFields["siteName"] = siteName1["content"]
    elif siteName2:
        citationFields["siteName"] = siteName2["content"]
    elif siteName3:
        citationFields["siteName"] = siteName3["content"]
    else:
        citationFields["siteName"] = None
    
    return citationFields