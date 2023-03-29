import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";
import { retrieveAllPosts } from "../../../../service/pocket";
import { enrichPost, indexPost } from "../../../../service/post";
import { savePocketPost } from "../../../../service/db";
import { redis } from "../../../../service/client";

export interface SyncPocketRequest {
  limit: number;
  bestEffort?: boolean;
}

const partitionArray = <T>(array: T[], batchSize: number) => {
  return Array(Math.ceil(array.length / batchSize))
    .fill(0)
    .map((_, index) => index * batchSize)
    .map((begin) => array.slice(begin, begin + batchSize));
};

const TIMESTAMP_CACHE_KEY = "AMADEUS:LAST_SYNC_TIME";

export const trySyncPocket = async (params: SyncPocketRequest) => {
  console.log("Received sync pocket request");
  const bestEffort = params.bestEffort;
  if (bestEffort) {
    const lastSynced = await redis().get(TIMESTAMP_CACHE_KEY);
    if (lastSynced !== null) {
      const lasySyncedEpoch = parseInt(lastSynced);
      if (Date.now() / 1000 - lasySyncedEpoch < 60) {
        console.log("Skipped refreshing");
        return false;
      }
    }
  }
  await redis().set(
    TIMESTAMP_CACHE_KEY,
    Math.ceil(Date.now() / 1000).toString()
  );
  const posts = await retrieveAllPosts({ limit: params.limit });
  console.log("Fetched ", posts.length, " posts from pocket");
  const batched = partitionArray(posts, 32);
  const lock = pLimit(10);

  const cumulated = [] as any[];

  for (const batch of batched) {
    const result = await Promise.all(
      batch.map(async (post) => {
        return lock(async () => {
          try {
            console.log(`Processing ${post.url}`);
            const enriched = await enrichPost(post);
            delete enriched["id"];
            const saved = await savePocketPost(enriched);
            const indexed = await indexPost(saved);
            console.log(`Indexed ${post.url}`);
            return {
              url: post.url,
              status: "SUCCESS",
            };
          } catch (exception) {
            console.log(exception);
            return {
              url: post.url,
              status: `FAILED due to ${exception}`,
            };
          }
        });
      })
    );
    cumulated.push(...result);
  }
  return cumulated;
};

export async function POST(req: NextRequest) {
  try {
    const params = (await req.json()) as SyncPocketRequest;
    const result = await trySyncPocket(params);
    if (result === false) {
      return NextResponse.json({
        message: "no need",
      });
    }
    return NextResponse.json({
      message: "done",
      result: result,
    });
  } catch (exception) {
    console.log(exception);
    return NextResponse.json(
      {
        message: `failed due to ${exception}`,
      },
      {
        status: 500,
      }
    );
  }
}
