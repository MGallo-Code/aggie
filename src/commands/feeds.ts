import {
  createFeed,
  getNextFeedToFetch,
  listFeeds,
  markFeedFetched,
} from "../lib/db/queries/feeds";
import { createFeedFollow } from "../lib/db/queries/feedFollows";
import { Feed, User } from "../lib/db/schema";
import { fetchFeed } from "../lib/rss";

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

async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();
  if (!nextFeed) {
    console.log("No feeds to fetch");
    return;
  }

  await markFeedFetched(nextFeed.id);
  const feed = await fetchFeed(nextFeed.url);
  if (!feed) {
    console.log(`An error occurred fetching feed '${nextFeed.name}'`);
    return;
  }

  for (const item of feed.channel.item) {
    console.log(`* ${item.title}`);
  }
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(`Invalid duration! Valid Examples: 1s | 9m | 3h`);
  }

  const [, durNum, durUnit] = match;
  const durationInt = parseInt(durNum);
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
  const feeds = await listFeeds();
  if (feeds.length === 0) {
    console.log("No feeds!");
    return;
  }
  for (const feed of feeds) {
    if (!feed.name || !feed.url || !feed.userName) {
      console.log("- Malformed feed data...");
    } else {
      console.log(`- ${feed.name} - ${feed.url} | ${feed.userName}`);
    }
  }
}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}
