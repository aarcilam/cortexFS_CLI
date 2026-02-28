import type { Command } from "commander";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getContextPath } from "../context";

function searchInDirectory(dir: string, query: string): void {
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      searchInDirectory(fullPath, query);
    } else if (file.name.endsWith(".json")) {
      const content = readFileSync(fullPath, "utf-8");
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log("Match:", fullPath);
      }
    }
  }
}

export function registerSearchCommand(program: Command): void {
  program
    .command("search <query>")
    .description("Search knowledge in current context")
    .action((query: string) => {
      const contextPath = getContextPath();
      searchInDirectory(contextPath, query);
    });
}
