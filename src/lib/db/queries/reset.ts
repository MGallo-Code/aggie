import { db } from "..";

export async function reset() {
  await db.execute("TRUNCATE TABLE users;");
}
