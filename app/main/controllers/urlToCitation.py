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

    title1 = soup.title
    # TODO: Elif blocks to try the various methods of getting each field?
    title2 = soup.find("meta",  property="og:title")
    title3 = soup.find("meta", name="dc.Title")
    title4 = soup.find("meta", property="twitter:title")

    author1 = soup.find("meta",  name="twitter:data1")
    author2 = soup.find("meta",  name="dc.Creator")
    author3 = soup.find("meta",  name="author")

    publishDate1 = soup.find("meta",  property="article:published_time")
    publishDate2 = soup.find("meta",  name="dc.Date")

    siteName1 = soup.find("meta",  property="site_name")
    siteName2 = soup.find("meta",  name="citation_journal_title")

    url1 = soup.find("meta",  property="og:url")
    url2 = soup.find("link")

    # print(soup.prettify())
    # TODO: take out if statements if using elif block
    print("Author")
    print(author1["content"] if author1 else "No <meta name=twitter:data1> given")
    print(author2["content"] if author2 else "No <meta name=dc.Creator> given")
    print(author3["content"] if author3 else "No <meta name=author> given")

    print("Site Article Title")
    print(title1["content"] if title1 else "No <title> given")
    print(title2["content"] if title2 else "No <meta property=og:title> given")
    print(title3["content"] if title3 else "No <meta name=dc.Title>  given")
    
    print("Publish Date")
    print(publishDate1["content"] if publishDate1 else "No <meta property=article:published_time> given")
    print(publishDate2["content"] if publishDate2 else "No <meta name=dc.Date> given")
    
    print("Site Title")
    print(siteName1["content"] if siteName1 else "No <meta property=og:site_name> given")
    print(siteName2["content"] if siteName2 else "No <meta name=citation_journal_title> given")

    print("Access Date")
    print(accessDate)

    print("Site URL")
    print(url1["content"] if url1 else "No <meta property=og:url> given")
    print(url2["href"] if url2 else "No <link> given")

