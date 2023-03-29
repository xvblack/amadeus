"use client";
import { parseEDNString } from "edn-data";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  datalogFind,
  datalogPull,
  Entity,
  EntityId,
  Field,
  FindAndPull,
  FindQuery,
  PullQuery,
  Schema,
  View,
} from "../../components/datalog/datalog";
import {
  deriveView,
  parseDatabaseEdn,
  parseSchemaEdn,
  wrapEdn,
} from "../../components/datalog/derive";
import {
  expandRequirement,
  generateData,
  generateSchema,
} from "./prompt-gen-db";
import { PanelContainer, PanelWrap } from "../../components/panel";

// const databaseAtom = atom([
//   {
//     id: 1,
//     attrs: {
//       ":employee/name": "bob",
//       ":employee/manager": 2,
//     },
//   },
//   {
//     id: 2,
//     attrs: {
//       ":employee/name": "alice",
//     },
//   },
// ] as Entity[]);
const schemaAtom = atom([] as Field[]);
const databaseAtom = atom([] as Entity[]);
// const databaseAtom = atom(
//   parseDatabaseEdn(`
// [
//   {:db/ident 1
//    :customer/name "John Doe"
//    :customer/contactInfo "john@example.com"
//    :customer/accountInfo "12345678"
//    :customer/purchaseHistory "computer, printer, mouse"
//   },
//   {:db/ident 2
//    :lead/name "Jane Smith"
//    :lead/contactInfo "jane@example.com"
//    :lead/notes "Call back on Monday"
//    :lead/followUpTasks "Send email"
//   },
//   {:db/ident 3
//    :opportunity/stage "Closed Won"
//    :opportunity/closeDate #inst "2020-09-10"
//    :opportunity/expectedValue 1000.00
//   },
//   {:db/ident 4
//    :product/description "Laptop"
//    :product/price 2000.00
//   }
//  ]`)
// );

// const viewsAtom = atom([
//   {
//     name: "花名册",
//     find: [{ l: "e", a: ":employee/name", r: "_" }],
//     key: "e",
//     pull: [
//       { a: ":employee/name" },
//       { a: ":employee/manager", nested: [{ a: ":employee/name" }] },
//     ],
//   },
// ] as View[]);
// const schemaAtom = atom(
//   parseSchemaEdn(`
// [
//   { :db/ident :customer/name
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The customer's name"},
//   { :db/ident :customer/contactInfo
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The customer's contact information"},
//   { :db/ident :customer/accountInfo
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The customer's account information"},
//   { :db/ident :customer/purchaseHistory
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The customer's purchase history"},
//   { :db/ident :lead/name
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The lead's name"},
//   { :db/ident :lead/contactInfo
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The lead's contact information"},
//   { :db/ident :lead/notes
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The lead's notes"},
//   { :db/ident :lead/followUpTasks
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The lead's follow up tasks"},
//   { :db/ident :opportunity/stage
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The opportunity's stage in the sales process"},
//   { :db/ident :opportunity/closeDate
//     :db/valueType :db.type/instant
//     :db/cardinality :db.cardinality/one
//     :db/doc "The opportunity's estimated close date"},
//   { :db/ident :opportunity/expectedValue
//     :db/valueType :db.type/float
//     :db/cardinality :db.cardinality/one
//     :db/doc "The opportunity's expected value"},
//   { :db/ident :product/description
//     :db/valueType :db.type/string
//     :db/cardinality :db.cardinality/one
//     :db/doc "The product description"},
//   { :db/ident :product/price
//     :db/valueType :db.type/float
//     :db/cardinality :db.cardinality/one
//     :db/doc "The product price"}
// ]`) as Schema
// );

const viewsAtom = atom((get) => {
  return deriveView(get(schemaAtom));
});

const useFind = (find: FindQuery) => {
  const entities = useAtomValue(databaseAtom);
  return datalogFind(find, entities);
};

const usePull = (pull: PullQuery, roots: EntityId[]) => {
  const entities = useAtomValue(databaseAtom);
  return datalogPull(pull, roots, entities);
};

// const usePull = (pull: PullQuery) => {
//   const entities = useAtom(databaseAtom);
//   return expandPull(pull, entities);
// }

interface Chat {
  input: string;
  output?: string;
}

const chatsAtom = atom([] as Chat[]);

const Render = ({ value, schema }: { value: any; schema: PullQuery }) => {
  return (
    <>
      {schema.map((part) => {
        const v = value[part.a];
        if (v) {
          if (part.nested) {
            let nested;
            if (Array.isArray(v)) {
              nested = v.map((child, i) => (
                <div key={i} className="pl-10">
                  <Render value={child} schema={part.nested!}></Render>
                </div>
              ));
            } else {
              nested = (
                <div className="pl-10">
                  <Render value={v} schema={part.nested!}></Render>
                </div>
              );
            }
            return (
              <div key={part.a}>
                {part.a}:{nested}
              </div>
            );
          } else {
            return (
              <div key={part.a}>
                {part.a}:{JSON.stringify(v)}
              </div>
            );
          }
        }
      })}
    </>
  );
};

