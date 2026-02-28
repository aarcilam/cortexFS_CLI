import type { Command } from "commander";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getContextPath } from "../context";
import type { SessionState } from "../types";

export function registerSessionCommands(program: Command): void {
  program
    .command("save-state <summary>")
    .description("Save session state")
    .action((summary: string) => {
      const contextPath = getContextPath();
      const sessionPath = join(contextPath, "sessions");

      if (!existsSync(sessionPath)) {
        mkdirSync(sessionPath, { recursive: true });
      }

      const filePath = join(sessionPath, `state-${Date.now()}.json`);
      const state: SessionState = {
        summary,
        timestamp: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(state, null, 2));
      console.log("State saved.");
    });

  program
    .command("load-state")
    .description("Load latest session state")
    .action(() => {
      const contextPath = getContextPath();
      const sessionPath = join(contextPath, "sessions");

      if (!existsSync(sessionPath)) {
        console.error("No saved states.");
        process.exit(1);
      }

      const files = readdirSync(sessionPath)
        .filter((f) => f.startsWith("state-"))
        .sort()
        .reverse();

      if (!files.length) {
        console.error("No saved states.");
        process.exit(1);
      }

      const latest = join(sessionPath, files[0]);
      const data: SessionState = JSON.parse(readFileSync(latest, "utf-8"));

      console.log("Loaded state:", data);
    });
}
