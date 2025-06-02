import {tqdm} from "ts-tqdm";
import { logger } from "../service/logger";
// import { retrieveAllPosts } from "../service/pocket";
import { createClient } from "@supabase/supabase-js";
// import { typedFetch } from "../components/utils/fetch";
import { convert } from "html-to-text";

export type FetchResponse<T> =
  | {
      data: T;
      error?: undefined;
    }
  | {
      data?: undefined;
      error: any;
    };

export const typedFetch = async <T>({
  method,
  path,
  query,
  body,
}: {
  method: string;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: Record<string, any>;
}): Promise<FetchResponse<T>> => {
  const url = query
    ? `${path}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(query).filter(([k, v]) => v !== undefined) as [
            string,
            string
          ][]
        )
      ).toString()}`
    : path;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body && JSON.stringify(body),
      cache: "no-store",
    });

    if (response.ok) {
      const result = await response.json();
      return {
        data: result as T,
      };
    }
    return {
      error: {
        url: url,
        errorMessage: await response.text(),
      },
    };
  } catch (exception) {
    return {
      error: {
        url: url,
        exception,
      },
    };
  }
};


interface Post {
    id?: number;
    url: string;
    time_added: number;
    time_added_as_date?: string;
    source: string;
    tags: string[];
    attrs: Record<string, any>;
    links: Record<string, string>;
    title?: string;
    abstract?: string;
    content?: string;
  }
  
interface PocketPost {
    given_url: string;
    time_added: string;
    status: string;
    resolved_title?: string;
    given_title: string;
    excerpt?: string;
    item_id: string;
    top_image_url?: string;
    // tags: string[];
  }
  
  interface PocketRetrieveResponse {
    list: Record<string, PocketPost>;
  }
  

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const limit = parseInt(process.argv[2] ?? "100");

const partitionArray = <T>(array: T[], batchSize: number) => {
  return Array(Math.ceil(array.length / batchSize))
    .fill(0)
    .map((_, index) => index * batchSize)
    .map((begin) => array.slice(begin, begin + batchSize));
};


export const retrieveAllPosts = async ({
    limit,
    since,
    search,
  }: {
    limit: number;
    since: number;
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
        since: since,
      },
    });
  
    if (response.error !== undefined) {
      logger.error("Failed to fetch from pocket %o", response.error);
      throw response.error;
    }
  
    const posts = Object.values(response.data!.list);
  
    return posts.filter((post) => {
      if (!post["given_url"]) {
        logger.error("Invalid post %o", post);
        return false;
      }
      return true;
    }).map((post) => ({
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
  

export const trySyncPocket = async () => {
  logger.info("Received sync pocket request");
  const posts = await retrieveAllPosts({
    limit: limit,
    since: 0,
  });
  logger.info("Fetched %d posts from pocket ", posts.length);
  console.log(posts)
  const batched = partitionArray(posts, 32);

  for (const batch of tqdm(batched)) {
    await supabase.from("post").upsert(batch);
  }
};

trySyncPocket();
