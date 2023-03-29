import dynamic from "next/dynamic";

// const _Home = dynamic(() => import("./client"), { ssr: false });
const _Home = dynamic(() => import("./client"), { ssr: false });
// import Home from "./render";

const Root = () => {
  return <_Home></_Home>;
  // return <Home></Home>;
};

export default Root;
