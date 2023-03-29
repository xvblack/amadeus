import { redis } from "../../../../../../service/client";
import { AgtaConfig, CodeBlock, PREFIX } from "../../../../dsl";
import { TableView } from "./client";

const Page = async ({ params }: { params: { app: string; page: string } }) => {
  const configRaw = await redis().get(`${PREFIX}:${params.app}`);
  if (configRaw === null) {
    return "Not found";
  }
  const config = JSON.parse(configRaw) as AgtaConfig;
  const pageConfig = config.pages[parseInt(params.page)];

  return (
    <div>
      <TableView app={config.app} pageConfig={pageConfig}></TableView>
      {/* <div>
        {pageConfig.raw.map((block, i) => (
          <Section key={i} block={block}></Section>
        ))}
      </div>
      <ClientJSONTree data={pageConfig}></ClientJSONTree> */}
    </div>
  );
};

// const Section = ({ block }: { block: CodeBlock }) => {
//   let queryDom = null as React.ReactNode;
//   if (block.code.startsWith("SELECT")) {
//     queryDom = <Select code={block.code}></Select>;
//   } else if (
//     block.code.startsWith("INSERT") ||
//     block.code.startsWith("UPDATE")
//   ) {
//     queryDom = <Insert code={block.code}></Insert>;
//   }
//   return (
//     <div>
//       {block.description}
//       <pre>{block.code}</pre>
//       {queryDom}
//     </div>
//   );
// };

export default Page;
