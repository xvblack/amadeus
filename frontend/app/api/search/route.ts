import { NextRequest, NextResponse } from "next/server";
import { searchPost } from "../../../service/post/typesense";

export async function POST(req: NextRequest) {
  const params = await req.json();
  const response = await searchPost(params);
  return NextResponse.json(response);
}

export const config = {
  api: {
    responseLimit: false,
  },
};
