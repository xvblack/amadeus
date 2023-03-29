"""Helper functions for enriching entries.
"""

import logging
import re

import bs4
import html2text
import lib.crawler
import lib.post
import dataclasses


def html_to_text(s: str):
    h = html2text.HTML2Text(baseurl='', bodywidth=0)
    h.ignore_links = True
    return h.handle(s)


class Enricher:

    def __init__(self, crawler: lib.crawler.Crawler):
        self.crawler = crawler

    async def build_entry(self, post: lib.post.Post):
        """
        Build a entry from a pocket input entry
        """
        crawler = self.crawler

        url = post.url
        tags = set(post.tags)
        title = post.title
        abstract = post.abstract
        links = dict(post.links)
        content = ""
        html = ""

        fetch_args = {}

        # Substitute PDF link with abstract link.
        match = re.match('https://openreview.net/pdf\?id=([a-zA-Z0-9_-]+)',
                         url)
        if match:
            url = 'https://openreview.net/forum?id={}'.format(match.group(1))
        match = re.match('https://arxiv.org/pdf/([0-9]+\.[a-zA-Z0-9-_]+).pdf',
                         url)
        if match:
            url = 'https://arxiv.org/abs/{}'.format(match.group(1))
        match = re.match('http://hn.premii.com/#/comments/(\d+)', url)
        if match:
            url = 'https://news.ycombinator.com/item?id={}'.format(
                match.group(1))

        match = re.match('https://twitter.com/([a-zA-Z0-9_-]+)/status/(\d+)',
                         url)

        if match:
            url = match.group(0)
            fetch_args = {
                # "force_refetch": True,
                "via_browser": True,
                "wait_for_selector": 'div[data-testid="tweetText"]'
            }

        match = re.match(
            'https://www.reddit.com/r/([a-zA-Z0-9_-]+)/comments/([a-zA-Z0-9_-]+)/',
            url)
        if match:
            url = match.group(0)
            fetch_args = {
                "via_browser": True,
                "wait_for_selector": 'div[data-adclicklocation="title"'
            }

        result = await crawler.crawl_or_fetch(url, **fetch_args)

        if result and result.path.endswith('.html'):
            html = result.data.decode('utf8')
            try:
                title = bs4.BeautifulSoup(
                    html, features="html5lib").select_one('title').text
            except:
                logging.info(f"Failed to extract title {url}")
            if not abstract:
                abstract = html_to_text(html)[:300]
        if html:
            match = re.match('https://openreview.net/forum\?id=([a-zA-Z_-]+)',
                             url)
            if match:
                title = bs4.BeautifulSoup(html,
                                          features="html5lib").select_one(
                                              'h2.note_content_title').text
                tags.add('paper')
            match = re.match('https://arxiv.org/abs/([0-9\.]+)', url)
            if match:
                title = bs4.BeautifulSoup(
                    html, features="html5lib").select_one('h1.title').text
                abstract = bs4.BeautifulSoup(
                    html,
                    features="html5lib").select_one('blockquote.abstract').text
                links['arxiv-vanity'] = ('https://www.arxiv-vanity.com/'
                                         f'papers/{match.group(1)}')
                tags.add('paper')
            match = re.match('https://news.ycombinator.com/item\?id=(\d+)',
                             url)
            if match:
                title = bs4.BeautifulSoup(
                    html,
                    features="html5lib").select_one('span.titleline').text
                tags.add('hackernews')
                tags.add('hn')

            match = re.match(
                'https://twitter.com/([a-zA-Z0-9_-]+)/status/(\d+)', url)
            if match:
                title = bs4.BeautifulSoup(
                    html, features="html5lib").select_one(
                        'div[data-testid="tweetText"]').text
                tags.add('twitter')
            match = re.match(
                'https://www.reddit.com/r/([a-zA-Z0-9_-]+)/comments/([a-zA-Z0-9_-]+)/',
                url)
            if match:
                title = bs4.BeautifulSoup(
                    html, features="html5lib").select_one(
                        'div[data-adclicklocation="title"]').text
                abstract = bs4.BeautifulSoup(
                    html, features="html5lib").select_one(
                        'div[data-adclicklocation="media"]').text
                tags.add("reddit")

        return dataclasses.replace(
            post,
            url=url,
            tags=list(tags),
            title=title,
            abstract=abstract,
            content=content,
            html=html,
        )