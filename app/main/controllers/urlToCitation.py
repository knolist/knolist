import requests
from bs4 import BeautifulSoup

sites = [
    'https://fivethirtyeight.com/features/democrats-and-republicans-should-argue-more-not-less/'
]

for url in sites:
    r = requests.get(url)
    html_source_string = r.text
    soup = BeautifulSoup(html_source_string, 'html.parser')
    title1 = soup.title
    title2 = soup.find("meta",  property="og:title")
    title3 = soup.find("meta", name="dc.Title")
    title4 = soup.find("meta", property="twitter:title")  
    url = soup.find("meta",  property="og:url")

    # print(soup.prettify())
    print(title1["content"] if title1 else "No <title> given")
    print(title2["content"] if title2 else "No <meta property=og:title> given")
    print(title3["content"] if title3 else "No <meta name=dc.Title>  given")
    print(url["content"] if url else "No meta url given")