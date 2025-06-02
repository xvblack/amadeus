import asyncio
import datetime
import os
from typing import List, Optional
import aiohttp
import click
import structlog
from html2text import HTML2Text

from data_types import Post
from clients import supabase_client
import tqdm
# Set up logging
logger = structlog.get_logger()

# Initialize HTML to text converter
h = HTML2Text()
h.ignore_links = True

async def fetch_item(session: aiohttp.ClientSession, item_id: int) -> Optional[Post]:
    """Fetch a single HN item and convert it to a Post."""
    async with session.get(f"https://hacker-news.firebaseio.com/v0/item/{item_id}.json") as response:
        if response.status != 200:
            logger.error("Failed to fetch item %d: %s", item_id, await response.text())
            return None
            
        item = await response.json()
        if not item or item.get("dead") or item.get("deleted"):
            return None
            
        return {
            "url": item.get("url", f"https://news.ycombinator.com/item?id={item_id}"),
            "time_added": item["time"],
            "source": "hackernews",
            "tags": ["hackernews:top"],
            "title": item["title"],
            "abstract": h.handle(item.get("text", "")),
            "attrs": {
                "hn_id": item_id,
                "score": item.get("score", 0),
                "by": item.get("by", ""),
                "descendants": item.get("descendants", 0),
            },
            "links": {},
        }



async def fetch_top_stories(limit: int) -> List[Post]:
    """Fetch top stories from HN API."""
    async with aiohttp.ClientSession() as session:
        # First get the list of top story IDs
        async with session.get("https://hacker-news.firebaseio.com/v0/topstories.json") as response:
            if response.status != 200:
                logger.error("Failed to fetch top stories: %s", await response.text())
                return []
                
            story_ids = await response.json()
            story_ids = story_ids[:limit]
            
        # Fetch each story concurrently
        tasks = [fetch_item(session, story_id) for story_id in story_ids]
        posts = await asyncio.gather(*tasks)
        
        # Filter out None values
        return [post for post in posts if post is not None]

async def fetch_stories_by_date(date_str: str) -> List[Post]:
    """Fetch stories from HN Algolia API for a specific date.
    
    Args:
        date_str: Date in YYYY-MM-DD format
    """
    # Convert date string to timestamp
    from datetime import datetime
    date = datetime.strptime(date_str, "%Y-%m-%d")
    start_timestamp = int(date.timestamp())
    end_timestamp = start_timestamp + 86400  # Add 24 hours in seconds
    
    # Construct Algolia API URL
    url = f"https://hn.algolia.com/api/v1/search_by_date"
    params = {
        "tags": "story",
        "numericFilters": f"created_at_i>={start_timestamp},created_at_i<{end_timestamp}",
        "hitsPerPage": 100
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params) as response:
            if response.status != 200:
                logger.error("Failed to fetch stories: %s", await response.text())
                return []
                
            data = await response.json()
            hits = data.get("hits", [])

            posts = []
            for hit in hits:
                if hit.get("dead") or hit.get("deleted"):
                    continue

                posts.append({
                    "url": hit.get("url", f"https://news.ycombinator.com/item?id={hit['objectID']}"),
                    "time_added": hit["created_at_i"],
                    "source": "hackernews",
                    "tags": ["hackernews:top"],
                    "title": hit["title"],
                    "abstract": h.handle(hit.get("story_text", "")),
                    "attrs": {
                        "hn_id": int(hit["objectID"]),
                        "score": hit.get("points", 0),
                        "by": hit.get("author", ""),
                        "descendants": hit.get("num_comments", 0),
                    },
                    "links": {},
                })

            return posts

@click.command()
@click.argument('limit', type=int)
def crawl_hn(limit: int):
    """Crawl top stories from Hacker News."""
    logger.info("Starting HN crawl with limit %d", limit)
    
    # Run the async function
    posts = asyncio.run(fetch_top_stories(limit))
    logger.info("Fetched %d posts from HN", len(posts))
    
    # Save to database
    if posts:
        supabase_client.table("Post").upsert(posts, on_conflict="source,url").execute()
        logger.info("Successfully saved %d posts to database", len(posts))

@click.command()
@click.option('--date_start', type=str)
@click.option('--date_end', type=str)
def crawl_hn_by_date(date_start: str, date_end: str):
    """Crawl stories from Hacker News for a specific date."""
    logger.info("Starting HN crawl for date %s to %s", date_start, date_end)
    
    date_start = datetime.datetime.strptime(date_start, "%Y-%m-%d")
    date_end = datetime.datetime.strptime(date_end, "%Y-%m-%d")

    def date_range(start: datetime.datetime, end: datetime.datetime):
        for n in range(int((end - start).days)):
            yield (start + datetime.timedelta(n)).strftime("%Y-%m-%d")

    for date in tqdm.tqdm(date_range(date_start, date_end)):
        # Run the async function
        import time
        time.sleep(5)
        posts = asyncio.run(fetch_stories_by_date(date))
        logger.info("Fetched %d posts from HN", len(posts))
        
    # Save to database
    if posts:
        supabase_client.table("Post").upsert(posts, on_conflict="source,url").execute()
        logger.info("Successfully saved %d posts to database", len(posts))

if __name__ == "__main__":
    crawl_hn_by_date()
