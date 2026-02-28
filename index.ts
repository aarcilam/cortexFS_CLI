#!/usr/bin/env bun

import { Command } from "commander";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync
} from "fs";
import { join } from "path";
import os from "os";

const program = new Command();
const CONFIG_PATH = join(os.homedir(), ".cortex");
const CONFIG_FILE = join(CONFIG_PATH, "config.json");

/* =========================
   CONFIG HELPERS
========================= */

function ensureConfig() {
  if (!existsSync(CONFIG_PATH)) mkdirSync(CONFIG_PATH);
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ brainRoot: null }, null, 2)
    );
  }
}

function getConfig() {
  ensureConfig();
  return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
}

function saveConfig(config: any) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/* =========================
   CONTEXT HELPERS
========================= */

function getCurrentContext() {
  const cwd = process.cwd();
  return cwd.split("/").pop();
}

function getContextPath() {
  const config = getConfig();

  if (!config.brainRoot) {
    console.error("Brain root not configured. Run: cortex config <path>");
    process.exit(1);
  }

  const context = getCurrentContext();
  const contextPath = join(config.brainRoot, "contexts", context);

  if (!existsSync(contextPath)) {
    mkdirSync(contextPath, { recursive: true });
  }

  return contextPath;
}

/* =========================
   CLI BASE
========================= */

program
  .name("cortex")
  .description("CortexFS - Cognitive Memory CLI");

/* =========================
   CONFIG
========================= */

program
  .command("config <path>")
  .description("Set brain root directory")
  .action((path) => {
    const config = getConfig();
    config.brainRoot = path;
    saveConfig(config);
    console.log("Brain root configured:", path);
  });

/* =========================
   SAVE
========================= */

program
  .command("save <category> <id> <content>")
  .description("Save knowledge")
  .action((category, id, content) => {
    const contextPath = getContextPath();
    const categoryPath = join(contextPath, category);

    if (!existsSync(categoryPath)) {
      mkdirSync(categoryPath, { recursive: true });
    }

    const filePath = join(categoryPath, `${id}.json`);

    writeFileSync(
      filePath,
      JSON.stringify(
        {
          content,
          createdAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log("Saved:", filePath);
  });

/* =========================
   READ
========================= */

program
  .command("read <category> <id>")
  .description("Read knowledge")
  .action((category, id) => {
    const contextPath = getContextPath();
    const filePath = join(contextPath, category, `${id}.json`);

    if (!existsSync(filePath)) {
      console.error("Not found.");
      process.exit(1);
    }

    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    console.log(data);
  });

/* =========================
   UPDATE
========================= */

program
  .command("update <category> <id> <content>")
  .description("Update existing knowledge")
  .action((category, id, content) => {
    const contextPath = getContextPath();
    const filePath = join(contextPath, category, `${id}.json`);

    if (!existsSync(filePath)) {
      console.error("Not found.");
      process.exit(1);
    }

    const existing = JSON.parse(readFileSync(filePath, "utf-8"));

    writeFileSync(
      filePath,
      JSON.stringify(
        {
          ...existing,
          content,
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log("Updated:", filePath);
  });

/* =========================
   DELETE
========================= */

program
  .command("delete <category> <id>")
  .description("Delete knowledge")
  .action((category, id) => {
    const contextPath = getContextPath();
    const filePath = join(contextPath, category, `${id}.json`);

    if (!existsSync(filePath)) {
      console.error("Not found.");
      process.exit(1);
    }

    unlinkSync(filePath);
    console.log("Deleted:", filePath);
  });

/* =========================
   SEARCH
========================= */

program
  .command("search <query>")
  .description("Search knowledge in current context")
  .action((query) => {
    const contextPath = getContextPath();

    function searchInDir(dir: string) {
      const files = readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = join(dir, file.name);

        if (file.isDirectory()) {
          searchInDir(fullPath);
        } else if (file.name.endsWith(".json")) {
          const content = readFileSync(fullPath, "utf-8");
          if (content.toLowerCase().includes(query.toLowerCase())) {
            console.log("Match:", fullPath);
          }
        }
      }
    }

    searchInDir(contextPath);
  });

/* =========================
   LIST
========================= */

program
  .command("list [category]")
  .description("List knowledge")
  .action((category) => {
    const contextPath = getContextPath();
    const basePath = category
      ? join(contextPath, category)
      : contextPath;

    if (!existsSync(basePath)) {
      console.error("Nothing found.");
      process.exit(1);
    }

    const items = readdirSync(basePath);
    items.forEach((item) => console.log(item));
  });

/* =========================
   SAVE STATE
========================= */

program
  .command("save-state <summary>")
  .description("Save session state")
  .action((summary) => {
    const contextPath = getContextPath();
    const sessionPath = join(contextPath, "sessions");

    if (!existsSync(sessionPath)) {
      mkdirSync(sessionPath, { recursive: true });
    }

    const filePath = join(sessionPath, `state-${Date.now()}.json`);

    writeFileSync(
      filePath,
      JSON.stringify(
        {
          summary,
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log("State saved.");
  });

/* =========================
   LOAD STATE
========================= */

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
    const data = JSON.parse(readFileSync(latest, "utf-8"));

    console.log("Loaded state:", data);
  });

/* ========================= */

program.parse(process.argv);