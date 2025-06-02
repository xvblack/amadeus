import os
import re
from typing import Dict, Any
from supabase import create_client
import typesense

supabase_client = create_client(
    os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)


def parse_typesense_addr(addr: str) -> Dict[str, Any]:
    match = re.match(r"([a-z]+)://([^:]+):([0-9]+)(.*)", addr)
    if not match:
        raise Exception(f"invalid typesense addr {addr}")
    return {
        'protocol': match.group(1),
        'host': match.group(2),
        'port': int(match.group(3)),
        'path': match.group(4)
    }

# Client initialization functions
addr = parse_typesense_addr(os.getenv('TYPESENSE_ADDR'))
typesense_client = typesense.Client({
    'api_key': os.getenv('TYPESENSE_API_KEY'),
    'nodes': [addr],
    'cache_search_results_for_seconds': 0
})
