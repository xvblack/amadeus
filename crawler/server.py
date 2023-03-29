import fastapi
import lib.context as context
import lib.post
import logging

from typing import List, Dict
from pydantic import BaseModel

app = fastapi.FastAPI()

ctx = context.build_context()


class IndexPostRequest(BaseModel):
    url: str
    time_added: int
    source: str
    tags: List[str] = []
    attrs: Dict[str, object]


@app.post("/index-post")
async def index_post(req: IndexPostRequest):
    url = req.url
    post = lib.post.Post(url=url,
                         title="",
                         abstract="",
                         time_added=req.time_added,
                         tags=req.tags,
                         source=req.source,
                         attrs=req.attrs,
                         links={})
    enriched = await ctx.enricher.build_entry(post)
    logging.debug(enriched)
    return enriched
