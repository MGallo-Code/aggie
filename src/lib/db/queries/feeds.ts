import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";
import { firstOrUndefined } from "./utils";

export async function createFeed(name: string, url: string, userId: string) {
  const result = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return firstOrUndefined(result);
}

export async function listFeeds() {
  const result = await db
    .select({ name: feeds.name, url: feeds.url, userName: users.name })
    .from(feeds)
    .leftJoin(users, eq(feeds.userId, users.id));
  return result;
}

export async function getFeedByUrl(url: string) {
  const result = await db.select().from(feeds).where(eq(feeds.url, url));
  return firstOrUndefined(result);
}

export async function markFeedFetched(feedId: string) {
  await db
    .update(feeds)
    .set({ lastFetchedAt: new Date() })
    .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);
  return firstOrUndefined(result);
}
