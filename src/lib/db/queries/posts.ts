import { eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, NewPost, posts } from "../schema";

export async function createPost(post: NewPost) {
  await db.insert(posts).values(post).onConflictDoNothing();
}

export async function getPostsForUser(userId: string, limit: number) {
  const result = await db
    .select(getTableColumns(posts))
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(sql`COALESCE(${posts.publishedAt}, ${posts.createdAt}) DESC`)
    .limit(limit);
  return result;
}
