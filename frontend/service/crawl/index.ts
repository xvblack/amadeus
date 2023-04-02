import { JSDOM, VirtualConsole } from "jsdom";
import { Readability } from "@mozilla/readability";
import axios from "axios";
import { logger } from "../logger";

const TWITTER_PATTERN =
  /https:\/\/twitter.com\/([a-zA-Z0-9_-]+)\/status\/(\d+)/;
const HN_PREMII_PATTERN = /http:\/\/hn.premii.com\/#\/comments\/(\d+)/;
const ARXIV_ABS_PATTERN = /https:\/\/arxiv.org\/abs\/([0-9]+\.[a-zA-Z0-9-_]+)/;
const ARXIV_PDF_PATTERN =
  /https:\/\/arxiv.org\/pdf\/([0-9]+\.[a-zA-Z0-9-_]+).pdf/;
const OPEN_REVIEW_PDF_PATTERN =
  /https:\/\/openreview.net\/pdf\?id=([a-zA-Z0-9_-]+)/;
const REDDIT_PATTERN =
  /https:\/\/www.reddit.com\/r\/([a-zA-Z0-9_-]+)\/comments\/([a-zA-Z0-9_-]+)\//;

const NORMALIZE_URL_MAPPING = [
  [
    OPEN_REVIEW_PDF_PATTERN,
    (group: RegExpMatchArray) => `https://openreview.net/forum?id=${group[1]}`,
  ],
  [
    ARXIV_PDF_PATTERN,
    (group: RegExpMatchArray) => `https://arxiv.org/abs/${group[1]}`,
  ],
  [
    HN_PREMII_PATTERN,
    (group: RegExpMatchArray) =>
      `https://news.ycombinator.com/item?id=${group[1]}`,
  ],
] as [RegExp, (group: RegExpMatchArray) => string][];

const normalizeUrl = (url: string) => {
  for (const [pattern, converter] of NORMALIZE_URL_MAPPING) {
    const match = url.match(pattern);
    if (match) {
      return converter(match);
    }
  }
  return url;
};

export interface Content {
  title: string;
  content: string;
  tags: string[];
}

export const parseContent = async (url: string): Promise<Content> => {
  const normalized = normalizeUrl(url);

  if (normalized.match(TWITTER_PATTERN)) {
    return enrichTwitter(normalized);
  }
  //  else if (normalized.match(REDDIT_PATTERN)) {
  //   return enrichReddit(normalized);
  // }
  return enrichRawHtml(normalized);
};

const enrichTwitter = async (url: string) => {
  const match = url.match(TWITTER_PATTERN);
  if (!match) {
    throw "Unexpect";
  }
  const publishUrl = `https://publish.twitter.com/oembed?dnt=true&omit_script=true&url=https://mobile.twitter.com/i/status/${match[1]}`;
  const json = await (
    await fetch(publishUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
  ).json();
  return {
    title: json["author_name"],
    content: json["html"],
    tags: [],
  };
};

const enrichRawHtml = async (url: string): Promise<Content> => {
  const tags = [] as string[];
  if (url.match(ARXIV_ABS_PATTERN)) {
    tags.push("paper");
  }
  const response = await axios.get(url);

  if (response.status >= 400) {
    throw "Unable to connect";
  }
  const contentType =
    (response.headers["content-type"] as string | undefined) ??
    "application/unknown";
  if (contentType.startsWith("text/plain")) {
    const content = response.data as string;
    return {
      title: content.split("\n")[0],
      content: content,
      tags: [],
    };
  } else if (contentType.startsWith("text/html")) {
    const content = response.data;
    const article = htmlToArticle(content);
    if (!article) {
      throw "Failed to parse";
    }
    return {
      title: article.title,
      content: article.content,
      tags,
    };
  } else {
    throw `Unable to parse non text format ${contentType} for now`;
  }
};

const htmlToArticle = (html: string) => {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", () => {
    // No-op to skip console errors.
  });
  const dom = new JSDOM(html, { virtualConsole });
  const article = new Readability(dom.window.document).parse();
  return article;
};
