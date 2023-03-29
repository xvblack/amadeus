"use client";

import { atom } from "jotai/vanilla";
import { useAtomValue, useSetAtom } from "jotai/react";
import { PanelContainer, PanelWrap } from "../../components/panel";
import { PREFIX } from "./dsl";

import { allAtomsAtom, consolidated } from "./state";
import { ChatBox } from "../../components/chat/box";
import { Navigation } from "../../components/chat/navigation";

const logAtom = atom(null, async (get) => {
  console.log(await get(consolidated));
});

const sendAtom = atom(null, async (get) => {
  const schema = await get(consolidated);
  const value = {
    ...schema,
    app: "module_" + Math.floor(Date.now()).toString(),
  };

  await fetch("/api/agta/save-kv", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: `${PREFIX}:${value.app}`,
      value: value,
    }),
  });
  window.open(`/agta/instance/${value.app}/install`, "_blank");
});

const PowerRedButton = () => {
  const log = useSetAtom(logAtom);
  const send = useSetAtom(sendAtom);
  return (
    <div>
      <button className="bg-green-50" onClick={() => log()}>
        POWER GREEN BUTTON
      </button>
      <button
        className="bg-red-600"
        onClick={() => {
          send();
        }}
      >
        POWER RED BUTTON
      </button>
    </div>
  );
};

const Home = () => {
  const allAtoms = useAtomValue(allAtomsAtom);
  return (
    <PanelContainer width={800 + 500 * allAtoms.length}>
      <PanelWrap index={0} width={800}>
        <PowerRedButton></PowerRedButton>
        Control Panel
        <Navigation key={allAtoms.length} allAtoms={allAtoms}></Navigation>
      </PanelWrap>
      {allAtoms.map((a, i) => (
        <PanelWrap key={i + 1} index={i + 1} width={500}>
          <ChatBox chatAtom={a}></ChatBox>;
        </PanelWrap>
      ))}
    </PanelContainer>
  );
};

export default Home;
