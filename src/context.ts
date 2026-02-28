import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getConfig } from "./config";

export function getCurrentContext(): string {
  const cwd = process.cwd();
  return cwd.split("/").pop() || "default";
}

export function getContextPath(): string {
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
