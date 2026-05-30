#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { guardPrompt } from "../src/lib/core/guard";
import { generateContextPack } from "../src/lib/agent-pack/generate";
import { providerRegistry } from "../src/lib/providers/registry";
import type { ContextFile } from "../src/lib/types";

const program = new Command();

program
  .name("tokenfence")
  .description("Local prompt guard and agent context pack helper")
  .version("0.2.0");

program
  .command("guard")
  .argument("<file>", "text file to guard")
  .option("-q, --question <question>", "task for the model")
  .option("-b, --budget <tokens>", "token budget", "4000")
  .option("-o, --out <file>", "write safe prompt to a file")
  .action((file, options) => {
    const input = readFileSync(file, "utf8");
    const result = guardPrompt(input, {
      question: options.question,
      budget: Number(options.budget || 4000)
    });

    const report = [
      `risk: ${result.riskBefore.label} -> ${result.riskAfter.label}`,
      `tokens: ${result.tokensBefore} -> ${result.tokensAfter}`,
      `saved: ${result.savedPercent}%`,
      `detections: ${result.detections.length}`
    ].join("\n");

    console.log(report);

    if (options.out) {
      writeFileSync(options.out, result.safePrompt);
      console.log(`wrote ${options.out}`);
    } else {
      console.log("\n--- safe prompt ---\n");
      console.log(result.safePrompt);
    }
  });

program
  .command("pack")
  .argument("<dir>", "project directory")
  .option("-b, --budget <tokens>", "token budget", "8000")
  .option("-t, --task <task>", "task for the coding agent")
  .option("-o, --out <file>", "output file", "AGENT_CONTEXT.md")
  .action((dir, options) => {
    const files = collectFiles(path.resolve(dir));
    const pack = generateContextPack(files, {
      budget: Number(options.budget || 8000),
      task: options.task
    });

    writeFileSync(options.out, pack);
    console.log(`packed ${files.length} files into ${options.out}`);
  });

program
  .command("providers")
  .description("list built-in providers")
  .action(() => {
    for (const provider of providerRegistry) {
      console.log(`${provider.id.padEnd(12)} ${provider.label} (${provider.models.slice(0, 3).join(", ")})`);
    }
  });

program.parse();

function collectFiles(root: string): ContextFile[] {
  const results: ContextFile[] = [];
  walk(root, results, root);
  return results;
}

function walk(current: string, results: ContextFile[], root: string) {
  const name = path.basename(current);
  if (["node_modules", ".git", ".next", "dist", "build", "coverage", ".tokenfence"].includes(name)) return;

  const info = statSync(current);
  if (info.isDirectory()) {
    for (const child of readdirSync(current)) walk(path.join(current, child), results, root);
    return;
  }

  if (info.size > 120_000 || /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|gz|lock)$/i.test(current)) return;

  try {
    results.push({ path: path.relative(root, current), content: readFileSync(current, "utf8") });
  } catch {
    // not a text file
  }
}
