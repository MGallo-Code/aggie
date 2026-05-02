# aggie

A small command-line RSS aggregator written in TypeScript. It stores feeds, follows, and posts in Postgres, and includes a long-running aggregator that polls subscribed feeds on an interval. Users register locally, follow feeds, and browse the latest posts pulled in by the aggregator.

## Prerequisites

- Node.js (any recent LTS)
- Postgres (any recent version), running locally or otherwise reachable

## Install

```bash
git clone <repo-url> aggie
cd aggie
npm install
```

## Database setup

Create a Postgres database for aggie to use. For example:

```bash
createdb aggie
```

Then run the migrations. The included `drizzle.config.ts` is already wired up, so:

```bash
npx drizzle-kit migrate
```

## Config file

aggie reads its config from `~/.aggieconfig.json`. Create it with this shape:

```json
{
  "db_url": "postgres://user:password@localhost:5432/aggie",
  "current_user_name": ""
}
```

Leave `current_user_name` empty to start. It gets written automatically when you `register` or `login`.

## Running

All commands run through the `start` script:

```bash
npm start <command> [args...]
```

There is no global `aggie` binary installed on your `PATH`. Every invocation goes through `npm start`.

## Commands worth knowing

This isn't the full list, just the ones you actually need to get going.

- `npm start register <name>` creates a new user and logs in as them.
- `npm start login <name>` switches the active user to an existing account.
- `npm start addfeed <name> <url>` adds a feed to the database and auto-follows it for the current user.
- `npm start follow <url>` follows a feed that already exists in the database (added by you or another user).
- `npm start agg <interval>` starts the aggregator loop. The interval accepts values like `30s`, `10m`, or `1h`. For example, `npm start agg 10m` polls every ten minutes. It runs until you stop it with Ctrl+C.
- `npm start browse [limit]` prints the most recent posts from feeds the current user follows. `limit` defaults to 2.

## Quickstart

A typical first session looks like:

```bash
npm start register alice
npm start addfeed "Hacker News" https://news.ycombinator.com/rss
npm start agg 10m   # leave this running in one terminal
npm start browse 10 # in another terminal, once the aggregator has had a chance to fetch
```

## Notes

Built while working through the boot.dev "Build a Blog Aggregator" course.
