import asyncio
import click
import time
from clients import supabase_client
import feedparser
from data_types import Post
import structlog

logger = structlog.get_logger()

async def crawl_feed(feed):
    feed_data = feedparser.parse(feed["url"])
    posts = []
    urls = set()
    for entry in feed_data.entries:
        if entry.link in urls:
            continue
        urls.add(entry.link)
        try:
            time_added = int(time.mktime(entry.published_parsed))
        except Exception as e:
            time_added = int(time.time())
        posts.append({
            "url": entry.link,
            "time_added": time_added,
            "source": "rss",
            "tags": [],
            "attrs": {},
            "links": {},
            "title": entry.title,
            "abstract": "",
            "content": "",
        })
    if posts:
        supabase_client.table("Post").upsert(posts, on_conflict="source,url").execute()
    else:
        logger.info(f"No posts found for feed {feed['url']}")
    supabase_client.table("RssFeeds").update({"time_last_crawled": int(time.time())}).eq("url", feed["url"]).execute()

async def run_rss_crawl(frequency):
    feeds = supabase_client.table("RssFeeds").select("*").execute().data
    for feed in feeds:
        if time.time() - feed["time_last_crawled"] > min(frequency, feed["frequency"]):
            logger.info(f"Crawling feed {feed['url']}")
            await crawl_feed(feed)
        else:
            logger.info(f"Skipping feed {feed['url']} because it was last crawled {time.time() - feed['time_last_crawled']} seconds ago")


@click.command()
@click.option("--frequency", type=int, default=60 * 60)
def main(frequency):
    asyncio.run(run_rss_crawl(frequency))

if __name__ == "__main__":
    main()
