import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "../../service/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.body;
  console.log("Calling OPENAI", { params });

  const request = {
    model: "text-davinci-003",
    prompt: params.prompt,
    temperature: 0,
    max_tokens: 3000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  };

  const response = await openai().createCompletion(request);
  const json = response.data;
  console.log("Responded from OpenAI", { params, json: json.choices[0].text });

  res.status(200).json(json);
}
