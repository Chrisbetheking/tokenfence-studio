import { useEffect, useMemo, useState } from 'react';
import type {
  GitHubConnectionInfo,
  GitHubIssueSummary,
  GitHubRepositoryOverview,
  ChatMessage,
  Language,
  ProjectCommandResult,
  ProjectFileNode,
  ProjectWorkspace,
} from '../app/types';
import { loadActiveProvider, loadGitHubRepoUrl, loadProjectRoot, loadSettings, recordTokenUsage, saveGitHubRepoUrl, saveProjectRoot } from '../app/store';
import {
  applyReviewedPatch,
  chooseProjectFolder,
  clonePublicRepository,
  commitProjectChanges,
  createGitBranch,
  projectGitDiff,
  projectGitStatus,
  pushGitBranch,
  readProjectFile,
  reopenProjectFolder,
  runProjectPreset,
  scanProject,
  writeProjectFile,
} from '../features/projects/projectClient';
import {
  createGitHubPullRequest,
  deleteGitHubToken,
  getGitHubRepository,
  listGitHubIssues,
  saveGitHubToken,
  testGitHubConnection,
} from '../features/github/githubClient';
import { Icon } from '../components/Icon';
import { sendProviderChat } from '../features/providers/providerClient';
import { scanText } from '../features/safety/scanner';
import { estimateTokens } from '../features/tokens/optimizer';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

function flatten(nodes: ProjectFileNode[]): ProjectFileNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flatten(node.children) : [])]);
}

