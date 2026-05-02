import { Config, readConfig } from "../config";
import {
  createFeed,
  createFeedFollow,
  getFeedByUrl,
  getFeedFollowsForUser,
  listFeeds,
} from "../lib/db/queries/feed";
import { getUser } from "../lib/db/queries/users";
import { Feed, User } from "../lib/db/schema";
import { fetchFeed } from "../lib/rss";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  // if (args.length != 1) {
  //   throw new Error(`usage: ${cmdName} <feedURL>`);
  // }

  // const feedURL = args[0];
  const feedURL = "https://www.wagslane.dev/index.xml";
  const feed = await fetchFeed(feedURL);
  console.log(JSON.stringify(feed));
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
  if (args.length != 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }

  const config: Config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
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

export async function handlerFollow(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const config: Config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    throw new Error(`Error finding feed with url "${args[0]} in db`);
  }

  await createFeedFollow(user.id, feed.id);
  console.log(`User ${user.name} followed feed: ${feed.name}`);
}

export async function handlerFollowing(cmdName: string, ...args: string[]) {
  const config: Config = readConfig();
  const user = await getUser(config.currentUserName);

  if (!user) {
    throw new Error(`User ${config.currentUserName} not found`);
  }

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

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}