const useFindAndPull = ({
  find,
  key,
  pull,
}: {
  find: FindQuery;
  key: string;
  pull: PullQuery;
}) => {
  const findResult = useFind(find);
  const roots = findResult?.map((e) => e[key]);
  return usePull(pull, roots);
};

const Demo = ({ findAndPull }: { findAndPull: FindAndPull }) => {
  const listView = useFindAndPull(findAndPull);
  return (
    <div>
      {listView.map((obj, i) => (
        <div className="shadow" key={i}>
          <Render value={obj} schema={findAndPull.pull}></Render>
        </div>
      ))}
    </div>
  );
};

// const Chat = ({ chat }: { chat: Chat }) => {
//   // const edn = useGenDbSchema({ requirement: chat.input });
//   const edn = "Not loaded";

//   return (
//     <div>
//       <div>{chat.input}</div>
//       <pre>{JSON.stringify(edn)}</pre>
//     </div>
//   );
// };

// const ChatBox = () => {
//   const [chats, setChats] = useAtom(chatsAtom);
//   const [value, setValue] = useState("");

//   return (
//     <div className="flex flex-col overflow-auto">
//       <div className="">
//         {chats.map((chat, i) => {
//           return <Chat key={i} chat={chat}></Chat>;
//         })}
//       </div>
//       <textarea
//         className="w-full"
//         rows={8}
//         onChange={(e) => setValue(e.target.value)}
//       ></textarea>
//       <button onClick={() => setChats([...chats, { input: value }])}>
//         Submit
//       </button>
//     </div>
//   );
// };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Build = () => {
  const [draft, setDraft] = useState("");
  const [requirement, setRequirement] = useState("");
  const [expanded, setExpanded] = useState("");
  const [schemaText, setSchemaText] = useState("");
  const [dataText, setDataText] = useState("");
  const setSchemaAtom = useSetAtom(schemaAtom);
  const setDatabaseAtom = useSetAtom(databaseAtom);
  useEffect(() => {
    (async () => {
      if (!requirement) {
        return;
      }
      // await sleep(1000);
      setExpanded((await expandRequirement({ requirement }))!);
    })();
  }, [requirement]);
  useEffect(() => {
    (async () => {
      if (!expanded) {
        return;
      }
      // await sleep(1000);
      const completion = (await generateSchema({ expanded }))!;
      setSchemaText(completion);
      (window as any).schemaText = completion;
      setSchemaAtom(parseSchemaEdn(completion));
    })();
  }, [expanded]);
  useEffect(() => {
    (async () => {
      if (!schemaText || !expanded) {
        return;
      }
      // await sleep(1000);
      const completion = (await generateData({
        schema: schemaText,
        expanded,
      }))!;
      setDataText(completion);
      (window as any).dataText = completion;
      setDatabaseAtom(parseDatabaseEdn(completion));
    })();
  }, [schemaText, expanded]);
  return (
    <div>
      <div className="shadow">
        <pre>ORIGINAL REQUIREMENT: {requirement}</pre>
      </div>
      <div className="shadow">
        <pre>EXPANDED REQUIREMENT: {expanded}</pre>
      </div>
      <div className="shadow">
        <pre>SCHEMA: {schemaText}</pre>
      </div>
      <div className="shadow">
        <pre>DATA: {dataText}</pre>
      </div>
      <textarea
        className="w-full"
        rows={8}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      ></textarea>
      <button
        onClick={() => {
          setRequirement(draft);
          setDraft("");
        }}
      >
        Submit
      </button>
    </div>
  );
};

const selectedViewAtom = atom(undefined as View | undefined);

const ViewList = () => {
  const views = useAtomValue(viewsAtom);
  const setSelecteView = useSetAtom(selectedViewAtom);
  return (
    <>
      {views.map((view) => (
        <div key={view.name}>
          <a
            href="javascript:void(0);"
            onClick={() => {
              setSelecteView(view);
            }}
          >
            {view.name}
          </a>
        </div>
      ))}
    </>
  );
};

const Home = () => {
  const queries = useAtomValue(viewsAtom);
  const selectedView = useAtomValue(selectedViewAtom);
  return (
    <PanelContainer width={3000}>
      <PanelWrap index={0} width={500}>
        <Build></Build>
      </PanelWrap>
      <PanelWrap index={1} width={500}>
        <ViewList></ViewList>
      </PanelWrap>
      <PanelWrap index={2} width={500}>
        {selectedView && <Demo findAndPull={selectedView}></Demo>}
      </PanelWrap>
    </PanelContainer>
  );
};

export default Home;
