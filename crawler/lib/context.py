import pathlib
import os
import dataclasses
import lib.crawler
import lib.enricher


@dataclasses.dataclass
class Context:
    crawler: lib.crawler.Crawler
    enricher: lib.enricher.Enricher


def build_context():
    crawl_root = pathlib.Path(os.environ['CRAWL_CACHE_DIR'])

    storage = lib.crawler.FileStorageDriver(crawl_root)
    crawler = lib.crawler.Crawler(storage)

    enricher = lib.enricher.Enricher(crawler)

    return Context(crawler=crawler, enricher=enricher)
