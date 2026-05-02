import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
  await db.insert(feedFollows).values({ userId, feedId }).returning();
}

export async function deleteFeedFollow(userId: string, feedId: string) {
  await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}

export async function getFeedFollowsForUser(userId: string) {
  const results = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feedFollows)
    .leftJoin(users, eq(feedFollows.userId, users.id))
    .leftJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
  return results;
}
