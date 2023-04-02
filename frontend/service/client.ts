import "server-only";
import { Configuration, OpenAIApi } from "openai";
import { SearchClient, Client } from "typesense";
import { createClient as createRedisClient, RedisClientType } from "redis";
import { container } from "./binding";

export const Symbols = {
  SearchClient: Symbol.for("SearchClient"),
  IndexClient: Symbol.for("IndexClient"),
  OpenAIClient: Symbol.for("OpenAIClient"),
  RedisClient: Symbol.for("RedisClient"),
};

container
  .bind(Symbols.SearchClient)
  .toDynamicValue(
    () =>
      new SearchClient({
        apiKey: process.env.TYPESENSE_API_KEY!,
        nodes: [parseTypesenseAddr(process.env.TYPESENSE_ADDR!)],
        cacheSearchResultsForSeconds: 0,
      })
  )
  .inSingletonScope();

export const searchClient = () =>
  container.get<SearchClient>(Symbols.SearchClient);

container
  .bind(Symbols.IndexClient)
  .toDynamicValue(
    () =>
      new Client({
        apiKey: process.env.TYPESENSE_API_KEY!,
        nodes: [parseTypesenseAddr(process.env.TYPESENSE_ADDR!)],
        cacheSearchResultsForSeconds: 0,
      })
  )
  .inSingletonScope();

export const indexClient = () => container.get<Client>(Symbols.IndexClient);

container
  .bind(Symbols.OpenAIClient)
  .toDynamicValue(() => {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return new OpenAIApi(configuration);
  })
  .inSingletonScope();

export const openai = () => container.get<OpenAIApi>(Symbols.OpenAIClient);

container
  .bind(Symbols.RedisClient)
  .toDynamicValue(async () => {
    const client = createRedisClient({
      url: process.env.REDIS_SERVER,
    });
    await client.connect().then(() => {
      console.log("REDIS connected");
    });
    return client;
  })
  .inSingletonScope();

export const redis = () => container.get<RedisClientType>(Symbols.RedisClient);

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
