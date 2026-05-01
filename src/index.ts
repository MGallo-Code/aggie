import {
  CommandsRegistry,
  handlerLogin,
  registerCommand,
  runCommand,
} from "./commands.js";

function main() {
  // Create command registry -- register commands
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);

  // Get script args
  // Don't include path/script args
  const [cmdName, ...args] = process.argv.slice(2);
  if (!cmdName) {
    console.log("Not enough arguments provided!");
    process.exit(1);
  }
  try {
    runCommand(registry, cmdName, ...args);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
