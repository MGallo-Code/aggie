import { bold, dim } from "../lib/ui";

type CommandDoc = {
  name: string;
  args: string;
  description: string;
};

const commands: CommandDoc[] = [
  {
    name: "register",
    args: "<name>",
    description: "Create a new user and log in as them.",
  },
  {
    name: "login",
    args: "<name>",
    description: "Switch the active user to an existing account.",
  },
  { name: "users", args: "", description: "List all registered users." },
  {
    name: "reset",
    args: "",
    description: "Delete all data from the database.",
  },
  {
    name: "addfeed",
    args: "<name> <url>",
    description: "Add a feed and auto-follow it.",
  },
  { name: "feeds", args: "", description: "List all feeds in the database." },
  {
    name: "follow",
    args: "<url>",
    description: "Follow an existing feed by URL.",
  },
  { name: "unfollow", args: "<url>", description: "Unfollow a feed by URL." },
  {
    name: "following",
    args: "",
    description: "List feeds the current user follows.",
  },
  {
    name: "agg",
    args: "<interval>",
    description: "Start the aggregator loop (e.g. 30s, 10m, 1h).",
  },
  {
    name: "browse",
    args: "[limit]",
    description: "Show the latest posts from feeds you follow.",
  },
  { name: "help", args: "", description: "Show this help message." },
];

export async function handlerHelp(_cmdName: string, ..._args: string[]) {
  console.log("");
  console.log(bold("aggie") + dim(" - a small RSS aggregator CLI"));
  console.log("");
  console.log(dim("Usage: npm start <command> [args...]"));
  console.log("");
  console.log(bold("Commands:"));

  const usages = commands.map((c) => `${c.name} ${c.args}`.trimEnd());
  const maxLen = Math.max(...usages.map((u) => u.length));

  for (let i = 0; i < commands.length; i++) {
    const padded = usages[i].padEnd(maxLen);
    console.log(`  ${bold(padded)}   ${dim(commands[i].description)}`);
  }
  console.log("");
}
