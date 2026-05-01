import { fetchFeed } from "../lib/rss/feed";
import { RSSFeed } from "../lib/rss/types";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  // if (args.length != 1) {
  //   throw new Error(`usage: ${cmdName} <feedURL>`);
  // }

  // const feedURL = args[0];
  const feedURL = "https://www.wagslane.dev/index.xml";
  const feed: RSSFeed = await fetchFeed(feedURL);
  console.log(JSON.stringify(feed));
}
