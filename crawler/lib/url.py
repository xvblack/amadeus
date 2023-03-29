import urllib.parse

TRACKERS = set(["utm_source"])


def normalize(s):
    url = urllib.parse.urlparse(s)
    path = "{scheme}://{netloc}{path}".format(
        scheme=url.scheme, netloc=url.netloc, path=url.path or "/")
    if url.query:
        for i, part in enumerate(url.query.split("&")):
            if "=" in part and part.split("=")[0] in TRACKERS:
                continue
            if i == 0:
                path += "?"
            else:
                path += "&"
            path += part
        if url.fragment:
            path += "#" + url.fragment
    return path


# ParseResult(scheme='scheme', netloc='netloc', path='/path;parameters', params='',
#             query='query', fragment='fragment')
