import { NextRequest, NextResponse } from "next/server";
import { logger } from "../../../../service/logger";
import { trySyncPocket } from "../../../../service/sync";

export interface SyncPocketRequest {
  limit: number;
}

export async function POST(req: NextRequest) {
  try {
    const params = (await req.json()) as SyncPocketRequest;
    const result = await trySyncPocket(params);
    return NextResponse.json({
      message: "done",
      result: result,
    });
  } catch (exception) {
    logger.info(exception);
    return NextResponse.json(
      {
        message: `failed due to ${exception}`,
      },
      {
        status: 500,
      }
    );
  }
}
