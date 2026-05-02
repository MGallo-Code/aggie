import {
  createFeedFollow,
  deleteFeedFollow,
  getFeedFollowsForUser,
} from "../lib/db/queries/feedFollows";
import { getFeedByUrl } from "../lib/db/queries/feeds";
import { User } from "../lib/db/schema";
import { bold, dim, green } from "../lib/ui";

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

  const created = await createFeedFollow(user.id, feed.id);
  if (!created) {
    console.log(dim(`${user.name} already follows ${feed.name}.`));
    return;
  }
  console.log(green(`${user.name} now follows ${feed.name}.`));
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

  const deleted = await deleteFeedFollow(user.id, feed.id);
  if (!deleted) {
    console.log(dim(`${user.name} doesn't follow ${feed.name}.`));
    return;
  }
  console.log(green(`${user.name} unfollowed ${feed.name}.`));
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  const followedFeeds = await getFeedFollowsForUser(user.id);
  if (followedFeeds.length === 0) {
    console.log(`${user.name} doesn't follow any feeds yet.`);
    return;
  }
  console.log("");
  console.log(bold(`Feeds followed by ${user.name}:`));
  console.log("");
  for (const followFeed of followedFeeds) {
    console.log(`  ${followFeed.feedName}`);
    if (followFeed.feedUrl) {
      console.log(`  ${dim(followFeed.feedUrl)}`);
    }
    console.log("");
  }
}
