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
    title3 = soup.find("meta", name="dc.Title")
    title4 = soup.find("meta", property="twitter:title")

    author1 = soup.find("meta",  name="twitter:data1")
    author2 = soup.find("meta",  name="dc.Creator")
    author3 = soup.find("meta",  name="author")

    # TODO: If Author name (not "Staff") split into First and Last to order

    publishDate1 = soup.find("meta",  property="article:published_time")
    publishDate2 = soup.find("meta",  name="dc.Date")

    siteName1 = soup.find("meta",  property="site_name")
    siteName2 = soup.find("meta",  name="citation_journal_title")

    # Populate field with whichever method does not return None
    if title1:
        citationFields["title"] = title1["content"]
        break
    else if title2:
        citationFields["title"] = title2["content"]
        break
    else if title3:
        citationFields["title"] = title3["content"]
        break
    else:
        citationFields["title"] = "Not found"

    if author1:
        citationFields["author"] = author1["content"]
        break
    else if author2:
        citationFields["author"] = author2["content"]
        break
    else if author3:
        citationFields["author"] = author3["content"]
        break
    else:
        citationFields["author"] = "Not found"

    if publishDate1:
        citationFields["publishDate"] = publishDate1["content"]
        break
    else if publishDate2:
        citationFields["publishDate"] = publishDate2["content"]
        break
    else:
        citationFields["publishDate"] = "Not found"
    
    if siteName1:
        citationFields["siteName"] = siteName1["content"]
        break
    else if siteName2:
        citationFields["siteName"] = siteName2["content"]
        break
    else:
        citationFields["siteName"] = "Not found"
    
    return citationFields



