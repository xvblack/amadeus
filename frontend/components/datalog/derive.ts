import { parseEDNString } from "edn-data";
import { Entity, Field, FindAndPull, Schema, View } from "./datalog";

export const deriveView = (schema: Schema) => {
  const fieldsByPrefix = schema.reduce((prev, curr) => {
    const entity = curr.attr.split("/")[0];
    if (!Object.hasOwn(prev, entity)) {
      prev[entity] = [];
    }
    prev[entity].push(curr);
    return prev;
  }, {} as Record<string, Field[]>);

  const views = Object.entries(fieldsByPrefix).map(([entity, fields]) => {
    return {
      name: entity,
      find: [{ l: "e", a: fields[0].attr, r: "_" }],
      key: "e",
      pull: fields.map((field) => ({ a: field.attr })),
    } as View;
  });

  return views;
};

export const wrapEdn = (edn: any): any => {
  if (!edn) {
    return undefined;
  } else if (Array.isArray(edn)) {
    return edn.map(wrapEdn);
  } else if (typeof edn === "string" || edn instanceof String) {
    return edn;
  } else if (Object.hasOwn(edn, "map")) {
    return Object.fromEntries(
      edn.map.map(([k, v]: [any, any]) => [wrapEdn(k), wrapEdn(v)])
    );
  } else if (Object.hasOwn(edn, "key")) {
    return ":" + edn.key;
  } else {
    return edn;
  }
};

type FieldEdn = {
  ":db/ident": string;
  ":db/valueType": string;
  ":db/cardinality": "one" | "many";
};

export const parseSchemaEdn = (edn: string) => {
  const parsed = wrapEdn(parseEDNString(edn)) as FieldEdn[];
  return parsed.map(
    (field) =>
      ({
        attr: field[":db/ident"],
        type: field[":db/valueType"],
        cardinality: field[":db/cardinality"],
      } as Field)
  );
};

export type EntityEdn = Record<string, any> & {
  ":db/ident": number;
};

export const parseDatabaseEdn = (edn: string) => {
  const parsed = wrapEdn(parseEDNString(edn)) as EntityEdn[];
  return parsed.map(
    (entity) =>
      ({
        id: entity[":db/ident"],
        attrs: entity,
      } as Entity)
  );
};
