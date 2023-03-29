from typing import List, Dict
import dataclasses


@dataclasses.dataclass
class Post:
    url: str
    title: str
    abstract: str
    time_added: int
    links: Dict[str, str]

    content: str = None
    html: str = None
    source: str = None
    tags: List[str] = dataclasses.field(default_factory=list)

    attrs: dict[str, object] = dataclasses.field(default_factory=dict)
