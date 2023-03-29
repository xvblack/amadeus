import { redirect } from "next/navigation";

const Home = () => {
  redirect(process.env.DEFAULT_PATH ?? "/agta");
};

export default Home;
