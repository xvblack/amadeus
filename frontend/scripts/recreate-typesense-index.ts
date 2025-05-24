const baseUrl = `${process.env.TYPESENSE_ADDR}collections`;
const dropResponse = await fetch(
  `${baseUrl}/${process.env.TYPESENSE_INDEX_NAME}`,
  {
    method: "DELETE",
    headers: {
      "X-TYPESENSE-API-KEY": process.env.TYPESENSE_API_KEY!,
    },
  }
);
console.log(await dropResponse.text());
const createResponse = await fetch(baseUrl, {
  method: "POST",
  headers: {
    "X-TYPESENSE-API-KEY": process.env.TYPESENSE_API_KEY!,
  },
  body: JSON.stringify({
    name: "default",
    fields: [
      { name: "id", type: "int32" },
      { name: "url", type: "string" },
      { name: "time_added", type: "int64" },
      { name: "time_added_as_date", type: "string", optional: true },
      { name: "source", type: "string" },
      { name: "tags", type: "string[]", facet: true },
      { name: "title", type: "string" },
      { name: "abstract", type: "string" },
      { name: "content", type: "string" },
      { name: "html", type: "string", optional: true },
      { name: ".*", type: "auto" },
    ],
    default_sorting_field: "time_added",
  }),
});
console.log(await createResponse.text());

export {};
