import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string) {
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "aggie",
      accept: "application/rss+xml",
    },
  });
  if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  // Parse XML
  const xml = await res.text();
  const parser = new XMLParser();
  const result = parser.parse(xml);

  // Validate response to fit types above^^
  const channel = result.rss?.channel;
  if (!channel) {
    throw new Error("failed to parse channel");
  }
  if (
    !channel.title ||
    typeof channel.title !== "string" ||
    !channel.link ||
    typeof channel.link !== "string" ||
    !channel.description ||
    typeof channel.description !== "string" ||
    !channel.item
  ) {
    throw new Error("failed to parse channel");
  }

  // Handle case where single item OR array of items
  const channelItems = !Array.isArray(channel.item)
    ? [channel.item]
    : channel.item;
  const items: RSSItem[] = [];
  // Validate each channel item
  for (const item of channelItems) {
    if (
      item.title &&
      typeof item.title === "string" &&
      item.link &&
      typeof item.link === "string" &&
      item.description &&
      typeof item.description === "string" &&
      item.pubDate &&
      typeof item.pubDate === "string"
    ) {
      items.push({
        title: cleanText(item.title),
        link: item.link,
        description: cleanText(item.description),
        pubDate: item.pubDate,
      });
    }
  }

  return {
    channel: {
      title: cleanText(channel.title),
      link: channel.link,
      description: cleanText(channel.description),
      item: items,
    },
  } as RSSFeed;
}

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === "#") {
      const cp =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : match;
    }
    return namedEntities[code.toLowerCase()] ?? match;
  });
}

function cleanText(s: string): string {
  return decodeEntities(s)
    .replace(/<\/?(p|br|div|h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
