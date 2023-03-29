import { typedFetch } from "../utils/fetch";
import { indexClient } from "./client";
import { Post } from "../common/type";

export const enrichPost = async (post: Post) => {
  const response = await typedFetch<Post>({
    method: "POST",
    path: `${process.env.INDEXER_ADDR!}/index-post`,
    body: post,
  });
  if (response.error !== undefined) {
    console.log("Failed to enrich post", response.error);
    throw response.error;
  }
  return {
    ...response.data,
    attrs: post.attrs,
  } as Post;
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
