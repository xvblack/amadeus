import { NextRequest, NextResponse } from "next/server";
import { searchClient } from "../../../service/client";

export async function POST(req: NextRequest) {
  const params = await req.json();
  const response = await searchClient()
    .collections(process.env.TYPESENSE_INDEX_NAME!)
    .documents()
    .search(params, {});
  return NextResponse.json(response);
}

export const config = {
  api: {
    responseLimit: false,
  },
};
