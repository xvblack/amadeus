import { searchClient } from "../../../../service/client";
import ClientJsonTree from "../../../../components/json";

const Detail = async ({
  params,
}: {
  params: Promise<{ pid: string }>;
}) => {
  const pid = (await params).pid;

  const query = {
    q: "",
    query_by: "title,url,abstract,html",
    sort_by: "time_added:desc",
    filter_by: `id:${pid}`,
    facet_by: "",
    page: 1,
    per_page: 10,
  };
  const data = await searchClient()
    .collections(process.env.TYPESENSE_INDEX_NAME!)
    .documents()
    .search(query, {});

  return <ClientJsonTree data={data.hits![0]} />;
};

export default Detail;
