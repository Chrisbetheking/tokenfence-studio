#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scanText } from "../src/lib/core/scanner";
import { redactText } from "../src/lib/core/redactor";
import { compressPrompt } from "../src/lib/core/compressor";
import { guardPrompt } from "../src/lib/core/guard";
import { generateContextPack } from "../src/lib/agent-pack/generate";

const server = new McpServer({
  name: "tokenfence-studio",
  version: "0.2.0"
});

server.tool("scan_prompt", { text: z.string() }, async ({ text }) => ({
  content: [{ type: "text", text: JSON.stringify(scanText(text), null, 2) }]
}));

server.tool("redact_prompt", { text: z.string() }, async ({ text }) => {
  const detections = scanText(text);
  const redacted = redactText(text, detections);
  return { content: [{ type: "text", text: redacted.text }] };
});

server.tool("compress_prompt", {
  text: z.string(),
  question: z.string().optional(),
  budget: z.number().optional()
}, async ({ text, question, budget }) => ({
  content: [{ type: "text", text: compressPrompt(text, { question, budget }) }]
}));

server.tool("guard_prompt", {
  text: z.string(),
  question: z.string().optional(),
  budget: z.number().optional()
}, async ({ text, question, budget }) => ({
  content: [{ type: "text", text: JSON.stringify(guardPrompt(text, { question, budget }), null, 2) }]
}));

server.tool("generate_agent_context", {
  files: z.array(z.object({ path: z.string(), content: z.string() })),
  task: z.string().optional(),
  budget: z.number().optional()
}, async ({ files, task, budget }) => ({
  content: [{ type: "text", text: generateContextPack(files, { task, budget }) }]
}));

await server.connect(new StdioServerTransport());
