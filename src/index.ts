import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands/commands";
import { handlerReset } from "./commands/reset";
import { handlerLogin, handlerRegister, handlerUsers } from "./commands/users";
import { handlerAddFeed, handlerAgg, handlerFeeds } from "./commands/feeds";
import {
  handlerFollow,
  handlerFollowing,
  handlerUnfollow,
} from "./commands/feedFollows";
import { middlewareLoggedIn } from "./middleware";
import { handlerBrowse } from "./commands/posts";
import { handlerHelp } from "./commands/help";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    await handlerHelp("help");
    process.exit(0);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandsRegistry = {};

  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);
  registerCommand(commandsRegistry, "reset", handlerReset);
  registerCommand(commandsRegistry, "users", handlerUsers);
  registerCommand(commandsRegistry, "agg", handlerAgg);
  registerCommand(
    commandsRegistry,
    "addfeed",
    middlewareLoggedIn(handlerAddFeed),
  );
  registerCommand(commandsRegistry, "feeds", handlerFeeds);
  registerCommand(
    commandsRegistry,
    "follow",
    middlewareLoggedIn(handlerFollow),
  );
  registerCommand(
    commandsRegistry,
    "unfollow",
    middlewareLoggedIn(handlerUnfollow),
  );
  registerCommand(
    commandsRegistry,
    "following",
    middlewareLoggedIn(handlerFollowing),
  );
  registerCommand(
    commandsRegistry,
    "browse",
    middlewareLoggedIn(handlerBrowse),
  );
  registerCommand(commandsRegistry, "help", handlerHelp);

  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
