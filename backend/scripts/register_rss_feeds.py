import feedparser
import opml
import json
from datetime import datetime
from pathlib import Path
import logging
import click
from clients import supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_opml(opml_path, frequency):
    """Parse OPML file and return list of feed URLs."""
    try:
        outline = opml.parse(opml_path)
        feeds = []
        
        def process_outline(outline, tags):
            if outline._outlines:
                for sub_outline in outline._outlines:
                    process_outline(sub_outline, tags + [outline.title])
            elif hasattr(outline, 'xmlUrl'):
                feeds.append({
                    'title': outline.title,
                    'url': outline.xmlUrl,
                    'category': '/'.join(tags),
                    'frequency': frequency,
                    'time_last_crawled': 0,
                })
        for outline in outline._outlines:
            process_outline(outline, tags=[])
        return feeds
    except Exception as e:
        logger.error(f"Error parsing OPML file: {e}")
        raise e

@click.command()
@click.option('--opml-path', type=click.Path(exists=True))
@click.option('--frequency', type=int, default=60 * 60)
def main(opml_path, frequency):
    feeds = parse_opml(opml_path, frequency)
    supabase_client.table("RssFeeds").upsert(feeds).execute()

if __name__ == '__main__':
    main()
