import type { Command } from "commander";
import { getConfig, saveConfig } from "../config";

export function registerConfigCommand(program: Command): void {
  program
    .command("config <path>")
    .description("Set brain root directory")
    .action((path: string) => {
      const config = getConfig();
      config.brainRoot = path;
      saveConfig(config);
      console.log("Brain root configured:", path);
    });
}
