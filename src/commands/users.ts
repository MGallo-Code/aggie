import { readConfig, setUser } from "../config";
import { createUser, getUser, getUsers } from "../lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUser(userName);
  if (!existingUser) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(existingUser.name);
  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const user = await createUser(userName);
  if (!user) {
    throw new Error(`User ${userName} not found`);
  }

  setUser(user.name);
  console.log("User created successfully!");
}

export async function handlerUsers(cmdName: string, ...args: string[]) {
  const users = await getUsers();
  const currentUserName = readConfig().currentUserName;
  for (const user of users) {
    const name = user.name;
    let msg = `* ${name}`;
    if (name === currentUserName) {
      msg = msg + " (current)";
    }
    console.log(msg);
  }
}
