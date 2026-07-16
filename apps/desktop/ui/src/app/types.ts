export type Language = 'en' | 'zh-CN';
export type ThemeMode = 'system' | 'light' | 'dark';
export type ScreenId =
  | 'workspace'
  | 'agents'
  | 'files'
  | 'routing'
  | 'providers'
  | 'history'
  | 'updates'
  | 'settings'
  | 'about';

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';
export type ProviderId =
  | 'local-demo'
  | 'deepseek'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'qwen'
  | 'kimi'
  | 'doubao'
  | 'zhipu'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio'
  | 'custom';
export type ProviderApiStyle = 'local-demo' | 'openai-compatible' | 'anthropic';
export type ProviderStatusState = 'not-configured' | 'configured' | 'connected' | 'error';
export type FileKind = 'text' | 'code' | 'pdf' | 'document' | 'spreadsheet' | 'image' | 'unknown';
export type ProcessorId = 'text-reader' | 'pdf-extractor' | 'docx-reader' | 'sheet-reader' | 'local-ocr';
export type WorkspaceMode = 'chat' | 'agent';
export type SkillPermission = 'network' | 'files-read' | 'files-write' | 'github' | 'computer-view' | 'computer-control';

export interface AttachmentDraft {
  id: string;
  name: string;
  size: number;
  content: string;
  kind?: FileKind;
  processor?: ProcessorId;
  mimeType?: string;
  pageCount?: number;
  warnings?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: string;
  provider?: string;
  model?: string;
  riskLevel?: RiskLevel;
  failed?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  provider: string;
  model: string;
  riskSummary: RiskLevel;
  mode?: WorkspaceMode;
  agentId?: string;
  messages: ChatMessage[];
}

export interface SafetyFinding {
  id: string;
  kind: string;
  label: string;
  severity: Severity;
  start: number;
  end: number;
  replacement: string;
}

export interface TextScanResult {
  originalLength: number;
  redactedText: string;
  findings: SafetyFinding[];
  riskLevel: RiskLevel;
  riskScore: number;
  estimatedTokens: number;
}

export interface PayloadScanResult {
  hash: string;
  prompt: TextScanResult;
  attachments: Array<AttachmentDraft & { scan: TextScanResult }>;
  findings: SafetyFinding[];
  riskLevel: RiskLevel;
  riskScore: number;
  estimatedTokens: number;
}

export interface ProviderCapabilities {
  vision: boolean;
  tools: boolean;
  reasoning: boolean;
  local: boolean;
  files: boolean;
}

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  shortName: string;
  apiStyle: ProviderApiStyle;
  defaultBaseUrl: string;
  defaultModel: string;
  modelSuggestions: string[];
  requiresCredential: boolean;
  capabilities: ProviderCapabilities;
  accent: string;
  descriptionEn: string;
  descriptionZh: string;
}

export interface ProviderProfile {
  id: string;
  providerId: ProviderId;
  displayName: string;
  apiStyle: ProviderApiStyle;
  baseUrl: string;
  model: string;
  enabled: boolean;
  credentialStored: boolean;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderStatus {
  state: ProviderStatusState;
  checkedAt?: string;
  latencyMs?: number;
  model?: string;
  message?: string;
}

export interface RoutingRule {
  id: string;
  kind: FileKind | 'default';
  providerProfileId: string;
  modelOverride?: string;
  enabled: boolean;
  reasonEn: string;
  reasonZh: string;
}

export interface SkillDefinition {
  id: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  category: 'coding' | 'documents' | 'research' | 'security' | 'productivity' | 'automation';
  icon: string;
  permissions: SkillPermission[];
  systemPrompt: string;
  builtIn: boolean;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  providerProfileId?: string;
  skillIds: string[];
  permissionMode: 'ask' | 'read-only' | 'trusted';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  startScreen: ScreenId;
  autoOpenInspector: boolean;
  autoScan: boolean;
  autoRedactCritical: boolean;
  blockCriticalSends: boolean;
  customSensitiveTerms: string[];
  maxTextScanSize: number;
  maxFileScanSize: number;
  requestTimeoutMs: number;
  conversationContextLimit: number;
  localHistoryEnabled: boolean;
  safetyReceiptsEnabled: boolean;
  experimentalFeatures: boolean;
  debugMode: boolean;
  tokenOptimizationMode: 'off' | 'conservative' | 'balanced';
  githubOwner: string;
  githubRepo: string;
  autoCheckUpdates: boolean;
}

export interface SafetyReceipt {
  id: string;
  conversationId: string;
  createdAt: string;
  provider: string;
  model: string;
  riskLevel: RiskLevel;
  findingKinds: string[];
  attachmentNames: string[];
  requestCharacters: number;
  estimatedTokens?: number;
  optimizedTokens?: number;
  result: 'sent' | 'demo' | 'failed';
}

export interface TokenOptimizationResult {
  originalText: string;
  optimizedText: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  savedPercent: number;
  changes: string[];
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
}

export interface UpdateInfo {
  ok: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateAvailable: boolean;
  releaseUrl?: string;
  publishedAt?: string;
  notes?: string;
  assets: ReleaseAsset[];
  errorMessage?: string;
}

export interface ComputerCapability {
  id: 'screen-capture' | 'open-url' | 'keyboard' | 'pointer' | 'project-files' | 'terminal';
  available: boolean;
  permissionRequired: boolean;
  status: 'ready' | 'permission-needed' | 'planned';
  message: string;
}