function repoParts(url: string): { owner: string; repo: string } | null {
  const match = url.trim().match(/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

export function ProjectsScreen({ language }: { language: Language }) {
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [tree, setTree] = useState<ProjectFileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState('');
  const [command, setCommand] = useState<ProjectCommandResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [repoUrl, setRepoUrl] = useState(() => loadGitHubRepoUrl());
  const [token, setToken] = useState('');
  const [github, setGithub] = useState<GitHubConnectionInfo | null>(null);
  const [overview, setOverview] = useState<GitHubRepositoryOverview | null>(null);
  const [issues, setIssues] = useState<GitHubIssueSummary[]>([]);
  const [patch, setPatch] = useState('');
  const [branch, setBranch] = useState('chris-studio/agent-change');
  const [commitMessage, setCommitMessage] = useState('feat: apply reviewed Chris Studio change');
  const [prTitle, setPrTitle] = useState('Chris Studio reviewed change');
  const [prBody, setPrBody] = useState('Created from the Chris Studio scoped coding workspace after local review and checks.');
  const [baseBranch, setBaseBranch] = useState('main');
  const [agentTask, setAgentTask] = useState('');
  const [agentPlan, setAgentPlan] = useState('');
  const [agentBusy, setAgentBusy] = useState(false);
  const toast = useToast();
  const flat = useMemo(() => flatten(tree), [tree]);
  const dirty = content !== original;

  const refreshTree = async () => {
    setTree(await scanProject());
  };

  useEffect(() => {
    const root = loadProjectRoot();
    if (!root) return;
    void reopenProjectFolder(root).then((value) => {
      if (!value) return;
      setWorkspace(value);
      void refreshTree();
    });
  }, []);

  const openFolder = async () => {
    const value = await chooseProjectFolder();
    if (!value) return;
    setWorkspace(value);
    saveProjectRoot(value.root);
    setSelectedPath('');
    setContent('');
    setOriginal('');
    await refreshTree();
  };

  const openFile = async (path: string) => {
    if (dirty && !window.confirm(copy(language, 'Discard unsaved editor changes?', '放弃尚未保存的编辑内容？'))) return;
    const result = await readProjectFile(path);
    if (!result.ok || result.binary) {
      toast.show(result.errorMessage ?? copy(language, 'This file cannot be edited as text.', '此文件无法作为文本编辑。'), 'warning');
      return;
    }
    setSelectedPath(path);
    setContent(result.content);
    setOriginal(result.content);
  };

  const save = async () => {
    if (!selectedPath || !dirty) return;
    if (!window.confirm(copy(language, 'Write this reviewed change and create a local backup?', '写入此项已审查修改并创建本地备份？'))) return;
    const result = await writeProjectFile(selectedPath, content, true);
    if (!result.ok) return toast.show(result.errorMessage ?? 'Write failed.', 'error');
    setOriginal(content);
    toast.show(copy(language, `Saved with backup: ${result.backupPath ?? 'created'}`, `已保存并创建备份：${result.backupPath ?? '完成'}`), 'success');
    await refreshTree();
  };

  const run = async (preset: string) => {
    const destructive = preset === 'git-clean-check';
    if (destructive && !window.confirm(copy(language, 'Run this approved diagnostic preset?', '运行此项已批准诊断预设？'))) return;
    setBusy(true);
    const result = preset === 'git-status' ? await projectGitStatus() : preset === 'git-diff' ? await projectGitDiff() : await runProjectPreset(preset, true);
    setCommand(result);
    setBusy(false);
  };

  const connectGitHub = async () => {
    if (token.trim()) {
      const saved = await saveGitHubToken(token.trim());
      if (!saved.ok) return toast.show(saved.message ?? 'GitHub token could not be stored.', 'error');
      setToken('');
    }
    const status = await testGitHubConnection();
    setGithub(status);
    if (!status.ok) return toast.show(status.errorMessage ?? 'GitHub connection failed.', 'error');
    saveGitHubRepoUrl(repoUrl);
    const parts = repoParts(repoUrl);
    if (parts) {
      const [repo, repoIssues] = await Promise.all([getGitHubRepository(parts.owner, parts.repo), listGitHubIssues(parts.owner, parts.repo)]);
      setOverview(repo);
      setIssues(repoIssues);
    }
    toast.show(copy(language, `Connected as ${status.login}.`, `已连接 GitHub：${status.login}。`), 'success');
  };

  const cloneRepo = async () => {
    const value = await clonePublicRepository(repoUrl);
    if (!value) return;
    setWorkspace(value);
    saveProjectRoot(value.root);
    await refreshTree();
  };

  const applyPatch = async () => {
    if (!patch.trim() || !window.confirm(copy(language, 'Apply this reviewed unified diff to the approved project folder?', '把这份已审查的统一 Diff 应用到当前批准的项目目录？'))) return;
    setBusy(true);
    const result = await applyReviewedPatch(patch, true);
    setCommand(result);
    setBusy(false);
    if (result.ok) {
      setPatch('');
      await refreshTree();
      toast.show(copy(language, 'Patch applied. Review Git diff before committing.', '补丁已应用，请在提交前检查 Git Diff。'), 'success');
    } else toast.show(result.errorMessage ?? result.stderr ?? 'Patch failed.', 'error');
  };

  const createBranch = async () => {
    if (!window.confirm(copy(language, `Create branch ${branch}?`, `创建分支 ${branch}？`))) return;
    const result = await createGitBranch(branch, true);
    setCommand(result);
    toast.show(result.ok ? copy(language, 'Branch created.', '分支已创建。') : (result.errorMessage ?? result.stderr), result.ok ? 'success' : 'error');
  };

  const commitChanges = async () => {
    if (!window.confirm(copy(language, 'Stage all reviewed project changes and create this commit?', '暂存全部已审查修改并创建该提交？'))) return;
    const result = await commitProjectChanges(commitMessage, true);
    setCommand(result);
    toast.show(result.ok ? copy(language, 'Commit created.', '提交已创建。') : (result.errorMessage ?? result.stderr), result.ok ? 'success' : 'error');
  };

  const pushBranch = async () => {
    if (!window.confirm(copy(language, `Push ${branch} to origin using the Mac Git credential configuration?`, `使用 Mac 的 Git 凭证配置把 ${branch} 推送到 origin？`))) return;
    const result = await pushGitBranch(branch, true);
    setCommand(result);
    toast.show(result.ok ? copy(language, 'Branch pushed.', '分支已推送。') : (result.errorMessage ?? result.stderr), result.ok ? 'success' : 'error');
  };

  const generateAgentPatch = async () => {
    if (!workspace || !agentTask.trim()) return;
    const profile = loadActiveProvider();
    if (profile.providerId === 'local-demo') {
      toast.show(copy(language, 'Choose a connected model before running the coding agent.', '请先选择并连接真实模型，再运行 Coding Agent。'), 'warning');
      return;
    }
    setAgentBusy(true);
    try {
      const settings = loadSettings();
      const status = await projectGitStatus();
      const diff = await projectGitDiff();
      const fileList = flat.filter((node) => node.kind === 'file').slice(0, 500).map((node) => node.path).join('\n');
      const selectedFile = selectedPath
        ? `\nSELECTED FILE: ${selectedPath}\n${content.slice(0, 80_000)}`
        : '\nNo file is selected. Base the proposal on the repository tree and Git state.';
      const rawContext = `TASK:\n${agentTask.trim()}\n\nREPOSITORY TREE:\n${fileList}\n\nGIT STATUS:\n${status.stdout || status.stderr}\n\nCURRENT DIFF:\n${(diff.stdout || diff.stderr).slice(0, 40_000)}${selectedFile}`;
      const safety = scanText(rawContext, settings.customSensitiveTerms);
      if ((safety.riskLevel === 'critical' || safety.riskLevel === 'high') && !window.confirm(copy(language, 'Sensitive repository data was found. Send only the locally redacted context to the active model?', '检测到敏感仓库数据。是否仅把本地脱敏后的上下文发送给当前模型？'))) {
        setAgentBusy(false);
        return;
      }
      const safeContext = safety.findings.length ? safety.redactedText : rawContext;
      const messages: Pick<ChatMessage, 'role' | 'content'>[] = [
        {
          role: 'system',
          content: 'You are Chris Studio Coding Agent. Produce a minimal, reviewable change for the scoped repository. Never invent file contents. Do not request secrets. Do not include shell commands outside the approved checks. Return exactly two sections: PLAN: a concise numbered plan; PATCH: one valid unified git diff beginning with diff --git. If repository context is insufficient, return PLAN explaining what is missing and PATCH: NONE.',
        },
        { role: 'user', content: safeContext },
      ];
      const reply = await sendProviderChat(profile, messages, settings.requestTimeoutMs);
      if (!reply.ok || !reply.content) {
        toast.show(reply.errorMessage ?? copy(language, 'The coding agent request failed.', 'Coding Agent 请求失败。'), 'error');
        return;
      }
      const text = reply.content.trim();
      const patchMatch = text.match(/(?:PATCH:\s*)?(diff --git[\s\S]*?)(?:```\s*$|$)/i);
      const noPatch = /PATCH:\s*NONE/i.test(text);
      const extracted = patchMatch?.[1]?.replace(/```(?:diff)?\s*$/i, '').trim() ?? '';
      const plan = text.split(/\bPATCH:\s*/i)[0].replace(/^PLAN:\s*/i, '').trim();
      setAgentPlan(plan || text.slice(0, 8_000));
      if (extracted) {
        setPatch(extracted);
        toast.show(copy(language, 'Agent patch generated. Review every line before applying it.', 'Agent 补丁已生成，请逐行审查后再应用。'), 'success');
      } else if (noPatch) {
        toast.show(copy(language, 'The agent needs more repository context and did not generate a patch.', 'Agent 需要更多仓库上下文，本次未生成补丁。'), 'warning');
      } else {
        toast.show(copy(language, 'The model response did not contain a valid unified diff.', '模型回复中没有有效的统一 Diff。'), 'warning');
      }
      recordTokenUsage({
        id: `agent_${Date.now()}`,
        createdAt: new Date().toISOString(),
        provider: profile.displayName,
        model: reply.model ?? profile.model,
        inputTokens: estimateTokens(messages.map((message) => message.content).join('\n')),
        outputTokens: estimateTokens(text),
        savedTokens: safety.findings.length ? estimateTokens(rawContext) - estimateTokens(safeContext) : 0,
      });
    } finally {
      setAgentBusy(false);
    }
  };

  const createPullRequest = async () => {
    const parts = repoParts(repoUrl);
    if (!parts) return toast.show(copy(language, 'Enter a valid GitHub repository URL.', '请输入有效的 GitHub 仓库地址。'), 'warning');
    if (!window.confirm(copy(language, `Create a Pull Request from ${branch} to ${baseBranch}?`, `创建从 ${branch} 到 ${baseBranch} 的 Pull Request？`))) return;
    const result = await createGitHubPullRequest({ owner: parts.owner, repo: parts.repo, title: prTitle, body: prBody, head: branch, base: baseBranch, confirmed: true });
    if (!result.ok) return toast.show(result.errorMessage ?? 'Pull Request failed.', 'error');
    toast.show(copy(language, `Pull Request #${result.number} created.`, `Pull Request #${result.number} 已创建。`), 'success');
    if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer');
  };

  return <main className="modern-page projects-page">
    <header className="compact-page-header">
      <div><span className="section-kicker">CODING AGENT SANDBOX</span><h1>{copy(language, 'Repository workspace', '仓库工作区')}</h1><p>{copy(language, 'Open a scoped folder, review files, write with backups and run only approved checks.', '打开受限目录，审查文件，带备份写入，并且只运行已批准的检查。')}</p></div>
      <div className="header-actions"><button className="button secondary" onClick={cloneRepo}><Icon name="git" />{copy(language, 'Clone public repo', '克隆公开仓库')}</button><button className="button primary" onClick={openFolder}><Icon name="folder" />{copy(language, 'Open folder', '打开文件夹')}</button></div>
    </header>

    <section className="github-strip">
      <div><Icon name="git" /><span><strong>{github?.ok ? `@${github.login}` : copy(language, 'GitHub not connected', 'GitHub 未连接')}</strong><small>{overview?.fullName ?? repoUrl}</small></span></div>
      <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" />
      <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder={copy(language, 'PAT (stored in Keychain)', 'PAT（保存到钥匙串）')} />
      <button className="button secondary" onClick={connectGitHub}>{copy(language, 'Connect', '连接')}</button>
      <button className="icon-button danger" onClick={() => { void deleteGitHubToken(); setGithub(null); }} title={copy(language, 'Remove token', '删除令牌')}><Icon name="trash" /></button>
    </section>

    {overview?.ok && <section className="repo-overview-row"><span><strong>{overview.defaultBranch}</strong><small>{copy(language, 'default branch', '默认分支')}</small></span><span><strong>{overview.stars ?? 0}</strong><small>stars</small></span><span><strong>{overview.openIssues ?? 0}</strong><small>{copy(language, 'open issues', '未关闭 Issue')}</small></span><span><strong>{overview.privateRepo ? copy(language, 'Private', '私有') : copy(language, 'Public', '公开')}</strong><small>{overview.pushedAt ? new Date(overview.pushedAt).toLocaleString() : '—'}</small></span></section>}

    <div className="project-workbench">
      <aside className="project-tree-panel">
        <div className="panel-title"><span>{workspace?.name ?? copy(language, 'No project selected', '尚未选择项目')}</span><small>{workspace?.fileCount ?? 0}</small></div>
        {flat.filter((node) => node.kind === 'file').slice(0, 2_000).map((node) => <button key={node.path} className={selectedPath === node.path ? 'selected' : ''} onClick={() => void openFile(node.path)} style={{ paddingLeft: `${10 + Math.min(node.depth, 6) * 10}px` }}><Icon name="file" size={14} /><span>{node.name}</span></button>)}
        {!workspace && <div className="file-empty-small"><Icon name="folder" /><p>{copy(language, 'Open a repository folder to start.', '打开仓库文件夹后开始。')}</p></div>}
      </aside>

      <section className="project-editor-panel">
        <header><div><span className="file-kind-pill">{dirty ? copy(language, 'MODIFIED', '已修改') : copy(language, 'REVIEWED FILE', '审查文件')}</span><h2>{selectedPath || copy(language, 'Select a text file', '选择一个文本文件')}</h2></div><button className="button primary" onClick={save} disabled={!dirty}><Icon name="check" />{copy(language, 'Save + backup', '保存并备份')}</button></header>
        <textarea className="code-editor" value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} placeholder={copy(language, 'File content appears here. Every write requires confirmation.', '文件内容将在此显示，每次写入都需要确认。')} />
      </section>

      <aside className="project-tools-panel">
        <div className="panel-title"><span>{copy(language, 'Approved checks', '批准的检查')}</span></div>
        {[
          ['git-status', 'Git status'], ['git-diff', 'Git diff'], ['npm-typecheck', 'npm typecheck'], ['npm-test', 'npm test'], ['npm-build', 'npm build'], ['cargo-check', 'cargo check'], ['cargo-test', 'cargo test'],
        ].map(([id, label]) => <button key={id} onClick={() => void run(id)} disabled={!workspace || busy}><Icon name={id.startsWith('git') ? 'git' : 'terminal'} /><span>{label}</span></button>)}
        <details className="agent-action-group" open>
          <summary>{copy(language, 'AI patch assistant', 'AI 补丁助手')}</summary>
          <textarea value={agentTask} onChange={(event) => setAgentTask(event.target.value)} placeholder={copy(language, 'Describe a small repository change. Chris Studio sends a redacted tree, Git state and the selected file to the active model.', '描述一个小型仓库修改。Chris Studio 会把脱敏后的目录、Git 状态和当前文件发送给活跃模型。')} />
          <button onClick={() => void generateAgentPatch()} disabled={!workspace || !agentTask.trim() || agentBusy}><Icon name="sparkles" /><span>{agentBusy ? copy(language, 'Generating…', '生成中…') : copy(language, 'Generate reviewed diff', '生成待审查 Diff')}</span></button>
          {agentPlan && <div className="agent-plan-output"><strong>{copy(language, 'Plan', '计划')}</strong><pre>{agentPlan}</pre></div>}
        </details>
        <details className="agent-action-group">
          <summary>{copy(language, 'Reviewed patch', '审查补丁')}</summary>
          <textarea value={patch} onChange={(event) => setPatch(event.target.value)} placeholder="diff --git a/... b/..." spellCheck={false} />
          <button onClick={() => void applyPatch()} disabled={!workspace || !patch.trim() || busy}><Icon name="code" /><span>{copy(language, 'Apply checked diff', '应用已检查 Diff')}</span></button>
        </details>
        <details className="agent-action-group">
          <summary>{copy(language, 'Branch, commit and PR', '分支、提交与 PR')}</summary>
          <input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="chris-studio/feature" />
          <input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} placeholder="feat: ..." />
          <div className="action-button-row"><button onClick={() => void createBranch()} disabled={!workspace}>{copy(language, 'Create branch', '创建分支')}</button><button onClick={() => void commitChanges()} disabled={!workspace}>{copy(language, 'Commit', '提交')}</button><button onClick={() => void pushBranch()} disabled={!workspace}>{copy(language, 'Push', '推送')}</button></div>
          <input value={prTitle} onChange={(event) => setPrTitle(event.target.value)} placeholder={copy(language, 'Pull Request title', 'Pull Request 标题')} />
          <input value={baseBranch} onChange={(event) => setBaseBranch(event.target.value)} placeholder="main" />
          <textarea value={prBody} onChange={(event) => setPrBody(event.target.value)} placeholder={copy(language, 'Pull Request summary', 'Pull Request 说明')} />
          <button onClick={() => void createPullRequest()} disabled={!github?.ok}><Icon name="git" /><span>{copy(language, 'Create Pull Request', '创建 Pull Request')}</span></button>
        </details>
        <pre className="command-output">{command ? `$ ${command.command}\n\n${command.stdout}${command.stderr ? `\n${command.stderr}` : ''}` : copy(language, 'Command output and Git diffs appear here.', '命令输出与 Git Diff 将显示在这里。')}</pre>
        {issues.length > 0 && <div className="issue-mini-list"><div className="panel-title"><span>Issues</span><small>{issues.length}</small></div>{issues.slice(0, 6).map((issue) => <a key={issue.number} href={issue.url} target="_blank" rel="noreferrer">#{issue.number} {issue.title}</a>)}</div>}
      </aside>
    </div>
  </main>;
}
