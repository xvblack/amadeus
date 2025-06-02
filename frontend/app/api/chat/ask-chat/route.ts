import { NextRequest, NextResponse } from "next/server";
// import { ChatCompletionCreateParamsNonStreaming } from "openai";
import { openai, redis } from "../../../../service/client";
import crypto from "crypto";

// interface AskChatRequest {
//   messages: ChatCompletionRequestMessage[];
// }

// interface CacheEntry {
//   request: CreateCompletionRequest;
//   message: string;
// }

export const POST = async (req: NextRequest) => {
  // const params = (await req.json()) as AskChatRequest;

  // const key =
  //   "CHATGPT_STRUCTURED:" +
  //   crypto
  //     .createHash("sha1")
  //     .update(JSON.stringify(params.messages))
  //     .digest("hex");

  // const redisCached = await redis().get(key);
  // let message: string;
  // // await new Promise((r) => setTimeout(r, 1000));
  // if (redisCached === null) {
  //   const request = {
  //     model: "gpt-3.5-turbo",
  //     messages: params.messages,
  //     temperature: 0,
  //     max_tokens: 2000,
  //     top_p: 1.0,
  //     frequency_penalty: 0.0,
  //     presence_penalty: 0.0,
  //   };
  //   console.log("Calling OPENAI", request);
  //   const response = await openai().chat.completions.create(request);

  //   const json = response.data;
  //   console.log("Responded from OpenAI", {
  //     params,
  //     json: json.choices[0].message,
  //   });
  //   message = json.choices[0].message?.content!;

  //   const entry = {
  //     message,
  //     request,
  //   };

  //   await redis().set(key, JSON.stringify(entry));
  // } else {
  //   message = (JSON.parse(redisCached) as CacheEntry).message;
  // }

  // return NextResponse.json({
  //   message,
  // });
};
