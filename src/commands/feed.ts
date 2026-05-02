import { Config, readConfig } from "../config";
import {
  createFeed,
  createFeedFollow,
  deleteFeedFollow,
  getFeedByUrl,
  getFeedFollowsForUser,
  listFeeds,
} from "../lib/db/queries/feed";
import { Feed, User } from "../lib/db/schema";
import { scrapeFeeds } from "../lib/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeBetweenRequests = parseDuration(args[0]);
  console.log(`Collecting feeds every ${args[0]}`);

  const handleError = (err: any) => {
    console.error(
      `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
    );
  };
  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(`Invalid duration! Valid Examples: 1s | 9m | 3h`);
  }

  const [durStr, durNum, durUnit] = match;
  const durationInt = parseInt(durNum);
  console.log(`Collecting feeds every ${durStr}`);
  switch (durUnit) {
    case "ms":
      return durationInt;
    case "s":
      return durationInt * 1000;
    case "m":
      return durationInt * 60 * 1000;
    case "h":
      return durationInt * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid duration! Valid Examples: 1s | 9m | 3h`);
  }
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length != 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }

  const feedName = args[0];
  const url = args[1];

  const feed = await createFeed(feedName, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  console.log("Feed created successfully:");
  printFeed(feed, user);

  await createFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} followed feed: ${feed.name}`);
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  let feeds = await listFeeds();
  if (!feeds) {
    console.log("No feeds!");
  }
  if (!Array.isArray(feeds)) {
    feeds = [feeds];
  }
  for (const feed of feeds) {
    if (!feed.name || !feed.url || !feed.userName) {
      console.log("- Malformed feed data...");
    } else {
      console.log(`- ${feed.name} - ${feed.url} | ${feed.userName}`);
    }
  }
}

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
    throw new Error(`Error finding feed with url "${feedURL} in db`);
  }

  await createFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} followed feed: ${feed.name}`);
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  console.log(`Feeds followed by ${user.name}:`);
  let followedFeeds = await getFeedFollowsForUser(user.id);
  if (!followedFeeds) {
    console.log("  No feeds followed!");
    return;
  }

  if (!Array.isArray(followedFeeds)) {
    followedFeeds = [followedFeeds];
  }
  for (const followFeed of followedFeeds) {
    console.log(` - ${followFeed.feedName}`);
  }
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
    throw new Error(`Error finding feed with url "${feedURL} in db`);
  }

  await deleteFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} unfollowed feed: ${feed.name}`);
}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}
