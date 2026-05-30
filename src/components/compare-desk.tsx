"use client";

import { useState } from "react";
import { ProviderPicker } from "./provider-picker";
import { Badge, Field, Panel, buttonClass, ghostButtonClass, inputClass } from "./ui";

type Target = { id: string; providerId: string; model: string };

type CompareResult = {
  providerId: string;
  model?: string;
  ok: boolean;
  text?: string;
  error?: string;
  durationMs: number;
  usage?: { input?: number; output?: number; total?: number };
};

export function CompareDesk({ readyKey = 0 }: { readyKey?: number }) {
  const [targets, setTargets] = useState<Target[]>([
    { id: crypto.randomUUID(), providerId: "", model: "" },
    { id: crypto.randomUUID(), providerId: "", model: "" }
  ]);
  const [prompt, setPrompt] = useState("Give me a short implementation plan for a local AI workspace with model routing and prompt redaction.");
  const [results, setResults] = useState<CompareResult[]>([]);
  const [busy, setBusy] = useState(false);

  function updateTarget(id: string, next: Partial<Target>) {
    setTargets((items) => items.map((item) => item.id === id ? { ...item, ...next } : item));
  }

  async function compare() {
    setBusy(true);
    setResults([]);
    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, targets: targets.filter((item) => item.providerId) })
    });
    const json = await res.json();
    setResults(json.results || []);
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <Panel title="Model compare">
        <div className="space-y-4">
          <Field label="Prompt">
            <textarea className={`${inputClass} min-h-[150px]`} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </Field>
          <div className="space-y-3">
            {targets.map((target, index) => (
              <div className="rounded-2xl border border-slate-200 p-3" key={target.id}>
                <div className="mb-2 text-sm font-medium text-slate-700">Target {index + 1}</div>
                <ProviderPicker readyKey={readyKey} value={target.providerId} model={target.model} onChange={(next) => updateTarget(target.id, next)} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={buttonClass} disabled={busy || !prompt.trim()} onClick={compare}>{busy ? "Comparing..." : "Compare models"}</button>
            <button className={ghostButtonClass} onClick={() => setTargets((items) => [...items, { id: crypto.randomUUID(), providerId: "", model: "" }])}>Add target</button>
          </div>
        </div>
      </Panel>

      {results.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {results.map((item, index) => (
            <Panel
              key={index}
              title={`${item.providerId} / ${item.model || "default"}`}
              right={<Badge tone={item.ok ? "green" : "red"}>{item.ok ? `${item.durationMs}ms` : "failed"}</Badge>}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge tone="blue">in {item.usage?.input || "?"}</Badge>
                <Badge tone="blue">out {item.usage?.output || "?"}</Badge>
              </div>
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-50 scrollbar-thin">{item.ok ? item.text : item.error}</pre>
            </Panel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
