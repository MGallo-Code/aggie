import { reset } from "../lib/db/queries/reset";

export async function handlerReset() {
  await reset();
  console.log("Applied db reset");
}
