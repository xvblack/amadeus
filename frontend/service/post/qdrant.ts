import { indexClient, openai } from "../client";
import { Post } from "../../shared/search/type";

const openaiEmbed = async (content: string) => {
  return (
    await openai().createEmbedding({
      model: "text-embedding-ada-002",
      input: content,
    })
  ).data.data[0].embedding;
};

const toPoint = async (post: Post) => {
  if (post.id === undefined) {
    throw "Post must have a valid ID";
  }
  return {
    id: post.id,
    payload: {},
    vector: await openaiEmbed(post.abstract!),
  };
};

export const qdrantIndexPost = async (post: Post) => {
  const baseUrl = `${process.env.QDRANT_ADDR}/collections/${process.env.QDRANT_INDEX_NAME}/points`;

  const point = await toPoint(post);
  const response = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      points: [point],
    }),
  });
  console.log("QDrant indexed", response.status, await response.text());
};
