import { readConfig, setUser } from "./config.js";

function main() {
  // Set current user to "Michael", update config file on disk
  setUser("Michael");
  // read config file and print
  console.log(readConfig());
}

main();
