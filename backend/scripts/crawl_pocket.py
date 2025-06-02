import sys
import os
import json
from typing import Dict, List, Optional, Union, TypedDict
import requests
from tqdm import tqdm
from html2text import HTML2Text
import structlog
import tqdm

from data_types import Post
from clients import supabase_client

# Set up logging
logger = structlog.get_logger()



# Type definitions
class PocketPost(TypedDict):
    given_url: str
    time_added: str
    status: str
    resolved_title: Optional[str]
    given_title: str
    excerpt: Optional[str]
    item_id: str
    top_image_url: Optional[str]


def retrieve_all_posts(
    *, limit: int, offset: int, search: Optional[str] = None
) -> List[Post]:
    posts = []
    response = requests.get(
        "https://getpocket.com/v3/get",
    params={
            "consumer_key": os.environ["POCKET_CONSUMER_KEY"],
            "access_token": os.environ["POCKET_ACCESS_TOKEN"],
            "state": "all",
            "count": limit,
            "search": search,
            "since": 0,
            "offset": offset
        },
    )

    if response.status_code != 200:
        logger.error("Failed to fetch from pocket %s", response.text)
        raise Exception(response.text)

    response_json = response.json()

    if "list" not in response_json:
        logger.error("Failed to fetch from pocket %s", response.text)
        raise Exception(response.text)

    posts = list(response_json["list"].values())

    h = HTML2Text()
    h.ignore_links = True

    return [
        {
            "url": post["given_url"],
            "time_added": int(post["time_added"]),
            "source": "pocket",
            "tags": ["pocket:unread"] if int(post.get("status", "-1")) == 0 else [],
            "title": post.get("resolved_title") or post["given_title"],
            "abstract": h.handle(post.get("excerpt", "")),
            "attrs": {
                "pocket_id": post["item_id"],
                "image_url": post.get("top_image_url", ""),
            },
            "links": {},
        }
        for post in posts
        if post.get("given_url")
    ]


def try_sync_pocket(limit: int):
    PAGE_SIZE = 200
    for offset in tqdm.trange(0, limit, PAGE_SIZE):
        posts = retrieve_all_posts(limit=PAGE_SIZE, offset=offset)
        logger.info("Offset: %d, Fetched %d posts from pocket", offset, len(posts))

        supabase_client.table("Post").upsert(posts, on_conflict="source,url").execute()


if __name__ == "__main__":
    try_sync_pocket(int(sys.argv[1]))
