import { indexClient } from "../client";
import { Post } from "../../shared/search/type";
import { parseContent } from "../crawl";
import { savePocketPost } from "./db";

export const saveAndIndexPost = async (post: Post) => {
  const enriched = await enrichPost(post);
  const saved = await savePocketPost(enriched);
  const indexed = await indexPost(saved);
};

export const enrichPost = async (post: Post) => {
  try {
    const { title, content } = await parseContent(post.url);

    return {
      ...post,
      title,
      content,
    } as Post;
  } catch (error) {
    console.error("Failed to enrich ", post.url, error);
    const errorMessage = `Failed to enrich ${post.url} ${error}`;
    return {
      ...post,
      title: post.title ?? post.url,
      content: post.content ?? post.abstract ?? errorMessage,
    };
  }
};

export const indexPost = async (post: Post) => {
  return await indexClient()
    .collections(process.env.TYPESENSE_INDEX_NAME!)
    .documents()
    .upsert({
      ...post,
      id: post.id?.toString(),
      links: JSON.stringify(post.links),
    });
};
