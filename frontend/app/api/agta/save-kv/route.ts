import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../../service/client";

interface SaveKVRequest {
  key: string;
  value: string;
}

export const POST = async (req: NextRequest) => {
  const request = (await req.json()) as SaveKVRequest;
  await redis().set(request.key, JSON.stringify(request.value));
  return NextResponse.json({});
};
