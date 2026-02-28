import type { Command } from "commander";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { getContextPath } from "../context";

export function registerListCommand(program: Command): void {
  program
    .command("list [category]")
    .description("List knowledge")
    .action((category?: string) => {
      const contextPath = getContextPath();
      const basePath = category ? join(contextPath, category) : contextPath;

      if (!existsSync(basePath)) {
        console.error("Nothing found.");
        process.exit(1);
      }

      const items = readdirSync(basePath);
      items.forEach((item) => console.log(item));
    });
}
