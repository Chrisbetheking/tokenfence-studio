export type ProviderKind = "openai-compatible" | "anthropic" | "gemini" | "ollama";

export type ProviderSpec = {
  id: string;
  label: string;
  group: "global" | "china" | "router" | "local" | "custom";
  kind: ProviderKind;
  baseUrl: string;
  models: string[];
  defaultModel: string;
  needsKey: boolean;
  keyEnv?: string;
  note?: string;
  advanced?: boolean;
};

export type SavedProvider = {
  providerId: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  enabled?: boolean;
  updatedAt?: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ProviderCall = {
  providerId: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type ProviderResult = {
  text: string;
  usage?: {
    input?: number;
    output?: number;
    total?: number;
  };
  raw?: unknown;
};

export type Detection = {
  kind: string;
  label: string;
  value: string;
  start: number;
  end: number;
  severity: "low" | "medium" | "high" | "critical";
};

export type IntentReport = {
  intent: "weather" | "code" | "resume" | "summarize" | "translate" | "plan" | "privacy_check" | "chat";
  confidence: number;
  language: "zh" | "en" | "mixed";
  needsRealtime: boolean;
  needsFiles: boolean;
  sensitiveByNature: boolean;
  query: string;
  entities: Record<string, string>;
  hints: string[];
};

export type SkillContext = {
  name: string;
  status: "ok" | "skipped" | "error";
  title: string;
  content: string;
  source?: string;
  directAnswer?: string;
};

export type GuardResult = {
  original: string;
  redacted: string;
  compressed: string;
  safePrompt: string;
  detections: Detection[];
  mapping: Record<string, string>;
  riskBefore: RiskScore;
  riskAfter: RiskScore;
  tokensBefore: number;
  tokensAfter: number;
  savedPercent: number;
  intent?: IntentReport;
  skills?: SkillContext[];
};

export type RiskScore = {
  label: "low" | "medium" | "high" | "critical";
  score: number;
};

export type ArchiveRecord = {
  id: string;
  title: string;
  providerId: string;
  model: string;
  promptBefore: string;
  promptAfter: string;
  response: string;
  tokensInput: number;
  tokensOutput: number;
  riskBefore: RiskScore;
  riskAfter: RiskScore;
  durationMs: number;
  createdAt: string;
  tags: string[];
};

export type ContextFile = {
  path: string;
  content: string;
};
