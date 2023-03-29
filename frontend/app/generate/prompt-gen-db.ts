import { CreateCompletionResponse } from "openai";

export const askChat = async ({ prompt }: { prompt: string }) => {
  const response = await fetch("/api/chat/ask-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    }),
  }).then((response) => response.json());
  return response.message;
};

export const expandRequirement = async ({
  requirement,
}: {
  requirement: string;
}) => {
  const prompt = `You are a Product Manager. Now you received an requirement, please generate a more detailed explanation of the requirement.

  The requirement you received is:
  \`\`\`
  ${requirement}
  \`\`\`
  
  Write a detailed description of the types of entites would be stored in the system. Wrap the response with word "BEGIN" at the beginning and "END" at the end.`;

  const completion = await askChat({ prompt });
  const begin = completion?.indexOf("BEGIN")! + 5;
  const end = completion?.indexOf("END")!;
  return completion?.slice(begin, end);
};

export const generateSchema = async ({ expanded }: { expanded: string }) => {
  const prompt = `You are acting a programmer writing Datomic EDN schema according to requirements.
  The output format should be an array of map like:
  \`\`\`
  [
  { :db/ident :employee/name
      :db/valueType :db.type/string
      :db/cardinality :db.cardinality/one
      :db/doc "The employee's name"},
  { :db/ident :employee/dept
      :db/valueType :db.type/ref
      :db/cardinality :db.cardinality/one
      :db/doc "The organization the employee belongs to"},
  ]
  \`\`\`
  The requirements is
  \`\`\`
  ${expanded}
  \`\`\`
  
  Output the required schema. Notes:
  - Please bake more field details about the entities.
  - Wrap the response with word "BEGIN" at the beginning and "END" at the end.`;

  const completion = await askChat({ prompt });
  const begin = completion?.indexOf("BEGIN")! + 5;
  const end = completion?.indexOf("END")!;
  return completion?.slice(begin, end);
};

export const generateData = async ({
  schema,
  expanded,
}: {
  schema: string;
  expanded: string;
}) => {
  const prompt = `You are acting a programmer building application based on Datomic EDN. The EDN is like
  \`\`\`
  ${schema}
  \`\`\`
  
  The original requirement was
  
  \`\`\`
  ${expanded}
  \`\`\`
  
  Now generate some sample data, in the format of collection of entities. 
  Notes: 
  - The output should be a list.
  - Each entity should have a :db/ident attribute with a number value.
  - Each entity should contains only attributes with same prefix before slash.
  - Wrap the response with word "BEGIN" at the beginning and "END" at the end.
  `;

  const completion = await askChat({ prompt });
  const begin = completion?.indexOf("BEGIN")! + 5;
  const end = completion?.indexOf("END")!;
  return completion?.slice(begin, end);
};
