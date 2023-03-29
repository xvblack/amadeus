import { Post } from "../../shared/search/type";

export type Highlight = {
  field: string;
  matched_tokens: string[];
  snippet: string;
};

export type Hit = Post & {
  highlights: Highlight[];
  attrs: Record<string, any>;
} & Record<string, unknown>;

export const queryStateInit = {
  init: false,
  unreadOnly: false,
  titleOnly: false,
  query: "",
  tags: [] as string[],
  facetFields: [],
  itemsPerPage: 20,
  currentPage: 1,
};

export type QueryState = typeof queryStateInit;

export const queryResultInit = {
  requestTimestamp: 0,
  hit: undefined,
  hits: [] as Hit[],
  numPages: 0,
};

export type QueryResult = typeof queryResultInit;
