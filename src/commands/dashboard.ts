import type { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { getContextPath } from "../context";
import type { KnowledgeEntry } from "../types";

interface EntryData {
  id: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";
const RESET = "\x1b[0m";

function getCategories(): string[] {
  const contextPath = getContextPath();
  if (!existsSync(contextPath)) return ["all"];
  
  const items = readdirSync(contextPath);
  const categories = ["all"];
  
  for (const item of items) {
    const itemPath = join(contextPath, item);
    if (statSync(itemPath).isDirectory()) {
      categories.push(item);
    }
  }
  
  return categories;
}

function getEntries(category: string): EntryData[] {
  const contextPath = getContextPath();
  const entries: EntryData[] = [];
  
  if (category === "all") {
    const categories = getCategories().filter(c => c !== "all");
    for (const cat of categories) {
      const catPath = join(contextPath, cat);
      if (existsSync(catPath)) {
        const files = readdirSync(catPath).filter(f => f.endsWith(".json"));
        for (const file of files) {
          const filePath = join(catPath, file);
          try {
            const data: KnowledgeEntry = JSON.parse(readFileSync(filePath, "utf-8"));
            entries.push({
              id: file.replace(".json", ""),
              category: cat,
              content: data.content,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          } catch {}
        }
      }
    }
  } else {
    const catPath = join(contextPath, category);
    if (existsSync(catPath)) {
      const files = readdirSync(catPath).filter(f => f.endsWith(".json"));
      for (const file of files) {
        const filePath = join(catPath, file);
        try {
          const data: KnowledgeEntry = JSON.parse(readFileSync(filePath, "utf-8"));
          entries.push({
            id: file.replace(".json", ""),
            category,
            content: data.content,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        } catch {}
      }
    }
  }
  
  return entries;
}

function filterEntries(entries: EntryData[], query: string): EntryData[] {
  if (!query) return entries;
  const lowerQuery = query.toLowerCase();
  return entries.filter(e => 
    e.id.toLowerCase().includes(lowerQuery) ||
    e.category.toLowerCase().includes(lowerQuery) ||
    e.content.toLowerCase().includes(lowerQuery)
  );
}

function question(prompt_text: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt_text);
    const listener = (data: Buffer) => {
      process.stdin.removeListener("data", listener);
      resolve(data.toString().trim());
    };
    process.stdin.on("data", listener);
  });
}

async function showMenu(): Promise<void> {
  while (true) {
    console.clear();
    
    const categories = getCategories();
    const entries = getEntries("all");
    
    console.log(CYAN + BOLD + "========================================" + RESET);
    console.log(CYAN + BOLD + "         CortexFS Dashboard              " + RESET);
    console.log(CYAN + BOLD + "========================================" + RESET);
    console.log("");
    
    console.log(YELLOW + "Categorias:" + RESET);
    categories.forEach((cat, i) => {
      const icon = cat === "all" ? "[*]" : "[ ]";
      console.log("  " + icon + " " + cat);
    });
    console.log("");
    
    console.log(GREEN + "Entradas (" + entries.length + "):" + RESET);
    entries.slice(0, 10).forEach((entry, i) => {
      console.log("  " + (i + 1) + ". " + entry.id + " [" + entry.category + "]");
    });
    if (entries.length > 10) {
      console.log("  ... y " + (entries.length - 10) + " mas");
    }
    
    console.log("");
    console.log(GRAY + "------------------------------------------" + RESET);
    console.log(BLUE + "[L]" + RESET + "ist - Ver todas las entradas");
    console.log(BLUE + "[V]" + RESET + "er   - Ver contenido de entrada");
    console.log(BLUE + "[N]" + RESET + "uevo - Crear nueva entrada");
    console.log(BLUE + "[E]" + RESET + "ditar - Editar entrada");
    console.log(BLUE + "[D]" + RESET + "elete - Eliminar entrada");
    console.log(BLUE + "[S]" + RESET + "earch - Buscar");
    console.log(BLUE + "[Q]" + RESET + "uit   - Salir");
    console.log(GRAY + "------------------------------------------" + RESET);
    
    const answer = await question(CYAN + "Elige opcion: " + RESET);
    const ans = answer.trim().toLowerCase();
    
    switch (ans) {
      case "l":
        await listEntries();
        break;
      case "v":
        await viewEntry(entries);
        break;
      case "n":
        await createEntry(categories);
        break;
      case "e":
        await editEntry(entries);
        break;
      case "d":
        await deleteEntry(entries);
        break;
      case "s":
        await searchEntries();
        break;
      case "q":
        console.log(GREEN + "Hasta luego! CortexFS" + RESET);
        process.exit(0);
    }
  }
}

async function listEntries(): Promise<void> {
  const categories = getCategories();
  
  console.log("");
  const category = await question(YELLOW + "Filtrar por categoria (ENTER = todas): " + RESET);
  
  const entries = category.trim() ? getEntries(category.trim()) : getEntries("all");
  
  console.log("");
  console.log(GREEN + "Entradas:" + RESET);
  entries.forEach((entry, i) => {
    console.log("  " + (i + 1) + ". " + entry.id + " [" + entry.category + "] - " + new Date(entry.createdAt).toLocaleDateString());
  });
  console.log("");
  
  await question(GRAY + "Presiona Enter para continuar..." + RESET);
}

async function viewEntry(entries: EntryData[]): Promise<void> {
  if (entries.length === 0) {
    console.log(YELLOW + "No hay entradas." + RESET);
    await question(GRAY + "Presiona Enter..." + RESET);
    return;
  }
  
  console.log("");
  const numStr = await question(YELLOW + "Numero de entrada: " + RESET);
  
  const num = parseInt(numStr) - 1;
  if (num >= 0 && num < entries.length) {
    const entry = entries[num];
    console.log("");
    console.log(CYAN + BOLD + "=== " + entry.id + " [" + entry.category + "] ===" + RESET);
    console.log(entry.content);
    console.log("");
  } else {
    console.log(YELLOW + "Entrada no encontrada." + RESET);
  }
  
  await question(GRAY + "Presiona Enter..." + RESET);
}

async function createEntry(categories: string[]): Promise<void> {
  console.log("");
  
  const category = await question(YELLOW + "Categoria: " + RESET);
  const cat = category.trim() || "memoria";
  
  const id = await question(YELLOW + "ID: " + RESET);
  
  if (!id.trim()) {
    console.log(YELLOW + "ID requerido." + RESET);
    await question(GRAY + "Presiona Enter..." + RESET);
    return;
  }
  
  const content = await question(YELLOW + "Contenido: " + RESET);
  
  const contextPath = getContextPath();
  const categoryPath = join(contextPath, cat);
  
  if (!existsSync(categoryPath)) {
    mkdirSync(categoryPath, { recursive: true });
  }
  
  const filePath = join(categoryPath, id.trim() + ".json");
  const entry: KnowledgeEntry = {
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  
  writeFileSync(filePath, JSON.stringify(entry, null, 2));
  console.log(GREEN + "Guardado: " + id + RESET);
  await question(GRAY + "Presiona Enter..." + RESET);
}

async function editEntry(entries: EntryData[]): Promise<void> {
  if (entries.length === 0) {
    console.log(YELLOW + "No hay entradas." + RESET);
    await question(GRAY + "Presiona Enter..." + RESET);
    return;
  }
  
  console.log("");
  const numStr = await question(YELLOW + "Numero de entrada a editar: " + RESET);
  
  const num = parseInt(numStr) - 1;
  if (num >= 0 && num < entries.length) {
    const entry = entries[num];
    
    const newContent = await question(YELLOW + "Nuevo contenido: " + RESET);
    
    const contextPath = getContextPath();
    const filePath = join(contextPath, entry.category, entry.id + ".json");
    
    const existing: KnowledgeEntry = JSON.parse(readFileSync(filePath, "utf-8"));
    const updated: KnowledgeEntry = {
      ...existing,
      content: newContent.trim(),
      updatedAt: new Date().toISOString(),
    };
    
    writeFileSync(filePath, JSON.stringify(updated, null, 2));
    console.log(GREEN + "Actualizado: " + entry.id + RESET);
  } else {
    console.log(YELLOW + "Entrada no encontrada." + RESET);
  }
  
  await question(GRAY + "Presiona Enter..." + RESET);
}

async function deleteEntry(entries: EntryData[]): Promise<void> {
  if (entries.length === 0) {
    console.log(YELLOW + "No hay entradas." + RESET);
    await question(GRAY + "Presiona Enter..." + RESET);
    return;
  }
  
  console.log("");
  const numStr = await question(YELLOW + "Numero de entrada a eliminar: " + RESET);
  
  const num = parseInt(numStr) - 1;
  if (num >= 0 && num < entries.length) {
    const entry = entries[num];
    const contextPath = getContextPath();
    const filePath = join(contextPath, entry.category, entry.id + ".json");
    
    unlinkSync(filePath);
    console.log(GREEN + "Eliminado: " + entry.id + RESET);
  } else {
    console.log(YELLOW + "Entrada no encontrada." + RESET);
  }
  
  await question(GRAY + "Presiona Enter..." + RESET);
}

async function searchEntries(): Promise<void> {
  console.log("");
  
  const query = await question(YELLOW + "Buscar: " + RESET);
  
  const allEntries = getEntries("all");
  const results = filterEntries(allEntries, query.trim());
  
  console.log("");
  console.log(GREEN + "Resultados (" + results.length + "):" + RESET);
  results.forEach((entry, i) => {
    console.log("  " + (i + 1) + ". " + entry.id + " [" + entry.category + "]");
  });
  
  await question(GRAY + "Presiona Enter..." + RESET);
}

export function registerDashboardCommand(program: Command): void {
  program
    .command("dashboard")
    .description("Open interactive dashboard")
    .action(() => {
      showMenu().catch(console.error);
    });
}
