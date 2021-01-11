import requests
from bs4 import BeautifulSoup

# TODO: Populated based off source url info 
sites = [
    'https://fivethirtyeight.com/features/democrats-and-republicans-should-argue-more-not-less/'
]

for url in sites:
    r = requests.get(url)
    html_source_string = r.text
    soup = BeautifulSoup(html_source_string, 'html.parser')

    accessDate = "Missing field. Set to today?"

    # Only one version of each these fields should be 
    # in a page source, but there is more than one way to denote each field
    title1 = soup.title
    title2 = soup.find("meta",  property="og:title")
    title3 = soup.find("meta", name="dc.Title")
    title4 = soup.find("meta", property="twitter:title")

    # Check for duplicate denotations of each field
    lst = [title1,title2,title3,title4]
    if sum(x is not None for x in lst) > 1:

    author1 = soup.find("meta",  name="twitter:data1")
    author2 = soup.find("meta",  name="dc.Creator")
    author3 = soup.find("meta",  name="author")

    lst = [author1,author2,author3]
    if sum(x is not None for x in lst) > 1:

    # TODO: If Author name (not "Staff") split into First and Last to order

    publishDate1 = soup.find("meta",  property="article:published_time")
    publishDate2 = soup.find("meta",  name="dc.Date")

    lst = [publishDate1,publishDate2]
    if sum(x is not None for x in lst) > 1:

    siteName1 = soup.find("meta",  property="site_name")
    siteName2 = soup.find("meta",  name="citation_journal_title")

    lst = [siteName1,siteName2]
    if sum(x is not None for x in lst) > 1:

    url1 = soup.find("meta",  property="og:url")
    url2 = soup.find("link")


    lst = [url1,url2]
    if sum(x is not None for x in lst) > 1:

    # print(soup.prettify())

    # Check for duplicate denotations of each field
    print("Author")
    print(author1["content"] if author1)
    print(author2["content"] if author2)
    print(author3["content"] if author3)

    print("Site Article Title")
    print(title1["content"] if title1)
    print(title2["content"] if title2)
    print(title3["content"] if title3)
    
    print("Publish Date")
    print(publishDate1["content"] if publishDate1)
    print(publishDate2["content"] if publishDate2)
    
    print("Site Title")
    print(siteName1["content"] if siteName1)
    print(siteName2["content"] if siteName2)

    print("Access Date")
    print(accessDate)

    print("Site URL")
    print(url1["content"] if url1)
    print(url2["href"] if url2)

