import pLimit from "p-limit";
import { SyncPocketRequest } from "../../app/api/pocket/sync-pocket/route";
import { logger } from "../logger";
import { retrieveAllPosts } from "../pocket";
import { fetchLatestPocketPost } from "../post/db";
import { saveAndIndexPost } from "../post/post";

const partitionArray = <T>(array: T[], batchSize: number) => {
  return Array(Math.ceil(array.length / batchSize))
    .fill(0)
    .map((_, index) => index * batchSize)
    .map((begin) => array.slice(begin, begin + batchSize));
};

export const trySyncPocket = async (params: SyncPocketRequest) => {
  logger.info("Received sync pocket request");
  const latestPocketPostTimestamp =
    (await fetchLatestPocketPost())?.time_added ?? 0;
  const posts = await retrieveAllPosts({
    limit: params.limit,
    since: latestPocketPostTimestamp,
  });
  logger.info("Fetched %d posts from pocket ", posts.length);
  const batched = partitionArray(posts, 32);
  const lock = pLimit(10);

  const cumulated = [] as any[];

  for (const batch of batched) {
    const result = await Promise.all(
      batch.map(async (post) => {
        return lock(async () => {
          try {
            logger.info(`Processing ${post.url}`);
            const indexed = await saveAndIndexPost(post);
            logger.info(`Indexed ${post.url}`);
            return {
              url: post.url,
              status: "SUCCESS",
            };
          } catch (exception) {
            logger.info(exception);
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
