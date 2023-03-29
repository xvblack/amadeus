import { CodeBlock } from "../../app/agta/dsl";

export const splitMarkdownCodeBlocks = (markdown: string) => {
  const lines = markdown.split("\n");
  const blocks = [] as CodeBlock[];
  let descriptionLines = [] as string[];
  let codeLines = [] as string[];
  let isCodeLine = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      isCodeLine = !isCodeLine;
      if (!isCodeLine) {
        // End of block
        blocks.push({
          description: descriptionLines.join("\n"),
          code: codeLines.join("\n"),
        });
        descriptionLines = [];
        codeLines = [];
      }
    } else {
      if (isCodeLine) {
        codeLines.push(line);
      } else {
        descriptionLines.push(line);
      }
    }
  }
  return blocks;
};

const leadingNumber = /^\d+\./;
export const splitMarkdownNumberedList = function (markdown: string) {
  const lines = markdown.split("\n");
  let block = undefined as string[] | undefined;
  const result = [];
  for (const line of lines) {
    if (line.match(leadingNumber)) {
      if (block !== undefined && block.length > 0) {
        result.push(block.join("\n"));
      }
      block = [];
    }
    if (block !== undefined) {
      block.push(line);
    }
  }
  if (block !== undefined && block.length > 0) {
    result.push(block.join("\n"));
  }
  return result;
};
