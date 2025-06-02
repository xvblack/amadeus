import time
import os
import fastapi
from supabase import create_client
from fastapi.responses import HTMLResponse

app = fastapi.FastAPI()
supabase = create_client(
    os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

@app.get("/save")
async def save_post(url: str):
    supabase.table("Post").upsert({
        "url": url,
        "source": "pocket",
        "time_added": int(time.time()),
        "tags": ["pocket:unread"],
        "attrs": {},
            "links": {},
        },
        on_conflict="source,url",
    ).execute()

    return HTMLResponse(content="Saved", status_code=200)