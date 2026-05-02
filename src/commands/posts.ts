import { getPostsForUser } from "../lib/db/queries/posts";
import { Post, User } from "../lib/db/schema";
import { bold, dim, divider, formatDate } from "../lib/ui";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  let limit: number = 2;
  if (args.length > 0) {
    limit = parseInt(args[0]);
    if (!limit) {
      throw new Error(`usage: ${cmdName} <number_of_posts>`);
    }
  }

  const posts = await getPostsForUser(user.id, limit);
  if (posts.length === 0) {
    console.log("No posts found!");
    return;
  }

  console.log("");
  for (const post of posts) {
    printPost(post);
  }
}

function printPost(post: Post) {
  console.log(bold(post.title ?? "(no title)"));
  console.log(dim(post.url));
  console.log(dim(`Published ${formatDate(post.publishedAt)}`));
  if (post.description) {
    console.log("");
    console.log(post.description);
  }
  console.log(divider());
  console.log("");
}
