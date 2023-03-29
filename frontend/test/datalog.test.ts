/* globals describe, expect, it */
import { parseEDNString } from "edn-data";
import {
  datalogFind,
  datalogPull,
  Schema,
} from "../components/datalog/datalog";
import { parseSchemaEdn, wrapEdn } from "../pages/generate/derive";

describe("datalog", () => {
  it("matches query", () => {
    console.log(
      datalogFind(
        [{ l: "e", a: ":attr1", v: "x" }],
        [
          {
            id: 1,
            attrs: {
              ":attr1": "x",
            },
          },
          {
            id: 2,
            attrs: {
              ":attr1": "y",
            },
          },
        ]
      )
    );

    console.log(
      datalogFind(
        [
          { l: "e", a: ":attr_ref", r: "x" },
          { l: "x", a: ":attr1", r: "v" },
        ],
        [
          {
            id: 1,
            attrs: {
              ":attr1": "x",
              ":attr_ref": 2,
            },
          },
          {
            id: 2,
            attrs: {
              ":attr1": "y",
            },
          },
        ]
      )
    );
    // expect("abc").toBe("bcd");
  });
});

describe("datalog", () => {
  it("pull query", () => {
    console.log(
      datalogPull(
        [{ a: ":attr1" }, { a: ":attr_ref", nested: [{ a: ":attr1" }] }],
        [1, 2],
        [
          {
            id: 1,
            attrs: {
              ":attr1": "x",
              ":attr_ref": 2,
            },
          },
          {
            id: 2,
            attrs: {
              ":attr1": "y",
            },
          },
        ]
      )
    );
    // expect("abc").toBe("bcd");
  });
});

describe("Validate parsing", () =>
  it("parse EDN", () => {
    const edn = parseSchemaEdn(`
  [
    { :db/ident :customer/name
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The customer's name"},
    { :db/ident :customer/contactInfo
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The customer's contact information"},
    { :db/ident :customer/accountInfo
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The customer's account information"},
    { :db/ident :customer/purchaseHistory
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The customer's purchase history"},
    { :db/ident :lead/name
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The lead's name"},
    { :db/ident :lead/contactInfo
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The lead's contact information"},
    { :db/ident :lead/notes
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The lead's notes"},
    { :db/ident :lead/followUpTasks
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The lead's follow up tasks"},
    { :db/ident :opportunity/stage
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The opportunity's stage in the sales process"},
    { :db/ident :opportunity/closeDate
      :db/valueType :db.type/instant
      :db/cardinality :db.cardinality/one
      :db/doc "The opportunity's estimated close date"},
    { :db/ident :opportunity/expectedValue
      :db/valueType :db.type/float
      :db/cardinality :db.cardinality/one
      :db/doc "The opportunity's expected value"},
    { :db/ident :product/description
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The product description"},
    { :db/ident :product/price
      :db/valueType :db.type/float
      :db/cardinality :db.cardinality/one
      :db/doc "The product price"}
  ]`) as Schema;
    console.log(edn);
  }));
