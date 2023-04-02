import { Post } from "../../shared/search/type";
import { parseContent } from "../crawl";
import { savePocketPost } from "./db";
import { logger } from "../logger";
import { indexPost } from "./typesense";
import { qdrantIndexPost } from "./qdrant";

export const saveAndIndexPost = async (post: Post) => {
  const enriched = await enrichPost(post);
  const saved = await savePocketPost(enriched);
  const indexed = await indexPost(saved);
  if (process.env.ENABLE_QDRANT === "true") {
    const embedIndexed = await qdrantIndexPost(saved);
  }
};

export const enrichPost = async (post: Post) => {
  try {
    const { title, content, tags } = await parseContent(post.url);

    return {
      ...post,
      title,
      content,
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
