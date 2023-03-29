import ClientJSONTree from "../../../../components/json";
import { redis } from "../../../../service/client";
import { AgtaConfig, PREFIX } from "../../dsl";

const Home = async ({ params }: { params: { app: string } }) => {
  const configRaw = await redis().get(`${PREFIX}:${params.app}`);
  if (configRaw === null) {
    return "Not found";
  }
  const config = JSON.parse(configRaw) as AgtaConfig;
  return <ClientJSONTree data={config}></ClientJSONTree>;
};

export default Home;
