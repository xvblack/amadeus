"use client";
import ClientJSONTree from "../../../../../../components/json";
import { useCallback, useMemo, useState } from "react";
import { PageConfig } from "../../../../dsl";
import { atom, PrimitiveAtom } from "jotai/vanilla";
import { useAtom, useAtomValue, useSetAtom } from "jotai/react";

const TypedInput = ({
  type,
  value,
  setValue,
}: {
  type: string;
  value: any;
  setValue: (v: any) => void;
}) => {
  const [input, setInput] = useState(JSON.stringify(value));
  return (
    <input
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
        try {
          const json = JSON.parse(e.target.value);
          setValue(json);
        } catch {}
      }}
    ></input>
  );
};

interface InputField {
  name: string;
  type: string;
}

const parseInputs = (code: string): InputField[] => {
  const inputs = [] as InputField[];
  for (const placeholder of code.matchAll(/<([^>]+)>/g)) {
    const name = placeholder[1];
    inputs.push({
      name,
      type: "raw",
    });
  }
  return inputs;
};

export const TypedInputForm = ({
  formStateAtom,
  inputs,
}: {
  formStateAtom: PrimitiveAtom<Record<string, any>>;
  inputs: InputField[];
}) => {
  const [values, setValues] = useAtom(formStateAtom);

  return (
    <div>
      {inputs.map((input) => (
        <div key={input.name}>
          {input.name}
          {": "}
          <TypedInput
            type={input.type}
            value={values[input.name]}
            setValue={(v: any) =>
              setValues((old) => ({
                ...old,
                [input.name]: v,
              }))
            }
          ></TypedInput>
        </div>
      ))}
    </div>
  );
};

const stringify = (v: any) => {
  if (typeof v === "string") {
    return v;
  }
  return JSON.stringify(v);
};

