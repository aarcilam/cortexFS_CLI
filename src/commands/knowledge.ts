import type { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { getContextPath } from "../context";
import type { KnowledgeEntry } from "../types";

export function registerKnowledgeCommands(program: Command): void {
  program
    .command("save <category> <id> <content>")
    .description("Save knowledge")
    .action((category: string, id: string, content: string) => {
      const contextPath = getContextPath();
      const categoryPath = join(contextPath, category);

      if (!existsSync(categoryPath)) {
        mkdirSync(categoryPath, { recursive: true });
      }

      const filePath = join(categoryPath, `${id}.json`);
      const entry: KnowledgeEntry = {
        content,
        createdAt: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(entry, null, 2));
      console.log("Saved:", filePath);
    });

  program
    .command("read <category> <id>")
    .description("Read knowledge")
    .action((category: string, id: string) => {
      const contextPath = getContextPath();
      const filePath = join(contextPath, category, `${id}.json`);

      if (!existsSync(filePath)) {
        console.error("Not found.");
        process.exit(1);
      }

      const data: KnowledgeEntry = JSON.parse(readFileSync(filePath, "utf-8"));
      console.log(data);
    });

  program
    .command("update <category> <id> <content>")
    .description("Update existing knowledge")
    .action((category: string, id: string, content: string) => {
      const contextPath = getContextPath();
      const filePath = join(contextPath, category, `${id}.json`);

      if (!existsSync(filePath)) {
        console.error("Not found.");
        process.exit(1);
      }

      const existing: KnowledgeEntry = JSON.parse(readFileSync(filePath, "utf-8"));
      const updated: KnowledgeEntry = {
        ...existing,
        content,
        updatedAt: new Date().toISOString(),
      };

      writeFileSync(filePath, JSON.stringify(updated, null, 2));
      console.log("Updated:", filePath);
    });

  program
    .command("delete <category> <id>")
    .description("Delete knowledge")
    .action((category: string, id: string) => {
      const contextPath = getContextPath();
      const filePath = join(contextPath, category, `${id}.json`);

      if (!existsSync(filePath)) {
        console.error("Not found.");
        process.exit(1);
      }

      unlinkSync(filePath);
      console.log("Deleted:", filePath);
    });
}
