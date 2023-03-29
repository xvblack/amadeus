import { typedFetch } from "../utils/fetch";
import { Post } from "../common/type";

const { convert } = require("html-to-text");

interface PocketPost {
  given_url: string;
  time_added: string;
  status: string;
  resolved_title?: string;
  given_title: string;
  excerpt?: string;
  item_id: string;
  top_image_url?: string;
}

interface PocketRetrieveResponse {
  list: Record<string, PocketPost>;
}

export const retrieveAllPosts = async ({
  limit,
  search,
}: {
  limit: number;
  search?: string;
}) => {
  const response = await typedFetch<PocketRetrieveResponse>({
    method: "GET",
    path: "https://getpocket.com/v3/get",
    query: {
      consumer_key: process.env.POCKET_CONSUMER_KEY!,
      access_token: process.env.POCKET_ACCESS_TOKEN!,
      state: "all",
      count: limit.toString(),
      search: search,
    },
  });

  if (response.error !== undefined) {
    console.log("Failed to fetch from pocket", response.error);
    throw response.error;
  }

  const posts = Object.values(response.data!.list);

  return posts.map((post) => ({
    url: post["given_url"],
    time_added: parseInt(post["time_added"]),
    source: "pocket",
    tags: parseInt(post["status"] ?? "-1") === 0 ? ["pocket:unread"] : [],
    title: post["resolved_title"] ?? post["given_title"],
    abstract: convert(post["excerpt"] ?? ""),
    attrs: {
      pocket_id: post["item_id"],
      image_url: post["top_image_url"] ?? "",
    },
    links: {},
  })) as Post[];
};

export const archivePost = async ({ itemId }: { itemId: string }) => {
  const response = await typedFetch<void>({
    method: "POST",
    path: "https://getpocket.com/v3/send",
    body: {
      consumer_key: process.env.POCKET_CONSUMER_KEY,
      access_token: process.env.POCKET_ACCESS_TOKEN,
      actions: [
        {
          action: "archive",
          item_id: itemId,
        },
      ],
    },
  });

  if (response.error !== undefined) {
    console.log("Failed to achive post", response.error);
    throw response.error;
  }

  return response.data!;
};
