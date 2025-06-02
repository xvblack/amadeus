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
from clients import supabase_client, typesense_client
from data_types import Post
import tqdm
import click

async def ensure_collection_exists() -> None:
    collections = typesense_client.collections.retrieve()
    if not any(collection['name'] == os.getenv('TYPESENSE_INDEX_NAME') for collection in collections):
        typesense_client.collections.create({
            'name': os.getenv('TYPESENSE_INDEX_NAME'),
            'fields': [
                { 'name': "id", 'type': "int32" },
                { 'name': "url", 'type': "string" },
                { 'name': "time_added", 'type': "int64" },
                { 'name': "time_added_as_date", 'type': "string", 'optional': True },
                { 'name': "source", 'type': "string" },
                { 'name': "tags", 'type': "string[]", 'facet': True },
                { 'name': "title", 'type': "string" },
                { 'name': "abstract", 'type': "string" },
                { 'name': "content", 'type': "string" },
                { 'name': "html", 'type': "string", 'optional': True },
                { 'name': ".*", 'type': "auto" },
            ],
        })

async def index_post(post: Post) -> None:
    # check if the collection exists
    collection = typesense_client.collections[os.getenv('TYPESENSE_INDEX_NAME')]
    post['id'] = str(post['id'])
    post['links'] = json.dumps(post['links'])
    post['content'] = post['content'] or ''
    collection.documents.upsert(post)
    print(f"Indexed post {post['id']}")

async def run_indexing(limit, page_size=100, concurrency=10):
    await ensure_collection_exists()
    semaphore = asyncio.Semaphore(concurrency)
    async def index_post_with_semaphore(post: Post) -> None:
        async with semaphore:
            await index_post(post)

    for begin in tqdm.trange(0, limit, page_size):
        statement = supabase_client.table("Post").select("*")
        statement = statement.order("time_added", desc=True)
        posts = statement.range(begin, begin + page_size).execute().data
        if not posts:
            break
        await asyncio.gather(*[index_post_with_semaphore(post) for post in posts])

@click.command()
@click.option("--limit", default=10)
@click.option("--page-size", default=100)
@click.option("--concurrency", default=10)
def main(limit, page_size, concurrency):
    asyncio.run(run_indexing(limit, page_size, concurrency))

if __name__ == "__main__":
    main()

# async def search_post(query: Dict[str, Any]) -> Post:
#     collection = get_typesense_client().collections[os.getenv('TYPESENSE_INDEX_NAME')]
#     return await collection.documents.search(query)