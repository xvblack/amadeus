export const main = async () => {
  const baseUrl = `${process.env.QDRANT_ADDR}/collections/${process.env.QDRANT_INDEX_NAME}`;
  const deleteResponse = await fetch(baseUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(deleteResponse.status, await deleteResponse.text());

  console.log(baseUrl);
  const createResponse = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vectors: {
        size: parseInt(process.env.QDRAT_EMBEDDING_DIMENSION!),
        distance: process.env.QDRAT_EMBEDDING_DISTANCE,
      },
    }),
  });

  console.log(createResponse.status, await createResponse.text());
};

try {
  await main();
  console.log("SUCCESS");
} catch (error) {
  console.log(error);
}
