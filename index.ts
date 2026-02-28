#!/usr/bin/env bun

import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import os from "os";

const program = new Command();
const CONFIG_PATH = join(os.homedir(), ".cortex");
const CONFIG_FILE = join(CONFIG_PATH, "config.json");

function ensureConfig() {
  if (!existsSync(CONFIG_PATH)) mkdirSync(CONFIG_PATH);
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify({ brainRoot: null }, null, 2));
  }
}

function getConfig() {
  ensureConfig();
  return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
}

function saveConfig(config: any) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

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

program
  .name("cortex")
  .description("CortexFS - Cognitive Memory CLI");

program
  .command("config <path>")
  .description("Set brain root directory")
  .action((path) => {
    const config = getConfig();
    config.brainRoot = path;
    saveConfig(config);
    console.log("Brain root configured:", path);
  });

program
  .command("save <category> <id> <content>")
  .description("Save knowledge")
  .action((category, id, content) => {
    const contextPath = getContextPath();
    const categoryPath = join(contextPath, category);

    if (!existsSync(categoryPath)) {
      mkdirSync(categoryPath);
    }

    const filePath = join(categoryPath, `${id}.json`);

    writeFileSync(
      filePath,
      JSON.stringify(
        {
          content,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log("Saved:", filePath);
  });

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

program
  .command("save-state <summary>")
  .description("Save session state")
  .action((summary) => {
    const contextPath = getContextPath();
    const sessionPath = join(contextPath, "sesiones");

    if (!existsSync(sessionPath)) {
      mkdirSync(sessionPath);
    }

    const filePath = join(sessionPath, `state-${Date.now()}.json`);

    writeFileSync(
      filePath,
      JSON.stringify(
        {
          summary,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log("State saved.");
  });

program.parse(process.argv);