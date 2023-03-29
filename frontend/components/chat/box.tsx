import { Atom } from "jotai/vanilla";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useMemo, useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import "github-markdown-css/github-markdown-light.css";
import {
  ChatStateAtomColl,
  RoundContent,
  useRunChatStateAtom,
  WithFormula,
} from "./chat";
import { loadable } from "jotai/vanilla/utils";

const COLOR_MAPPING = {
  user: "bg-green-300",
  system: "bg-blue-300",
  assistant: "bg-red-300",
};

export const ChatLine = ({ round }: { round: Atom<Promise<RoundContent>> }) => {
  const loadableAtom = useMemo(() => loadable(round), [round]);
  const state = useAtomValue(loadableAtom);
  if (state.state === "loading") {
    return <div>Loading</div>;
  } else if (state.state === "hasError") {
    return <div>ERROR {JSON.stringify(state.error)}</div>;
  } else {
    const value = state.data;
    const color = COLOR_MAPPING[value.role];
    return (
      <div>
        <div
          className={`text-xs inline-flex items-center font-bold leading-sm uppercase px-1.5 py-0.5 ${color} rounded-full`}
        >
          {value.role}
        </div>
        :{" "}
        <ReactMarkdown className="markdown-body">
          {value.content.raw}
        </ReactMarkdown>
      </div>
    );
  }
};

const SystemPromptLine = ({ formula }: { formula: string }) => {
  return (
    <div>
      <div
        className={`text-xs inline-flex items-center font-bold leading-sm uppercase px-1.5 py-0.5 ${COLOR_MAPPING.system} rounded-full`}
      >
        SYSTEM
      </div>
      {": "}
      <ReactMarkdown className="markdown-body">{formula}</ReactMarkdown>
    </div>
  );
};

export const ChatBox = ({ chatAtom }: { chatAtom: ChatStateAtomColl }) => {
  useRunChatStateAtom(chatAtom);
  const roundAtoms = useAtomValue(chatAtom.contentAtomsAtom);
  const action = useSetAtom(chatAtom.actionAtom);
  const [input, setInput] = useState("");
  const formula = (chatAtom.initialPrompt as WithFormula).formula;
  const system =
    formula !== undefined ? (
      <SystemPromptLine formula={formula}></SystemPromptLine>
    ) : roundAtoms.length > 0 ? (
      <ChatLine key={"system"} round={roundAtoms[0]}></ChatLine>
    ) : (
      <></>
    );
  return (
    <div className="w-full flex flex-col">
      <div>{chatAtom.character}</div>
      <div className="grow">
        {system}
        {roundAtoms.slice(1).map((roundAtom, i) => (
          <ChatLine key={i} round={roundAtom}></ChatLine>
        ))}{" "}
      </div>
      <div className="grow-0">
        <textarea
          className="w-full"
          onChange={(e) => {
            setInput(e.target.value);
          }}
          value={input}
        ></textarea>
        <button
          onClick={() => {
            setInput("");
            action({
              action: "reply",
              content: input,
            });
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
