import { atom } from "jotai/vanilla";
import { loadable } from "jotai/vanilla/utils";
import {
  chatStateAtom,
  ChatStateAtomColl,
  monadLiteral,
  named,
  OperatingMode,
} from "../../components/chat/chat";
import {
  splitMarkdownCodeBlocks,
  splitMarkdownNumberedList,
} from "../../components/chat/strings";

import { AgtaConfig, PageConfig } from "./dsl";

export const pm = chatStateAtom({
  character: "PM",
  dependentCharacters: [],
  operatingMode: OperatingMode.USER_FIRST,
  initialPrompt: atom({
    raw: "You are acting as a PM. Your job is summarize and provide a detailed explanation of user's requirement. Output in markdown format",
  }),
});

export const pmOutput = pm.latestAssistantResponseAtom;

export const tl = chatStateAtom({
  character: "TL",
  dependentCharacters: [pm.character],
  operatingMode: OperatingMode.ASSISTANT_FIRST,
  initialPrompt: monadLiteral`You are acting as a TL.
Your job is to build database schema for your PM's PRD. Notes:
  - List the tables as a numbered list, fields in a nested bullet point list.
  - Every table that foreign keys refer to should be provided.
  - The PM may chat to you with additional requirements. You should return the modified schema description in a whole.

The initial requirement you got is
 ${pmOutput}.`,
});

export const tlOutput = tl.latestAssistantResponseAtom;

export const schemaEng = chatStateAtom({
  character: "ENG#EDGEDB",
  dependentCharacters: [tl.character],
  operatingMode: OperatingMode.ASSISTANT_FIRST,
  initialPrompt: monadLiteral`Transform the following description of database schema into EdgeDB DSL. Notes:
  - you should not define abstract type.
  - output the schema in backtick wrapped markdown codeblock.

${tlOutput}`,
});

export const schemaEngOutput = schemaEng.latestAssistantResponseAtom;

export const uiDesigner = chatStateAtom({
  character: "PM#PAGE_LIST",
  dependentCharacters: [pm.character],
  operatingMode: OperatingMode.ASSISTANT_FIRST,
  initialPrompt: monadLiteral`You are a Product Manager. Your job is to design the individual pages of the system, based on a input PRD. The design of each page shall
  be expressed like:
  " This page show data of employees. Employee's first and last name shall be fetched, along with the number of employees managed by him."
      
Notes:
- The response should be a numbered list.
- Each page shall be a list view or dashboard view of single responsibility.

The requirements is attached.

${pmOutput}`,
});

// - Do not build pages for standard functionalities (login, logout).

export const uiDesignerOutput = uiDesigner.latestAssistantResponseAtom;

export const iconPicker = chatStateAtom({
  character: "UI#ICON",
  dependentCharacters: [uiDesigner.character],
  operatingMode: OperatingMode.ASSISTANT_FIRST,
  initialPrompt: monadLiteral`You are designing icons for a system leveraging Google material symbols. 
You should map each input page description to a Google material symbols icon token that can be found on https://fonts.google.com/icons, like "settings", "close", etc. 
Output the icon tokens as a JSON array, like \`["settings"]\`, wrapped in a markdown codeblock.

The pages to pick icon for are:
${uiDesignerOutput}`,
});

const iconPickerOutput = iconPicker.latestAssistantResponseAtom;

export const pagesInAList = atom(async (get) => {
  try {
    return splitMarkdownNumberedList((await get(uiDesignerOutput)).raw);
  } catch {
    return [];
  }
});

export const edgedbQueries = atom(async (get) => {
  const pages = await get(pagesInAList);
  const atoms = [] as ChatStateAtomColl[];
  let pageIndex = 0;
  for (const page of pages) {
    const pageChat = chatStateAtom({
      character: `ENG#FE#PAGE-${pageIndex}`,
      dependentCharacters: [uiDesigner.character, schemaEng.character],
      operatingMode: OperatingMode.ASSISTANT_FIRST,
      initialPrompt: monadLiteral`You are provided with a EdgeDB schema, and the description of a page accessing the EdgeDB data. Build EdgeDB queries for the page. 

Notes:
- Output edgedb query and edgedb modification as Markdown Code Blocks. Prefix them with description of the functionality.
- Each query shall map to a EdgeDB select clause, where filterable values to be fit by user are in angle bracket wrapped format like <name_match>.
- Each page usually has at least one select query without any filter, at least one insert, and at least one update.
- Each modification shall map to a EdgeDB insert or update clause, with placeholder values to be fit by user are in angle bracket wrapped format like <customer_id>.
- EdgeDB update clause is in UPDATE xxx FILTER .yyy = <value> SET { zzz := <new value> } format. Do not use WHERE.
- You should only build queries for the page described, not for other available tables.
          
The page description is: ${named(
        "Page decided by UI",
        atom({
          raw: page,
        })
      )}. The EdgeDB schema is: ${schemaEngOutput}`,
    });

    atoms.push(pageChat);
    pageIndex += 1;
  }
  return {
    pageAtoms: atoms,
  };
});

export const qa = chatStateAtom({
  character: "QA",
  dependentCharacters: [schemaEng.character],
  operatingMode: OperatingMode.ASSISTANT_FIRST,
  initialPrompt: monadLiteral`You are acting as a QA. The EdgeDB schema is
 ${schemaEngOutput}. Write the EdgeDB insert statements for generating test data. Notes:
 - "multi property" is inserted using the set construction like {"a", "b"} insteand of array like ["a", "b"]
 - <datetime> string should conform to ISO 8601 with UTC timezone suffix "+00"`,
});

export const qaOutput = qa.latestAssistantResponseAtom;

export const consolidated = atom(async (get) => {
  const esdl = splitMarkdownCodeBlocks(await (await get(schemaEngOutput)).raw)
    .map((block) => block.code)
    .join("\n");
  const dataUpsert = splitMarkdownCodeBlocks(await (await get(qaOutput)).raw)
    .map((block) => block.code)
    .join("\n");
  const icons = JSON.parse(
    splitMarkdownCodeBlocks(await (await get(iconPickerOutput)).raw)[0].code
  );
  const { pageAtoms } = await get(edgedbQueries);
  const pageDescriptions = await get(pagesInAList);
  const pagesMeta = [] as PageConfig[];
  for (let i = 0; i < pageAtoms.length; i++) {
    const page = pageAtoms[i];
    pagesMeta.push({
      icon: icons[i],
      name: pageDescriptions[i].split(":")[0].slice(0, 50),
      raw: splitMarkdownCodeBlocks(
        await (
          await get(page.latestAssistantResponseAtom)
        ).raw
      ),
    });
  }
  const config: Omit<AgtaConfig, "app"> = {
    esdl: esdl,
    load_data_edgeql: dataUpsert,
    pages: pagesMeta,
  };
  return config;
});

const edgedbQueriesLoadableAtom = loadable(edgedbQueries);

const queryViewAtomsAtom = atom(async (get) => {
  const queries = await get(edgedbQueries);
  for (const query of queries.pageAtoms) {
  }
});

export const allAtomsAtom = atom((get) => {
  const queriesState = get(edgedbQueriesLoadableAtom);
  const pageAtoms =
    queriesState.state === "hasData" ? queriesState.data.pageAtoms : [];
  return [pm, uiDesigner, iconPicker, tl, schemaEng, qa, ...pageAtoms];
});
