import type { AgentProfile, SkillDefinition } from './types';

export const BUILT_IN_SKILLS: SkillDefinition[] = [
  {
    id: 'secure-coder', icon: 'code', category: 'coding', builtIn: true,
    nameEn: 'Secure Coder', nameZh: '安全编程',
    descriptionEn: 'Plans changes, reviews diffs and keeps secrets out of generated code.',
    descriptionZh: '规划代码修改、审查 Diff，并避免把密钥写入代码。',
    permissions: ['files-read', 'files-write'],
    systemPrompt: 'Act as a security-conscious coding agent. Before changing code, state the plan, affected files, tests, and rollback. Never embed credentials. Prefer minimal diffs and verify every change.',
  },
  {
    id: 'repo-onboarding', icon: 'git', category: 'coding', builtIn: true,
    nameEn: 'Repository Onboarding', nameZh: '仓库快速接手',
    descriptionEn: 'Maps architecture, scripts, release paths and likely failure points.',
    descriptionZh: '梳理架构、脚本、发布链路和高风险故障点。',
    permissions: ['files-read', 'github'],
    systemPrompt: 'Map the repository before making changes. Summarize entry points, build commands, data flow, release workflow, security boundaries and unresolved risks.',
  },
  {
    id: 'release-doctor', icon: 'rocket', category: 'automation', builtIn: true,
    nameEn: 'Release Doctor', nameZh: '发布诊断',
    descriptionEn: 'Diagnoses CI, packaging, signing and GitHub Release failures.',
    descriptionZh: '诊断 CI、打包、签名与 GitHub Release 故障。',
    permissions: ['files-read', 'github', 'network'],
    systemPrompt: 'Diagnose release failures from evidence. Distinguish source build, packaging, signing, notarization, artifact upload and release publication. Never claim success without a verifiable artifact.',
  },
  {
    id: 'token-compressor', icon: 'sparkles', category: 'productivity', builtIn: true,
    nameEn: 'Token Compressor', nameZh: 'Token 压缩器',
    descriptionEn: 'Removes repetition and prepares compact context without changing intent.',
    descriptionZh: '去除重复内容，在不改变意图的前提下压缩上下文。',
    permissions: [],
    systemPrompt: 'Minimize token use. Avoid repeating context already present, keep only task-relevant evidence, and answer with the smallest complete structure.',
  },
  {
    id: 'privacy-review', icon: 'shield', category: 'security', builtIn: true,
    nameEn: 'Privacy Review', nameZh: '隐私审查',
    descriptionEn: 'Finds credentials, personal data and unsafe data-sharing paths.',
    descriptionZh: '识别凭证、个人数据和不安全的数据发送路径。',
    permissions: ['files-read'],
    systemPrompt: 'Review the supplied content for credentials, personal data, private repository details and unsafe outbound transfers. Mask sensitive values and explain the minimum safe payload.',
  },
  {
    id: 'pdf-research', icon: 'fileText', category: 'documents', builtIn: true,
    nameEn: 'PDF Research', nameZh: 'PDF 研究助手',
    descriptionEn: 'Turns extracted PDF text into structured notes, evidence and questions.',
    descriptionZh: '把 PDF 提取文本整理为结构化笔记、证据和问题。',
    permissions: ['files-read'],
    systemPrompt: 'Analyze documents with source discipline. Separate direct evidence, interpretation, uncertainty and follow-up questions. Preserve page markers when provided.',
  },
  {
    id: 'ocr-cleanup', icon: 'scanText', category: 'documents', builtIn: true,
    nameEn: 'OCR Cleanup', nameZh: 'OCR 清洗',
    descriptionEn: 'Repairs common OCR spacing, punctuation and line-break errors.',
    descriptionZh: '修复 OCR 常见空格、标点与断行错误。',
    permissions: ['files-read'],
    systemPrompt: 'Clean OCR text conservatively. Preserve factual content, mark uncertain characters, reconstruct paragraphs and do not invent missing information.',
  },
  {
    id: 'spreadsheet-analyst', icon: 'table', category: 'documents', builtIn: true,
    nameEn: 'Spreadsheet Analyst', nameZh: '表格分析',
    descriptionEn: 'Profiles CSV/XLSX data and proposes checks before analysis.',
    descriptionZh: '分析 CSV/XLSX 数据，并先执行质量检查。',
    permissions: ['files-read'],
    systemPrompt: 'Inspect table shape, missing values, duplicates, types and suspicious outliers before analysis. State assumptions and avoid fabricating unavailable rows.',
  },
  {
    id: 'github-triage', icon: 'git', category: 'automation', builtIn: true,
    nameEn: 'GitHub Triage', nameZh: 'GitHub 分诊',
    descriptionEn: 'Summarizes issues, releases and CI evidence into next actions.',
    descriptionZh: '把 Issue、Release 和 CI 证据整理成下一步行动。',
    permissions: ['github', 'network'],
    systemPrompt: 'Triage GitHub evidence by severity, reproducibility and user impact. Link each recommendation to a concrete issue, run, release or file.',
  },
  {
    id: 'research-brief', icon: 'search', category: 'research', builtIn: true,
    nameEn: 'Research Brief', nameZh: '研究简报',
    descriptionEn: 'Builds a concise sourced brief and highlights disagreements.',
    descriptionZh: '生成有来源的简报，并突出证据分歧。',
    permissions: ['network'],
    systemPrompt: 'Produce a concise research brief. Prefer primary sources, date-sensitive verification and explicit uncertainty. Separate fact from inference.',
  },
  {
    id: 'computer-use-guard', icon: 'monitor', category: 'automation', builtIn: true,
    nameEn: 'Computer Use Guard', nameZh: 'Computer Use 安全守卫',
    descriptionEn: 'Requires scoped permissions and approval before desktop actions.',
    descriptionZh: '在桌面操作前执行权限分级和逐步确认。',
    permissions: ['computer-view', 'computer-control'],
    systemPrompt: 'Before any computer action, produce a step plan, required permission, expected visible effect and rollback. Ask for approval before every write, click, typing, upload, send, purchase or destructive action.',
  },
  {
    id: 'product-critic', icon: 'layout', category: 'productivity', builtIn: true,
    nameEn: 'Product Critic', nameZh: '产品体验审查',
    descriptionEn: 'Reviews product hierarchy, empty states and interaction friction.',
    descriptionZh: '审查信息层级、空状态和交互阻力。',
    permissions: [],
    systemPrompt: 'Review the product as a first-time user. Identify unclear hierarchy, dead ends, hidden state, unnecessary text and weak feedback. Recommend concrete interface changes.',
  },
];

