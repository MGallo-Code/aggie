import {
  createFeedFollow,
  deleteFeedFollow,
  getFeedFollowsForUser,
} from "../lib/db/queries/feedFollows";
import { getFeedByUrl } from "../lib/db/queries/feeds";
import { User } from "../lib/db/schema";

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const feedURL = args[0];
  const feed = await getFeedByUrl(feedURL);
  if (!feed) {
    throw new Error(`Error finding feed with url "${feedURL}" in db`);
  }

  await createFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} followed feed: ${feed.name}`);
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const feedURL = args[0];
  const feed = await getFeedByUrl(feedURL);
  if (!feed) {
    throw new Error(`Error finding feed with url "${feedURL}" in db`);
  }

  await deleteFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} unfollowed feed: ${feed.name}`);
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  console.log(`Feeds followed by ${user.name}:`);
  const followedFeeds = await getFeedFollowsForUser(user.id);
  if (followedFeeds.length === 0) {
    console.log("  No feeds followed!");
    return;
  }
  for (const followFeed of followedFeeds) {
    console.log(` - ${followFeed.feedName}`);
  }
}
