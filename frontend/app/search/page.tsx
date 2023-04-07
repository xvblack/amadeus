import dynamic from "next/dynamic";

const _Search = dynamic(() => import("./search"), { ssr: false });

const Home = async () => {
  return <_Search></_Search>;
};

export default Home;
