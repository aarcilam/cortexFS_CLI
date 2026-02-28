import type { Command } from "commander";
import { registerConfigCommand } from "./config";
import { registerKnowledgeCommands } from "./knowledge";
import { registerSearchCommand } from "./search";
import { registerListCommand } from "./list";
import { registerSessionCommands } from "./session";

export function registerAllCommands(program: Command): void {
  registerConfigCommand(program);
  registerKnowledgeCommands(program);
  registerSearchCommand(program);
  registerListCommand(program);
  registerSessionCommands(program);
}
