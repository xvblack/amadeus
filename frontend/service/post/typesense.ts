import { indexClient, searchClient } from "../client";
import { Post } from "../../shared/search/type";
import { SearchParams } from "typesense/lib/Typesense/Documents";

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

export const searchPost = async (query: SearchParams) => {
  return await searchClient()
    .collections(process.env.TYPESENSE_INDEX_NAME!)
    .documents()
    .search(query, {});
};
