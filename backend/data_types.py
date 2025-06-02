from typing import TypedDict, Optional, List, Dict


class Post(TypedDict):
    url: str
    time_added: int
    time_added_as_date: Optional[str]
    source: str
    tags: List[str]
    attrs: Dict[str, any]
    links: Dict[str, str]
    title: Optional[str]
    abstract: Optional[str]
    content: Optional[str]
