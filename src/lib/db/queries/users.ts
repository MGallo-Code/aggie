import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";
import { firstOrUndefined } from "./utils";

export async function createUser(name: string) {
  const result = await db
    .insert(users)
    .values({ name })
    .onConflictDoNothing()
    .returning();
  return firstOrUndefined(result);
}

export async function getUser(name: string) {
  const result = await db.select().from(users).where(eq(users.name, name));
  return firstOrUndefined(result);
}

export async function getUsers() {
  return await db.select().from(users);
}
