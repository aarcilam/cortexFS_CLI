import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import os from "os";
import type { CortexConfig } from "./types";

const CONFIG_PATH = join(os.homedir(), ".cortex");
const CONFIG_FILE = join(CONFIG_PATH, "config.json");

const DEFAULT_CONFIG: CortexConfig = {
  brainRoot: null,
};

function ensureConfig(): void {
  if (!existsSync(CONFIG_PATH)) {
    mkdirSync(CONFIG_PATH);
  }
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
}

export function getConfig(): CortexConfig {
  ensureConfig();
  return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
}

export function saveConfig(config: CortexConfig): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
