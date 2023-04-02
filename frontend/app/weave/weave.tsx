"use client";

import { atom } from "jotai/vanilla";
import { ChatBox } from "../../components/chat/box";
import { chatStateAtom, OperatingMode } from "../../components/chat/chat";

const state = chatStateAtom({
  character: "weaver",
  dependentCharacters: [],
  operatingMode: OperatingMode.USER_FIRST,
  initialPrompt: atom({
    raw: `
You are acting as a interactive tool assisted agent. The few tools you have are:

- search(<keywords>): Search for related web pages. Returns with pages with title and url.
- fetch(url): Access a page and get text content.

The user would type a task first in the format of:

"Goal: analyze the 3 years trend on database."

Each round, you shall output with:

"Thought: I need to search for database related tasks. I have to use different terms
Tool: search("database storage timeseries")
"

Since you used a tool, the system would feed you:

"
title: greptime
url: greptime.com
abstract: greptime is a timeseries database.
"

Then you output:

"Thought: I shall access detail of greptime.com.
Tool: fetch("greptime.com)
"

The system would feed you:

"
content: Greptime is a newly created database based on S3 storage, infinitely scalable.
"

This time you find you have enough info. You decide to output

"Thought: I have enough info.
Output: There is much progress on database side."

`,
  }),
});

const Weave = () => {
  return (
    <div>
      <ChatBox chatAtom={state}></ChatBox>
    </div>
  );
};

export default Weave;
