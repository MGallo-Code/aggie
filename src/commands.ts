import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = {
  [key: string]: CommandHandler;
};

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
) {
  registry[cmdName] = handler;
}

export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`{runCommand}: command "${cmdName} not in registry`);
  }
  handler(cmdName, ...args);
}

export function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length === 0) {
    throw new Error(`[${cmdName}]: missing arg userName`);
  }
  const userName = args[0].trim();
  if (!userName) {
    throw new Error(`[${cmdName}]: empty userName argument`);
  }
  setUser(userName);
  console.log(`[${cmdName}] user "${userName}" set!`);
}