const stamp = new Date(0).toISOString();

export const DEFAULT_AGENTS: AgentProfile[] = [
  {
    id: 'tokenfence-coder', name: 'TokenFence Coder', description: 'Codex-style coding workflow with security and release checks.',
    skillIds: ['secure-coder', 'repo-onboarding', 'release-doctor', 'token-compressor', 'privacy-review'],
    permissionMode: 'ask', enabled: true, createdAt: stamp, updatedAt: stamp,
  },
  {
    id: 'document-analyst', name: 'Document Analyst', description: 'PDF, OCR and spreadsheet analysis with compact context.',
    skillIds: ['pdf-research', 'ocr-cleanup', 'spreadsheet-analyst', 'token-compressor', 'privacy-review'],
    permissionMode: 'read-only', enabled: true, createdAt: stamp, updatedAt: stamp,
  },
  {
    id: 'desktop-operator', name: 'Desktop Operator (Beta)', description: 'Permission-gated computer-use planning and approved actions.',
    skillIds: ['computer-use-guard', 'privacy-review'],
    permissionMode: 'ask', enabled: true, createdAt: stamp, updatedAt: stamp,
  },
];

export function skillPrompt(skillIds: string[]): string {
  const selected = BUILT_IN_SKILLS.filter((skill) => skillIds.includes(skill.id));
  return selected.map((skill) => `## ${skill.nameEn}\n${skill.systemPrompt}`).join('\n\n');
}
