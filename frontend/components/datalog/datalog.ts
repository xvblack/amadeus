import assert from "assert";

export type EntityId = number;
export type FindQuery = { l?: string; a: string; r?: string; v?: any }[];
export type PullQuery = { a: string; nested?: PullQuery }[];
export type Attrs = Record<string, any>;
export type AVE = { a: string; v: any; e: EntityId };
export type EAV = { a: string; v: any; e: EntityId };
export type Entity = {
  id: EntityId;
  attrs: Attrs;
};
export type FindAndPull = {
  name?: string;
  find: FindQuery;
  key: string;
  pull: PullQuery;
};
export type View = FindAndPull & {
  name: string;
};
export type Field = {
  attr: string;
  type: string;
  cardinality: "one" | "many";
};
export type Schema = Field[];

const _datalogPull = (
  query: PullQuery,
  roots: EntityId[],
  // schemas: Record<string, Schema>,
  entities: Record<EntityId, Entity>
) => {
  return roots.map((root) => {
    const ret = { ":ident": root } as Record<string, any>;
    for (const part of query) {
      const v = entities[root].attrs[part.a];
      if (!v) {
        continue;
      }
      if (part.nested) {
        if (Array.isArray(v)) {
          ret[part.a] = _datalogPull(part.nested, v, entities);
        } else {
          ret[part.a] = _datalogPull(part.nested, [v], entities)[0];
        }
      } else {
        ret[part.a] = v;
      }
    }
    return ret;
  });
};

export const datalogPull = (
  query: PullQuery,
  roots: EntityId[],
  entities: Entity[]
) => {
  const entityMap = Object.fromEntries(
    entities.map((entity) => [entity.id, entity])
  );

  return _datalogPull(query, roots, entityMap);
};

export const datalogFind = (query: FindQuery, entities: Entity[]) => {
  assert(query.length > 0, "Query should not be empty");
  const aves = entities.flatMap((entity) =>
    Object.entries(entity.attrs).map(([k, v]) => ({
      a: k,
      v: v,
      e: entity.id,
    }))
  );
  let prevMatches: Attrs[] | undefined = undefined;
  for (const { l: ql, a: qa, r: qr, v: qv } of query) {
    const matches = aves.flatMap(({ a, v, e }) => {
      if (qa !== a) {
        return [];
      }
      if (ql !== undefined && qr !== undefined) {
        return [{ [ql]: e, [qr]: v }];
      }
      if (ql === undefined && qv === e) {
        return [{ [qr!]: v }];
      }
      if (qr === undefined && qv === v) {
        return [{ [ql!]: e }];
      }
      return [];
    });
    if (prevMatches === undefined) {
      prevMatches = matches;
    } else if (prevMatches.length === 0 || matches.length === 0) {
      prevMatches = [];
    } else {
      const commonAttrs = Object.keys(prevMatches[0]).filter((k) =>
        Object.hasOwn(matches[0], k)
      );
      const toKey = (attrs: Attrs) => JSON.stringify(attrs, commonAttrs);
      const mergeMap = {} as Record<string, { l: Attrs[]; r: Attrs[] }>;
      for (const prevMatch of prevMatches) {
        const key = toKey(prevMatch);
        if (!Object.hasOwn(mergeMap, key)) {
          mergeMap[key] = { l: [], r: [] };
        }
        mergeMap[key].l.push(prevMatch);
      }
      for (const match of matches) {
        const key = toKey(match);
        if (Object.hasOwn(mergeMap, key)) {
          mergeMap[key].r.push(match);
        }
      }
      const ret = [];
      for (const { l, r } of Object.values(mergeMap)) {
        for (const lv of l) {
          for (const rv of r) {
            ret.push({
              ...lv,
              ...rv,
            });
          }
        }
      }
      prevMatches = ret;
    }
  }
  return prevMatches!;
};
