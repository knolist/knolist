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
        "accessDate": today.strftime("%B %d, %Y"), 
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
        authorFormatted = ""
        authorArray = author2["content"].split()
        if (len(authorArray) == 2):
            firstName = authorArray[0]
            lastName = authorArray[1]
            authorFormatted = lastName + ", " + firstName
        elif (len(authorArray) == 3):
            firstName = authorArray[0]
            middle = authorArray[1]
            lastName = authorArray[2]
            authorFormatted = lastName + ", " + firstName + " " + middle[0] + "."
        ## elif ("Staff" in authorArray) or ("staff" in authorArray):
        else:
            authorFormatted = author2["content"] 
        citationFields["author"] = authorFormatted
    elif author3:
        authorFormatted = ""
        authorArray = author3["content"].split()
        if (len(authorArray) == 2):
            firstName = authorArray[0]
            lastName = authorArray[1]
            authorFormatted = lastName + ", " + firstName
        elif (len(authorArray) == 3):
            firstName = authorArray[0]
            middle = authorArray[1]
            lastName = authorArray[2]
            authorFormatted = lastName + ", " + firstName + " " + middle[0] + "."
        ## elif ("Staff" in authorArray) or ("staff" in authorArray):
        else:
            authorFormatted = author3["content"] 
        citationFields["author"] = authorFormatted
    elif author1:
        authorFormatted = ""
        authorArray = author1["content"].split()
        if (len(authorArray) == 2):
            firstName = authorArray[0]
            lastName = authorArray[1]
            authorFormatted = lastName + ", " + firstName
        elif (len(authorArray) == 3):
            firstName = authorArray[0]
            middle = authorArray[1]
            lastName = authorArray[2]
            authorFormatted = lastName + ", " + firstName + " " + middle[0] + "."
        ## elif ("Staff" in authorArray) or ("staff" in authorArray):
        else:
            authorFormatted = author1["content"] 
        citationFields["author"] = authorFormatted
    else:
        citationFields["author"] = None

    if publishDate1:
        citationFields["publishDate"] = datetime.datetime.strftime(datetime.datetime.strptime(publishDate1["content"][0:10], "%Y-%m-%d"),"%B %d, %Y")
    elif publishDate2:
        citationFields["publishDate"] = datetime.datetime.strftime(datetime.datetime.strptime(publishDate2["content"][0:10], "%Y-%m-%d"),"%B %d, %Y")
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