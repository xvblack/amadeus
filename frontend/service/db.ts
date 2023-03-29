import { Post } from "../shared/search/type";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchPost = async ({
  url,
  source,
}: {
  url: string;
  source: string;
}): Promise<Post> => {
  const post = await prisma.post.findUnique({
    where: {
      source_url: {
        source,
        url,
      },
    },
  });
  if (post === null) {
    throw `Post not found ${source}:${url}`;
  }

  return post as Post;
};

export const savePocketPost = async (post: Post) => {
  return (await savePocketPosts([post]))[0];
};

export const savePocketPosts = async (posts: Post[]) => {
  return Promise.all(
    posts.map(async (post) => {
      const saved = await prisma.post.upsert({
        where: {
          source_url: {
            source: post.source,
            url: post.url,
          },
        },
        create: {
          ...post,
        },
        update: {
          tags: post.tags,
        },
      });
      return { ...post, id: saved.id };
    })
  );
};
