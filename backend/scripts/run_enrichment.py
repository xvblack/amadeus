import asyncio
import os
import re
import json
import logging
from typing import List, Dict, Optional, Any, Tuple, TypedDict
import requests
from bs4 import BeautifulSoup
# from readability import Document
import trafilatura
import typesense
from clients import supabase_client
from data_types import Post
import tqdm
import click

# Constants
TWITTER_PATTERN = r"https://twitter.com/([a-zA-Z0-9_-]+)/status/(\d+)"
HN_PREMII_PATTERN = r"http://hn.premii.com/#/comments/(\d+)"
ARXIV_ABS_PATTERN = r"https://arxiv.org/abs/([0-9]+\.[a-zA-Z0-9-_]+)"
ARXIV_PDF_PATTERN = r"https://arxiv.org/pdf/([0-9]+\.[a-zA-Z0-9-_]+)"
OPEN_REVIEW_PDF_PATTERN = r"https://openreview.net/pdf\?id=([a-zA-Z0-9_-]+)"
REDDIT_PATTERN = r"https://www.reddit.com/r/([a-zA-Z0-9_-]+)/comments/([a-zA-Z0-9_-]+)/"

# URL normalization mapping
NORMALIZE_URL_MAPPING = [
    (OPEN_REVIEW_PDF_PATTERN, lambda match: f"https://openreview.net/forum?id={match.group(1)}"),
    (ARXIV_PDF_PATTERN, lambda match: f"https://arxiv.org/abs/{match.group(1)}"),
    (HN_PREMII_PATTERN, lambda match: f"https://news.ycombinator.com/item?id={match.group(1)}"),
]

def normalize_url(url: str) -> str:
    for pattern, converter in NORMALIZE_URL_MAPPING:
        match = re.match(pattern, url)
        if match:
            return converter(match)
    return url

class Content(TypedDict):
    title: Optional[str]
    abstract: Optional[str]
    content: Optional[str]
    tags: List[str]


async def parse_content(url: str) -> Content:
    normalized = normalize_url(url)

    if re.match(TWITTER_PATTERN, normalized):
        return await enrich_twitter(normalized)
    
    if re.match(ARXIV_ABS_PATTERN, normalized):
        return await enrich_arxiv(normalized)
    
    return await enrich_raw_html(normalized)

async def enrich_arxiv(url: str) -> Content:
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    abs_div = soup.find(id="abs")
    title = abs_div.find(class_="title").text if abs_div else None
    abstract = abs_div.find(class_="abstract").text if abs_div else None
    
    return Content(
        title=title,
        abstract=abstract,
        content=abstract,
        tags=["paper"]
    )

async def enrich_twitter(url: str) -> Content:
    match = re.match(TWITTER_PATTERN, url)
    if not match:
        raise Exception("Unexpected URL format")
    
    publish_url = f"https://publish.twitter.com/oembed?dnt=true&omit_script=true&url=https://mobile.twitter.com/i/status/{match.group(2)}"
    response = requests.get(publish_url)
    json_data = response.json()
    
    return Content(
        title=json_data.get("author_name"),
        abstract=json_data.get("html"),
        content=json_data.get("html"),
        tags=[]
    )

async def enrich_raw_html(url: str) -> Content:
    response = requests.get(url)
    
    if response.status_code >= 400:
        raise Exception("Unable to connect")
    
    content_type = response.headers.get("content-type", "application/unknown")
    
    if content_type.startswith("text/plain"):
        content = response.text
        lines = content.split("\n")
        return Content(
            title=lines[0],
            abstract="\n".join(lines[:3]),
            content=content,
            tags=[]
        )
    elif content_type.startswith("text/html"):
        doc = trafilatura.extract(response.text, output_format="json", with_metadata=True)
        return Content(
            title=doc.get("title"),
            abstract=doc.get("excerpt"),
            content=doc.get("text"),
            tags=[]
        )
    else:
        raise Exception(f"Unable to parse non text format {content_type} for now")

async def enrich_post(post: Post) -> None:
    try:
        content = await parse_content(post.url)
        post.update(content)
    except Exception as e:
        post['content'] = "Error: " + e.message

    return post


async def run_enrichment(limit, url_pattern, source_pattern, page_size=100):
    with tqdm.tqdm() as pbar:
        for begin in range(0, limit, page_size):
            statement = supabase_client.table("Post").select("*")
            if url_pattern:
                statement = statement.like("url", url_pattern)
            if source_pattern:
                statement = statement.like("source", source_pattern)
            statement = statement.order("time_added", desc=True)
            posts = statement.range(begin, begin + page_size).execute()
            if not posts:
                break
            for index, post in enumerate(posts.data):
                pbar.update(1)
                post = await enrich_post(post)
                supabase_client.table("Post").update(post).eq("id", post['id']).execute()

@click.command()
@click.option("--limit", default=10)
@click.option("--url-pattern", default="")
@click.option("--source-pattern", default="")
def main(limit, url_pattern, source_pattern):
    asyncio.run(run_enrichment(limit, url_pattern, source_pattern))

if __name__ == "__main__":
    main()

# async def search_post(query: Dict[str, Any]) -> Post:
#     collection = get_typesense_client().collections[os.getenv('TYPESENSE_INDEX_NAME')]
#     return await collection.documents.search(query)