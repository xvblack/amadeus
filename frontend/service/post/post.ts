import { Post } from "../../shared/search/type";
import { parseContent } from "../crawl";
import { savePocketPost } from "./db";
import { logger } from "../logger";
import { indexPost } from "./typesense";

export const saveAndIndexPost = async (post: Post) => {
  const enriched = await enrichPost(post);
  const saved = await savePocketPost(enriched);
  const indexed = await indexPost(saved);
};

export const enrichPost = async (post: Post) => {
  try {
    const { title, content, abstract, tags } = await parseContent(post.url);

    return {
      ...post,
      abstract: abstract ?? post.abstract,
      title: title ?? post.title,
      content: content ?? post.content,
      tags: post.tags.concat(tags.filter((tag) => post.tags.indexOf(tag) < 0)),
    } as Post;
  } catch (error) {
    logger.error("Failed to enrich %s %o", post.url, error);
    const errorMessage = `Failed to enrich ${post.url} ${error}`;
    return {
      ...post,
      title: post.title ?? post.url,
      content: post.content ?? post.abstract ?? errorMessage,
    };
  }
};
