import { useEffect, useMemo, useState } from 'react';
import type { AgentProfile, ComputerCapability, Language } from '../app/types';
import { BUILT_IN_SKILLS } from '../app/skills';
import { loadActiveAgentId, loadAgents, nowIso, saveActiveAgentId, saveAgents } from '../app/store';
import { getComputerCapabilities } from '../features/platform/desktopClient';
import { Icon, type IconName } from '../components/Icon';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

export function AgentsScreen({ language, onStart }: { language: Language; onStart: () => void }) {
  const [agents, setAgents] = useState<AgentProfile[]>(() => loadAgents());
  const [activeId, setActiveId] = useState(() => loadActiveAgentId());
  const [capabilities, setCapabilities] = useState<ComputerCapability[]>([]);
  const [category, setCategory] = useState<'all' | typeof BUILT_IN_SKILLS[number]['category']>('all');
  const toast = useToast();
  const active = agents.find((agent) => agent.id === activeId) ?? agents[0];
  const filtered = useMemo(() => BUILT_IN_SKILLS.filter((skill) => category === 'all' || skill.category === category), [category]);

  useEffect(() => { void getComputerCapabilities().then(setCapabilities); }, []);

  const updateAgent = (next: AgentProfile) => {
    const all = agents.map((agent) => agent.id === next.id ? { ...next, updatedAt: nowIso() } : agent);
    setAgents(all);
    saveAgents(all);
  };

  const toggleSkill = (skillId: string) => {
    if (!active) return;
    const selected = active.skillIds.includes(skillId);
    updateAgent({ ...active, skillIds: selected ? active.skillIds.filter((id) => id !== skillId) : [...active.skillIds, skillId] });
  };

  const selectAgent = (id: string) => {
    setActiveId(id);
    saveActiveAgentId(id);
  };

  const start = () => {
    if (!active) return;
    saveActiveAgentId(active.id);
    toast.show(copy(language, `${active.name} selected for the next workspace task.`, `${active.name} 已用于下一个工作台任务。`), 'success');
    onStart();
  };

  return (
    <main className="modern-page agent-page">
      <header className="compact-page-header">
        <div><span className="section-kicker">AGENT STUDIO</span><h1>{copy(language, 'Agents and built-in skills', 'Agent 与内置 Skills')}</h1><p>{copy(language, 'Compose reusable agents from audited local skills, provider routing and explicit permissions.', '用经过审查的本地 Skills、模型路由和明确权限组合可复用 Agent。')}</p></div>
        <div className="header-actions"><span className="metric-chip"><strong>{BUILT_IN_SKILLS.length}</strong> Skills</span><button className="button primary" onClick={start}><Icon name="bot" />{copy(language, 'Start with this agent', '使用此 Agent')}</button></div>
      </header>

      <div className="agent-layout">
        <aside className="agent-roster">
          <div className="panel-title"><span>{copy(language, 'Agent profiles', 'Agent 配置')}</span><small>{agents.length}</small></div>
          {agents.map((agent) => <button key={agent.id} className={activeId === agent.id ? 'selected' : ''} onClick={() => selectAgent(agent.id)}><span className="agent-avatar"><Icon name={agent.id === 'desktop-operator' ? 'monitor' : agent.id === 'document-analyst' ? 'fileText' : 'code'} /></span><span><strong>{agent.name}</strong><small>{agent.skillIds.length} skills · {agent.permissionMode}</small></span></button>)}
          <div className="computer-capabilities">
            <div className="panel-title"><span>Computer Use Beta</span></div>
            {capabilities.map((capability) => <div key={capability.id}><span className={`cap-dot cap-${capability.status}`} /><strong>{capability.id}</strong><small>{capability.status}</small></div>)}
            <p>{copy(language, 'v1.7 adds the permission and capability layer first. Screen capture and controlled actions remain gated by macOS permissions and future native modules.', 'v1.7 先加入权限与能力层；屏幕捕获和受控操作仍需 macOS 权限，并会在后续原生模块中逐步开放。')}</p>
          </div>
        </aside>

        <section className="agent-editor">
          {active && <>
            <div className="agent-editor-hero"><div className="agent-big-icon"><Icon name={active.id === 'desktop-operator' ? 'monitor' : active.id === 'document-analyst' ? 'fileText' : 'code'} size={28} /></div><div><input value={active.name} onChange={(event) => updateAgent({ ...active, name: event.target.value })} /><textarea value={active.description} onChange={(event) => updateAgent({ ...active, description: event.target.value })} rows={2} /></div><label><span>{copy(language, 'Permission', '权限')}</span><select value={active.permissionMode} onChange={(event) => updateAgent({ ...active, permissionMode: event.target.value as AgentProfile['permissionMode'] })}><option value="ask">Ask every time</option><option value="read-only">Read only</option><option value="trusted">Trusted workspace</option></select></label></div>
            <div className="skill-toolbar"><div className="skill-categories">{(['all', 'coding', 'documents', 'research', 'security', 'productivity', 'automation'] as const).map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><span>{active.skillIds.length} {copy(language, 'enabled', '已启用')}</span></div>
            <div className="skill-grid">{filtered.map((skill) => { const enabled = active.skillIds.includes(skill.id); return <button key={skill.id} className={`skill-card ${enabled ? 'enabled' : ''}`} onClick={() => toggleSkill(skill.id)}><div className="skill-card-head"><span className="skill-icon"><Icon name={skill.icon as IconName} /></span><span className={`skill-check ${enabled ? 'on' : ''}`}>{enabled && <Icon name="check" size={13} />}</span></div><strong>{copy(language, skill.nameEn, skill.nameZh)}</strong><p>{copy(language, skill.descriptionEn, skill.descriptionZh)}</p><footer>{skill.permissions.length ? skill.permissions.map((permission) => <span key={permission}>{permission}</span>) : <span>{copy(language, 'No extra permission', '无需额外权限')}</span>}</footer></button>; })}</div>
          </>}
        </section>
      </div>
    </main>
  );
}
