import { Session } from "edgedb";
import { NextRequest, NextResponse } from "next/server";
import { agtaClient } from "../../../agta/instance/[app]/install/page";

export const POST = async (req: NextRequest) => {
  const json = await req.json();
  console.log(json);
  const result = await agtaClient
    .withSession(new Session({ module: json.moduleName }))
    .queryJSON(json.query);
  return NextResponse.json({
    result,
  });
};
