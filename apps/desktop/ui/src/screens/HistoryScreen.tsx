import { useEffect, useMemo, useState } from 'react';
import type { Conversation, Language } from '../app/types';
import { clearConversations, deleteConversation, loadConversations, saveConversation } from '../app/store';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

export function HistoryScreen({ language, onOpen }: { language: Language; onOpen: (id: string) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [query, setQuery] = useState('');
  const toast = useToast();
  useEffect(() => { const reload = () => setConversations(loadConversations()); window.addEventListener('tokenfence:history-updated', reload); return () => window.removeEventListener('tokenfence:history-updated', reload); }, []);
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); return needle ? conversations.filter((item) => `${item.title} ${item.provider} ${item.model}`.toLowerCase().includes(needle)) : conversations; }, [conversations, query]);
  const rename = (conversation: Conversation) => { const title = window.prompt(copy(language, 'Task title', '任务标题'), conversation.title)?.trim(); if (!title) return; saveConversation({ ...conversation, title, updatedAt: new Date().toISOString() }); };
  const remove = (id: string) => { if (!window.confirm(copy(language, 'Delete this task?', '删除这条任务吗？'))) return; deleteConversation(id); };
  const clearAll = () => { if (!window.confirm(copy(language, 'Delete all redacted history?', '清空全部脱敏历史吗？'))) return; clearConversations(); setConversations([]); toast.show(copy(language, 'History cleared.', '历史记录已清空。'), 'success'); };
  return <main className="modern-page history-page-modern">
    <header className="compact-page-header"><div><span className="section-kicker">LOCAL ARCHIVE</span><h1>{copy(language, 'Protected task history', '受保护任务历史')}</h1><p>{copy(language, 'Only redacted prompts, model replies and safety metadata are retained.', '仅保留脱敏提示词、模型回复与安全元数据。')}</p></div><div className="header-actions"><button className="button ghost danger" onClick={clearAll} disabled={!conversations.length}><Icon name="trash" />{copy(language, 'Clear all', '清空全部')}</button></div></header>
    <div className="search-bar-modern"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy(language, 'Search task, provider or model', '搜索任务、Provider 或模型')} /><span>{filtered.length}</span></div>
    {filtered.length ? <section className="history-grid-modern">{filtered.map((conversation) => <article key={conversation.id}><button className="history-card-main" onClick={() => onOpen(conversation.id)}><div className="history-card-icon"><Icon name={conversation.mode === 'agent' ? 'bot' : 'workspace'} /></div><div><div className="history-card-title"><strong>{conversation.title}</strong><span className={`risk-text risk-${conversation.riskSummary}`}>{conversation.riskSummary}</span></div><p>{conversation.messages[conversation.messages.length - 1]?.content.slice(0, 180) || copy(language, 'Empty task', '空任务')}</p><footer><span>{new Date(conversation.updatedAt).toLocaleString()}</span><span>{conversation.provider}</span><span>{conversation.model}</span>{conversation.mode === 'agent' && <span>Agent</span>}</footer></div></button><div className="history-card-actions"><button onClick={() => rename(conversation)}><Icon name="edit" /></button><button onClick={() => remove(conversation.id)}><Icon name="trash" /></button></div></article>)}</section> : <section className="empty-modern"><Icon name="history" size={34} /><h2>{copy(language, 'No protected tasks yet', '还没有受保护任务')}</h2><p>{copy(language, 'Reviewed conversations and agent runs will appear here.', '完成审查的对话和 Agent 任务会显示在这里。')}</p></section>}
  </main>;
}
