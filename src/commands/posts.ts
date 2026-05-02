import { getPostsForUser } from "../lib/db/queries/posts";
import { Post, User } from "../lib/db/schema";

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
  if (!posts) {
    console.log("No posts found!");
  }

  for (const post of posts) {
    printPost(post);
  }
}

function printPost(post: Post) {
  console.log(`* Title:         
  ${post.title ?? "(no title)"}`);
  console.log(`* URL:           
  ${post.url}`);
  console.log(`* Published:     
  ${post.publishedAt ?? "(unknown)"}`);
  console.log(`* Description:      
  ${post.description ?? "(none)"}`);
  console.log("");
}
