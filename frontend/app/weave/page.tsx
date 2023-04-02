import dynamic from "next/dynamic";

const _Weave = dynamic(() => import("./weave"), { ssr: false });
const Home = () => {
  return <_Weave></_Weave>;
};

export default Home;
