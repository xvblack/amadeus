import dynamic from "next/dynamic";
import { trySyncPocket } from "../api/pocket/sync-pocket/route";

const _Search = dynamic(() => import("./search"), { ssr: false });

const Home = async () => {
  // trySyncPocket({
  //   limit: 50,
  //   bestEffort: true,
  // });
  return <_Search></_Search>;
};

export default Home;
