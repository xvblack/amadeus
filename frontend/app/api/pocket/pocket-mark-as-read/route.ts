import { NextRequest, NextResponse } from "next/server";
import {
  fetchPost,
  savePocketPost,
  savePocketPosts,
} from "../../../../service/db";
import { archivePost, retrieveAllPosts } from "../../../../service/pocket";
import { enrichPost, indexPost } from "../../../../service/post";

export async function POST(req: NextRequest) {
  const params = await req.json();
  for (let i = 0; i < 5; i++) {
    try {
      const itemId = params.pocket_id;
      await archivePost({ itemId });
      break;
    } catch {
      console.log("Failed to invoke pocket");
    }
  }

  const url = params.url;
  const currentPost = await fetchPost({
    source: "pocket",
    url,
  });
  const updatedPost = {
    ...currentPost,
    tags: currentPost.tags.filter((tag) => tag.indexOf("unread") === -1),
  };
  await savePocketPost(updatedPost);
  await indexPost(await enrichPost(updatedPost));
  return NextResponse.json({});
}
