import "server-only";
import createClient from "edgedb";
import { Configuration, OpenAIApi } from "openai";
import { SearchClient, Client } from "typesense";
import { createClient as createRedisClient, RedisClientType } from "redis";

const cachedClient =
  <T>(name: string, provider: () => T): (() => T) =>
  () => {
    if (!Object.hasOwn(globalThis, name)) {
      const client = provider();
      (globalThis as any)[name] = client;
      return client;
    } else {
      return (globalThis as any)[name];
    }
  };

const parseTypesenseAddr = (addr: string) => {
  const match = addr.match(/([a-z]+):\/\/([^:]+):([0-9]+)(.*)/);
  if (!match) {
    throw `invalid typesense addr ${match}`;
  }
  return {
    protocol: match[1],
    host: match[2],
    port: parseInt(match[3]),
    path: match[4],
  };
};

export const searchClient = cachedClient(
  "typesenseSearch",
  () =>
    new SearchClient({
      apiKey: process.env.TYPESENSE_API_KEY!,
      nodes: [parseTypesenseAddr(process.env.TYPESENSE_ADDR!)],
      cacheSearchResultsForSeconds: 0,
    })
);

export const indexClient = cachedClient(
  "typesenseReadwrite",
  () =>
    new Client({
      apiKey: process.env.TYPESENSE_API_KEY!,
      nodes: [parseTypesenseAddr(process.env.TYPESENSE_ADDR!)],
      cacheSearchResultsForSeconds: 0,
    })
);

export const openai = cachedClient("openai", () => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
});

export const redis = cachedClient("redis", () => {
  const client = createRedisClient({
    url: process.env.REDIS_SERVER,
  });
  client.connect().then(() => {
    console.log("REDIS connected");
  });
  return client;
});

export const edgedbClient = createClient({
  dsn: process.env.AMADEUS_EDGEDB_DSN,
  tlsSecurity: "insecure",
});
