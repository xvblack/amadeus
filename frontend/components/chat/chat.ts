import { useAtomValue, useSetAtom } from "jotai/react";
import { PrimitiveAtom, Atom, atom, WritableAtom } from "jotai/vanilla";
import { loadable, splitAtom } from "jotai/vanilla/utils";
import pLimit from "p-limit";
import { useCallback, useEffect, useMemo } from "react";

export enum RoundRole {
  SYSTEM = "system",
  ASSISTANT = "assistant",
  USER = "user",
}

export type Message = {
  raw: string;
};

export type RoundState = {
  role: RoundRole;
  content: Promise<Message> | Message;
};

export type ResolvedRoundState = {
  role: string;
  content: Message;
};

export enum OperatingMode {
  USER_FIRST = "user_first",
  ASSISTANT_FIRST = "assistant_first",
}

export type ChatState = {
  character: string;
  dependentCharacters: string[];
  rounds: RoundState[];
  operatingMode: OperatingMode;
  initialPrompt: Atom<Promise<Message> | Message>;
};

export type ChatAction =
  | {
      action: "resetSystemPrompt";
      systemPrompt: Promise<Message> | Message;
    }
  | {
      action: "reply";
      content: string;
    };

export interface RoundContent {
  role: RoundRole;
  content: Message;
}

export interface ChatStateAtomColl {
  character: string;
  dependentCharacters: string[];
  initialPrompt: Atom<Promise<Message> | Message>;
  contentAtomsAtom: Atom<Atom<Promise<RoundContent>>[]>;
  stateAtom: PrimitiveAtom<ChatState>;
  actionAtom: WritableAtom<null, [action: ChatAction], Promise<void>>;
  latestAssistantResponseAtom: NamedAtomMessage;
}
// stateAtom,
// actionAtom,
// latestAssistantResponseAtom,

export interface AskChatMessage {
  role: string;
  content: string;
}

const lock = pLimit(3);
const askChat = (messages: AskChatMessage[]) => {
  return lock(async () =>
    fetch("/api/chat/ask-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    })
      .then((response) => response.json())
      .then((json) => json.message as string)
  );
};

export const named = (
  name: string,
  atom: Atom<Promise<Message> | Message>
): NamedAtomMessage => {
  (atom as any as WithName).name = name;
  return atom as any as NamedAtomMessage;
};

export const chatStateAtom = ({
  character,
  dependentCharacters,
  operatingMode,
  initialPrompt,
}: {
  character: string;
  dependentCharacters: string[];
  operatingMode: OperatingMode;
  initialPrompt: Atom<Promise<Message> | Message>;
  systemPromptFromAtom?: Atom<Promise<String>>;
}): ChatStateAtomColl => {
  const stateAtom = atom({
    character,
    dependentCharacters,
    rounds: [],
    operatingMode,
    initialPrompt,
  } as ChatState);
  const actionAtom = atom(null, async (get, set, action: ChatAction) => {
    const curr = get(stateAtom);
    let { rounds } = curr;
    switch (action.action) {
      case "reply":
        rounds = [
          ...rounds,
          {
            role: RoundRole.USER,
            content: {
              raw: action.content,
            },
          },
        ];
        break;
      case "resetSystemPrompt":
        rounds = [
          {
            role: RoundRole.SYSTEM,
            content: action.systemPrompt,
          },
        ];
        break;
    }
    if (
      rounds[rounds.length - 1].role !== "assistant" &&
      (rounds.length > 1 || operatingMode === OperatingMode.ASSISTANT_FIRST)
    ) {
      const currRounds = rounds;
      const response = Promise.all(
        currRounds.map((round) => round.content)
      ).then((contents) => {
        const payload = [] as AskChatMessage[];
        for (let i = 0; i < currRounds.length; i++) {
          payload.push({
            role: currRounds[i].role,
            content: contents[i].raw,
          });
        }
        return askChat(payload);
      });
      rounds = [
        ...rounds,
        {
          role: RoundRole.ASSISTANT,
          content: response.then((content) => ({
            raw: content,
          })),
        },
      ];
    }
    set(stateAtom, {
      ...curr,
      rounds,
    });
  });
  const latestAssistantResponseAtom: NamedAtomMessage = named(
    `${character} output`,
    atom((get) => {
      const { rounds } = get(stateAtom);
      if (
        rounds.length === 0 ||
        rounds[rounds.length - 1].role !== RoundRole.ASSISTANT
      ) {
        throw "Not ready yet";
      }
      return Promise.resolve(rounds[rounds.length - 1].content);
    })
  );

  const liftedRoundsAtom = atom((get) => {
    const { rounds } = get(stateAtom);
    return rounds.map((round) =>
      Promise.resolve(round.content).then((content) => ({
        role: round.role,
        content,
      }))
    );
  });

  const contentAtomsAtom = splitAtom(liftedRoundsAtom);

  return {
    character,
    dependentCharacters,
    initialPrompt,
    contentAtomsAtom,
    stateAtom,
    actionAtom,
    latestAssistantResponseAtom,
  };
};

export const useRunChatStateAtom = (chatStateAtom: ChatStateAtomColl) => {
  const systemPromptStateAtom = useMemo(
    () => loadable(chatStateAtom.initialPrompt),
    [chatStateAtom.initialPrompt]
  );
  const systemPromptState = useAtomValue(systemPromptStateAtom);
  const action = useSetAtom(chatStateAtom.actionAtom);
  useEffect(() => {
    if (systemPromptState.state == "hasData") {
      action({
        action: "resetSystemPrompt",
        systemPrompt: systemPromptState.data,
      });
    }
  }, [action, systemPromptState.state, systemPromptState]);
};

export interface WithFormula {
  formula?: string;
}

export type MonadLiteral = Atom<Promise<Message> | Message> & WithFormula;

export interface WithName {
  name: string;
}
export type NamedAtomMessage = Atom<Promise<Message> | Message> & WithName;

export const monadLiteral = (
  strings: TemplateStringsArray,
  ...values: NamedAtomMessage[]
): Atom<Promise<Message> | Message> => {
  const a: MonadLiteral = atom(async (get) => {
    const results = [] as string[];
    for (let i = 0; i < strings.length; i++) {
      results.push(strings[i]);
      if (i < values.length) {
        const value = await get(values[i]);
        results.push(value.raw);
      }
    }
    const content = results.join("");
    return {
      raw: content,
    };
  });
  const formula = [];
  for (let i = 0; i < strings.length; i++) {
    formula.push(strings[i]);
    if (i < values.length) {
      formula.push(`\`${values[i].name!}\``);
    }
  }
  a.formula = formula.join("");
  return a;
};
