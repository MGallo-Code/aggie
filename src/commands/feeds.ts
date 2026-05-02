import {
  createFeed,
  getNextFeedToFetch,
  listFeeds,
  markFeedFetched,
} from "../lib/db/queries/feeds";
import { createFeedFollow } from "../lib/db/queries/feedFollows";
import { Feed, NewPost, User } from "../lib/db/schema";
import { fetchFeed } from "../lib/rss";
import { createPost } from "../lib/db/queries/posts";
import { bold, dim, formatDate, green, red } from "../lib/ui";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeBetweenRequests = parseDuration(args[0]);
  console.log(`Collecting feeds every ${args[0]}`);

  const handleError = (err: any) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(red(`Error scraping feeds: ${message}`));
  };
  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
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

  console.log(dim(`[${formatDate(new Date())}] ${nextFeed.name}`));
  for (const item of feed.channel.item) {
    const post: NewPost = {
      title: item.title,
      description: item.description,
      publishedAt: new Date(item.pubDate),
      url: item.link,
      feedId: nextFeed.id,
    };
    await createPost(post);
    console.log(`  ${item.title}`);
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

  console.log("");
  console.log(green("Feed created:"));
  printFeed(feed, user);
  await createFeedFollow(user.id, feed.id);
  console.log("");
  console.log(dim(`${user.name} now follows ${feed.name}.`));
}

export async function handlerFeeds(cmdName: string, ...args: string[]) {
  const feeds = await listFeeds();
  if (feeds.length === 0) {
    console.log("No feeds!");
    return;
  }
  console.log("");
  for (const feed of feeds) {
    if (!feed.name || !feed.url || !feed.userName) {
      console.log(dim("(malformed feed entry)"));
      console.log("");
      continue;
    }
    console.log(bold(feed.name));
    console.log(dim(feed.url));
    console.log(dim(`added by ${feed.userName}`));
    console.log("");
  }
}

function printFeed(feed: Feed, user: User) {
  console.log(bold(feed.name));
  console.log(dim(feed.url));
  console.log(dim(`added by ${user.name} on ${formatDate(feed.createdAt)}`));
}
