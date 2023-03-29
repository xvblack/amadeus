import asyncio
import lib.url
import hashlib
import httpx
import mimetypes
import json
import pathlib
import tempfile
import dataclasses
import io
import shutil
import playwright.async_api
import logging


class StorageDriver:

    async def save(self, filename, bytesio):
        pass

    async def get(self, filename, bytesio):
        pass

    async def glob(self, pattern):
        pass

    async def get_as_bytes(self, filename):
        with io.BytesIO() as buffer:
            await self.get(filename, buffer)
            return buffer.getvalue()


class FileStorageDriver(StorageDriver):

    def __init__(self, root) -> None:
        super().__init__()
        self.root = pathlib.Path(root)

    async def save(self, filename: str, bytesio):
        path = self.root / filename
        path.parents[0].mkdir(exist_ok=True, parents=True)
        with open(path, 'wb') as f:
            shutil.copyfileobj(bytesio, f)

    async def get(self, filename, bytesio):
        path = self.root / filename
        assert path.exists()
        with open(path, 'rb') as f:
            shutil.copyfileobj(f, bytesio)

    async def glob(self, pattern: str):
        for matched in self.root.glob(pattern):
            yield str(matched.relative_to(self.root))


class PlaywrightFetcher:

    def __init__(self):
        self.playwright_context_manager = None
        self.playwright = None
        self.browser = None
        self.semaphore = asyncio.Semaphore(5)
        self.lock = asyncio.Lock()

    async def _ensure_client(self):
        if not self.browser:
            async with self.lock:
                if not self.browser:
                    self.playwright_context_manager = playwright.async_api.async_playwright(
                    )
                    self.playwright = await self.playwright_context_manager.__aenter__(
                    )
                    self.browser = await self.playwright.webkit.launch()
                    print("Browser launched", self.browser)

    async def crawl(self, url, wait_for_selector=None, wait_for_time=None):
        async with self.semaphore:
            # async with self.limiter:
            await self._ensure_client()
            page = await self.browser.new_page()
            try:
                await page.goto(url)
                if wait_for_selector:
                    await page.wait_for_selector(wait_for_selector)
                else:
                    await asyncio.sleep(wait_for_time)
                return await page.content()
            finally:
                await page.close()


class Crawler:

    storage: StorageDriver

    @dataclasses.dataclass
    class Result:
        path: str
        data: bytes

    def __init__(self, storage) -> None:
        self.storage = storage
        self.playwright = PlaywrightFetcher()

    async def crawl_or_fetch(self,
                             url,
                             force_refetch=False,
                             via_browser=False,
                             wait_for_selector=None,
                             wait_for_time=5):

        url = lib.url.normalize(url)
        hash = hashlib.sha1(url.encode('utf8')).hexdigest()

        if not force_refetch:
            async for output in self.storage.glob(f'{hash}/output.*'):
                return Crawler.Result(path=output,
                                      data=await
                                      self.storage.get_as_bytes(output))

        meta = {}
        async with httpx.AsyncClient() as client:
            async with client.stream('GET',
                                     url,
                                     follow_redirects=True,
                                     timeout=10) as res:
                meta['http_status'] = res.status_code
                meta['headers'] = dict(res.headers.items())
                extension = None
                if 'content-type' in res.headers:
                    content_type = res.headers['content-type']
                    extension = mimetypes.guess_extension(content_type)
                if not extension:
                    extension = '.html'
                meta['extension'] = extension
                path = f'{hash}/output{extension}'
                await self.storage.save(
                    f'{hash}/meta.json',
                    io.BytesIO(bytes(json.dumps(meta), encoding="utf8")))
                if not via_browser:
                    with tempfile.SpooledTemporaryFile() as f:
                        async for chunk in res.aiter_bytes(chunk_size=819200):
                            f.write(chunk)
                        f.seek(0)
                        await self.storage.save(path, f)
        if via_browser:
            with tempfile.SpooledTemporaryFile() as f:
                content = await self.playwright.crawl(
                    url,
                    wait_for_selector=wait_for_selector,
                    wait_for_time=wait_for_time)
                f.write(bytes(content, encoding='utf8'))
                f.seek(0)
                await self.storage.save(path, f)
        logging.info("fetching URL %s returns result: %s", url,
                     res.status_code)
        return Crawler.Result(path=path,
                              data=await self.storage.get_as_bytes(path))
