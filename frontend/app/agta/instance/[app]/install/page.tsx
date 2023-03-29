import createClient, { Session } from "edgedb";
import { redis } from "../../../../../service/client";
import { AgtaConfig, PREFIX } from "../../../dsl";
import fs from "fs/promises";
import { exec as _exec } from "child_process";
import { promisify } from "util";
import Link from "next/link";
import { redirect } from "next/navigation";
const exec = promisify(_exec);

const EDGEDB_BIN = process.env.EDGEDB_BIN;
const AGTA_EDGEDB_DSN = process.env.AGTA_EDGEDB_DSN;
const AGTA_EDGEDB_SCHEMA_DIR = process.env.AGTA_EDGEDB_SCHEMA_DIR;

export const agtaClient = createClient({
  dsn: AGTA_EDGEDB_DSN,
  tlsSecurity: "insecure",
});

const Root = async ({ params }: { params: { app: string } }) => {
  console.log("KEY", `${PREFIX}:${params.app}`);
  const configRaw = await redis().get(`${PREFIX}:${params.app}`);
  if (configRaw === null) {
    return "Not found";
  }
  const config = JSON.parse(configRaw) as AgtaConfig;
  const rootDir = AGTA_EDGEDB_SCHEMA_DIR;
  const schemaPath = `${rootDir}/${config.app}.esdl`;
  const exist = await fs
    .access(schemaPath)
    .then(() => true)
    .catch(() => false);

  if (!exist) {
    await fs.writeFile(
      schemaPath,
      `module ${config.app} {
      ${config.esdl}
    }`
    );
    try {
      const migrationCreateCommand = `'${EDGEDB_BIN}' --dsn ${AGTA_EDGEDB_DSN} --tls-security insecure migration create --non-interactive --schema-dir ${AGTA_EDGEDB_SCHEMA_DIR}`;
      const migrationApplyCommand = `'${EDGEDB_BIN}' --dsn ${AGTA_EDGEDB_DSN} --tls-security insecure migration apply --schema-dir ${AGTA_EDGEDB_SCHEMA_DIR}`;
      console.log({ migrationCreateCommand, migrationApplyCommand });
      const migrationCreateResult = await exec(migrationCreateCommand);
      console.log({ migrationCreateResult });
      const mirgationApplyResult = await exec(migrationApplyCommand);
      console.log({ mirgationApplyResult });
    } catch (exception) {
      console.log(exception);
    }
    for (const query of config.load_data_edgeql.split(";")) {
      try {
        await agtaClient
          .withSession(
            new Session({
              module: config.app,
            })
          )
          .execute(`${query};`);
      } catch (exception) {
        console.log({ query, exception });
      }
    }
  }

  redirect(`/agta/instance/${params.app}`);
};

export default Root;
