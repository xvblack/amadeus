import { NextRequest, NextResponse } from "next/server";
import { fetchPost } from "../../../../service/post/db";
import { archivePost } from "../../../../service/pocket";
import { saveAndIndexPost } from "../../../../service/post/post";

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
  const newPost = {
    ...currentPost,
    tags: currentPost.tags.filter((tag) => tag.indexOf("unread") === -1),
  };
  await saveAndIndexPost(newPost);
  return NextResponse.json({});
}
