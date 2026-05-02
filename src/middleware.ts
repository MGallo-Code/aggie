import { CommandHandler, UserCommandHandler } from "./commands/commands";
import { Config, readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config: Config = readConfig();
    const user = await getUser(config.currentUserName);
    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
