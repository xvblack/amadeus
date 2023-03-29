import Link from "next/link";
import { redis } from "../../../../service/client";
import { AgtaConfig, PageConfig, PREFIX } from "../../dsl";

const Root = async ({
  params,
  children,
}: {
  params: { app: string };
  children: React.ReactNode;
}) => {
  const configRaw = await redis().get(`${PREFIX}:${params.app}`);
  if (configRaw === null) {
    return "Not found";
  }
  const config = JSON.parse(configRaw) as AgtaConfig;
  return (
    <div className="grid grid-cols-4 h-screen">
      <div className="col-span-1 h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <ul className="space-y-2">
          {config.pages.map((page, i) => (
            <li key={page.name}>
              <Page app={params.app} page={page} index={i}></Page>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-3 h-full overflow-y-auto">{children}</div>
    </div>
  );
};

const shrinkName = (name: string) => {
  if (name.indexOf(".") >= 0) {
    return name.split(".")[1];
  }
  return name;
};

const Page = ({
  app,
  page,
  index,
}: {
  app: string;
  page: PageConfig;
  index: number;
}) => {
  return (
    <Link href={`/agta/instance/${app}/pages/${index}`}>
      <span className="material-symbols-outlined">{page.icon}</span>
      {shrinkName(page.name ?? "UNKNOWN")}
    </Link>
  );
};

export default Root;
