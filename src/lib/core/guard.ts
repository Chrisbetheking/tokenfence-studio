import type { GuardResult, IntentReport, SkillContext } from "../types";
import { compressPrompt } from "./compressor";
import { redactText } from "./redactor";
import { scoreRisk } from "./risk";
import { scanText } from "./scanner";
import { estimateTokens, tokenDelta } from "./tokenizer";

export function guardPrompt(
  input: string,
  options: { question?: string; budget?: number; mode?: "safe" | "compress-only" | "redact-only"; intent?: IntentReport; skills?: SkillContext[] } = {}
): GuardResult {
  const detections = scanText(input);
  const redacted = redactText(input, detections);

  const base = options.mode === "compress-only" ? input : redacted.text;
  const compressed = options.mode === "redact-only" ? base : compressPrompt(base, options);

  const safePrompt = buildSafePrompt({
    context: compressed,
    question: options.question,
    intent: options.intent,
    skills: options.skills || []
  });
  const afterDetections = scanText(safePrompt);
  const tokensBefore = estimateTokens(input);
  const tokensAfter = estimateTokens(safePrompt);

  return {
    original: input,
    redacted: redacted.text,
    compressed,
    safePrompt,
    detections,
    mapping: redacted.mapping,
    riskBefore: scoreRisk(detections),
    riskAfter: scoreRisk(afterDetections),
    tokensBefore,
    tokensAfter,
    savedPercent: tokenDelta(tokensBefore, tokensAfter),
    intent: options.intent,
    skills: options.skills || []
  };
}

function buildSafePrompt({ context, question, intent, skills }: { context: string; question?: string; intent?: IntentReport; skills: SkillContext[] }) {
  const parts = [
    "You are answering a user request after a local safety and context pass.",
    "Preserve the user's original intent. Do not over-summarize away the ask.",
    "Keep redaction placeholders such as [EMAIL_1], [PHONE_LABEL_1], [ID_LABEL_1], [NAME_CN_1] unchanged.",
    "If live/tool context is provided, use it instead of model memory. If tool context failed, say so plainly."
  ];

  if (intent) {
    parts.push(
      "",
      "## Intent detected by TokenFence",
      `Intent: ${intent.intent}`,
      `Confidence: ${Math.round(intent.confidence * 100)}%`,
      `Language: ${intent.language}`,
      `Needs realtime data: ${intent.needsRealtime ? "yes" : "no"}`,
      intent.entities.location ? `Location: ${intent.entities.location}` : "",
      intent.hints.length ? `Hints: ${intent.hints.join(" ")}` : ""
    );
  }

  const usableSkills = skills.filter(Boolean);
  if (usableSkills.length) {
    parts.push("", "## Collected context");
    for (const skill of usableSkills) {
      parts.push(`### ${skill.title}`, `Status: ${skill.status}`, skill.source ? `Source: ${skill.source}` : "", skill.content.trim());
    }
  }

  parts.push("", "## Sanitized user context", context.trim());

  if (question?.trim()) {
    parts.push("", "## Explicit task", question.trim());
  }

  parts.push(
    "",
    "## Response style",
    "Answer directly. If the user wrote Chinese, answer in Chinese. If the user wrote English, answer in English. Be practical and do not mention TokenFence unless it matters."
  );

  return parts.filter((line) => line !== "").join("\n").trim();
}
