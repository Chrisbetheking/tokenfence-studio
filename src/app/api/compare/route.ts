import { NextResponse } from "next/server";
import { guardPrompt } from "@/lib/core/guard";
import { callProvider } from "@/lib/providers";
import { findSavedProvider } from "@/lib/vault/provider-config";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = String(body.prompt || "");
  const targets = Array.isArray(body.targets) ? body.targets : [];

  if (!prompt.trim() || !targets.length) {
    return NextResponse.json({ error: "prompt and targets are required" }, { status: 400 });
  }

  const guard = guardPrompt(prompt, { budget: Number(body.budget || 4000), mode: body.mode || "safe" });

  const results = [];
  for (const target of targets) {
    const providerId = String(target.providerId || "");
    const saved = findSavedProvider(providerId);
    const started = Date.now();

    try {
      const result = await callProvider(saved, {
        providerId,
        model: target.model || saved?.model,
        maxTokens: Number(body.maxTokens || 1000),
        messages: [{ role: "user", content: guard.safePrompt }]
      });

      results.push({
        providerId,
        model: target.model || saved?.model,
        ok: true,
        text: result.text,
        usage: result.usage,
        durationMs: Date.now() - started
      });
    } catch (error) {
      results.push({
        providerId,
        model: target.model || saved?.model,
        ok: false,
        error: error instanceof Error ? error.message : "Failed",
        durationMs: Date.now() - started
      });
    }
  }

  return NextResponse.json({ guard, results });
}
