'use client';
import dynamic from "next/dynamic";

const _Search = dynamic(() => import("./search"), { ssr: false });

const Home = () => {
  return <_Search></_Search>;
};

export default Home;
