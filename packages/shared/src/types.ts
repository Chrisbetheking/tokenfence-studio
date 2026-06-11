export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';

export type SensitiveType =
  | 'api_key'
  | 'email'
  | 'phone'
  | 'token'
  | 'database_url'
  | 'secret_assignment'
  | 'chinese_id'
  | 'credential_like';

export interface SensitiveFinding {
  type: SensitiveType;
  label: string;
  match: string;
  redacted: string;
  start: number;
  end: number;
}

export interface GuardResult {
  riskLevel: RiskLevel;
  findings: SensitiveFinding[];
  original: string;
  redacted: string;
  timestamp: number;
}

export type TaskType =
  | 'general'
  | 'code_review'
  | 'document_summary'
  | 'translation'
  | 'job_resume'
  | 'research';

export type FileCategory =
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'code'
  | 'markdown'
  | 'log'
  | 'data'
  | 'pdf'
  | 'archive'
  | 'unknown';

export interface FileTypeInfo {
  category: FileCategory;
  mimeTypes: string[];
  extensions: string[];
  label: string;
  recommendedModel: string;
}

export interface ProviderModel {
  provider: string;
  model: string;
  deployment: 'local' | 'cloud';
  bestFor: string;
  riskPolicy: string;
  baseUrl?: string;
  apiKeyEnv?: string;
}

export interface ArchiveEntry {
  id: string;
  guardResult: GuardResult;
  taskType: TaskType;
  selectedModel?: ProviderModel;
  savedAt: number;
}

export interface AppSettings {
  localOnly: boolean;
  defaultProvider: string;
  defaultModel: string;
  storeSanitizedOnly: boolean;
}

export interface StoragePaths {
  workspacePath: string;
  archivePath: string;
  exportPath: string;
  contextPacksPath: string;
}

export interface FileRoutingRule {
  id: string;
  fileCategory: FileCategory;
  provider: string;
  model: string;
  enabled: boolean;
  description: string;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  general: 'General Chat',
  code_review: 'Code Review',
  document_summary: 'Document Summary',
  translation: 'Translation',
  job_resume: 'Job / Resume',
  research: 'Research',
};

export const SENSITIVE_TYPE_LABELS: Record<SensitiveType, string> = {
  api_key: 'API Key',
  email: 'Email',
  phone: 'Phone',
  token: 'Token',
  database_url: 'Database URL',
  secret_assignment: 'Secret Assignment',
  chinese_id: 'Chinese ID',
  credential_like: 'Credential-like Text',
};

export const RISK_ORDER: RiskLevel[] = ['safe', 'low', 'medium', 'high'];

export function riskLabel(level: RiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
