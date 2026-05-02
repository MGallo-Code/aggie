import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function readConfig(): Config {
  const fullPath = getConfigFilePath();

  // Read JSON file at ~/.aggieconfig.json
  const data = fs.readFileSync(fullPath, "utf8");
  const rawConfig = JSON.parse(data);

  // Return Config obj or throw error
  return validateConfig(rawConfig);
}

export function setUser(userName: string) {
  const cfg = readConfig();
  // Set current_user_name field
  cfg.currentUserName = userName;
  // Write config object to JSON file
  writeConfig(cfg);
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".aggieconfig.json");
}

function writeConfig(cfg: Config): void {
  const content = JSON.stringify({
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  });
  fs.writeFileSync(getConfigFilePath(), content);
}

function validateConfig(rawConfig: any): Config {
  if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
    throw new Error("(validateConfig) db_url is required in config file");
  }
  if (
    !rawConfig.current_user_name ||
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error(
      "(validateConfig) current_user_name is required in config file",
    );
  }
  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  } as Config;
}