export const Select = ({
  moduleName,
  code,
  updateOps,
}: {
  moduleName: string;
  code: string;
  updateOps: { name: string; op: (values: Record<string, any>) => void }[];
}) => {
  const inputs = useMemo(() => parseInputs(code), [code]);
  const formStateAtom = useMemo(() => atom({} as Record<string, any>), []);

  const [result, setResult] = useState(undefined as any);
  const values = useAtomValue(formStateAtom);
  const callback = useCallback(
    async (values: Record<string, any>) => {
      try {
        let query = code;
        for (const input of inputs) {
          query = query.replace(
            `<${input.name}>`,
            JSON.stringify(values[input.name])
          );
        }
        console.log("Query", { query, code, values });
        const result = await fetch("/api/agta/query-agta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moduleName,
            query: `${query}`,
          }),
        }).then((res) => res.json());
        setResult(JSON.parse(result.result));
      } catch (exception) {
        console.error(exception);
      }
    },
    [code, inputs, moduleName]
  );

  return (
    <div>
      <TypedInputForm
        formStateAtom={formStateAtom}
        inputs={inputs}
      ></TypedInputForm>
      <button
        onClick={() => {
          callback(values);
        }}
      >
        Query
      </button>
      {result && result.length && result.length > 0 && (
        <table>
          <thead>
            <tr>
              {(() => {
                const sample = (result as Record<string, any>[])[0];
                const row = Object.keys(sample)
                  .sort()
                  .map((key, i) => <th key={i}>{key}</th>);
                const placeholders = updateOps.map((op) => (
                  <th key={op.name}></th>
                ));
                return [...row, ...placeholders];
              })()}
            </tr>
          </thead>
          <tbody>
            {(result as Record<string, any>[]).map((row, ii) => {
              return (
                <tr key={ii}>
                  {[
                    ...Object.keys(row)
                      .sort()
                      .map((key, i) => <td key={i}>{stringify(row[key])}</td>),
                    ...updateOps.map((op) => (
                      <td
                        key={op.name}
                        onClick={() => {
                          op.op(row);
                        }}
                      >
                        {op.name}
                      </td>
                    )),
                  ]}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <ClientJSONTree data={result}></ClientJSONTree>
    </div>
  );
};

const drawerStateAtom = atom({} as Record<string, any>);
const resetDrawerAtom = atom(0);

export const Form = ({
  moduleName,
  code,
}: {
  moduleName: string;
  code: string;
}) => {
  const inputs = useMemo(() => parseInputs(code), [code]);
  const values = useAtomValue(drawerStateAtom);
  const callback = useCallback(
    async (values: Record<string, any>) => {
      let query = code;
      for (const input of inputs) {
        query = query.replace(
          `<${input.name}>`,
          JSON.stringify(values[input.name])
        );
      }
      console.log("Insert", query);
      const response = fetch("/api/agta/execute-agta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleName,
          query,
        }),
      }).then((res) => res.json());
      console.log(response);
    },
    [code, inputs, moduleName]
  );

  return (
    <div>
      <TypedInputForm
        formStateAtom={drawerStateAtom}
        inputs={inputs}
      ></TypedInputForm>
      <button
        onClick={() => {
          callback(values);
        }}
      >
        Submit
      </button>
    </div>
  );
};

export const TableView = ({
  app,
  pageConfig,
}: {
  app: string;
  pageConfig: PageConfig;
}) => {
  const [selectedView, setSelectedView] = useState(-1);
  const [formIndex, setFormIndex] = useState(-1);
  const [popupOpen, setPopupOpen] = useState(false);
  const setValues = useSetAtom(drawerStateAtom);
  const [form, resetForm] = useAtom(resetDrawerAtom);
  const queries = pageConfig.raw!;
  const selectQueries = queries.flatMap((block, i) => {
    if (block.code.startsWith("SELECT")) {
      return [i];
    }
    return [];
  });
  const insertQueries = queries.flatMap((block, i) => {
    if (block.code.startsWith("INSERT")) {
      return [i];
    }
    return [];
  });
  const updateQueries = queries.flatMap((block, i) => {
    if (block.code.startsWith("UPDATE")) {
      return [i];
    }
    return [];
  });
  console.log({ selectQueries, insertQueries });
  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          {selectQueries.map((selectIndex) => (
            <button
              className="bg-blue-100 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded w-48"
              key={selectIndex}
              onClick={() => {
                setSelectedView(selectIndex);
              }}
              title={queries[selectIndex].description}
            >
              <span className=" line-clamp-3">
                {queries[selectIndex].description}
              </span>
            </button>
          ))}
        </div>
        <div className="col-span-1">
          {insertQueries.map((insertIndex) => (
            <button
              className="bg-blue-100 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded w-48"
              key={insertIndex}
              onClick={() => {
                setFormIndex(insertIndex);
                setPopupOpen(true);
                resetForm((form) => form + 1);
              }}
              title={queries[insertIndex].description}
            >
              {queries[insertIndex].description}
            </button>
          ))}
        </div>
        <div className="col-span-4">
          {selectedView >= 0 && (
            <Select
              key={selectedView}
              moduleName={app}
              code={queries[selectedView].code}
              updateOps={updateQueries.map((query) => ({
                name: queries[query].description.split(":")[0],
                op: (values: Record<string, any>) => {
                  console.log({ values });
                  resetForm((form) => form + 1);

                  setFormIndex(query);
                  setPopupOpen(true);
                  setValues(values);
                },
              }))}
            ></Select>
          )}
        </div>
      </div>
      <div
        id="drawer-right-example"
        className={
          "fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto bg-white shadow-2xl w-1/2 " +
          (popupOpen
            ? " transform-none"
            : " transition-transform translate-x-full")
        }
        tabIndex={-1}
        aria-labelledby="drawer-right-label"
      >
        <div>
          <button
            onClick={() => {
              setPopupOpen(false);
            }}
          >
            X
          </button>
        </div>
        {formIndex >= 0 && (
          <Form
            key={form}
            moduleName={app}
            code={queries[formIndex].code}
          ></Form>
        )}
      </div>
    </div>
  );
};
