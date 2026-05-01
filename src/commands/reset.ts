import { deleteUsers } from "../lib/db/queries/users";

export async function handlerReset() {
  await deleteUsers();
  console.log("Applied db reset");
}
