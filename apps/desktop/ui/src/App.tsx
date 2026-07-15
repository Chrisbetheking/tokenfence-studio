import { useEffect, useMemo, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import type { AppSettings, Language, ScreenId } from './app/types';
import { loadProviderConfig, loadSettings, saveProviderConfig } from './app/store';
import { isDesktopRuntime, saveProviderSecret } from './features/platform/desktopClient';
import { Icon, type IconName } from './components/Icon';
import { ToastProvider } from './components/Toast';
import { WorkspaceScreen } from './screens/WorkspaceScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProvidersScreen } from './screens/ProvidersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

interface NavItem {
  id: ScreenId;
  icon: IconName;
  en: string;
  zh: string;
}

const NAV: NavItem[] = [
  { id: 'workspace', icon: 'workspace', en: 'Workspace', zh: '工作台' },
  { id: 'history', icon: 'history', en: 'History', zh: '历史记录' },
  { id: 'providers', icon: 'server', en: 'Providers', zh: 'Provider' },
  { id: 'settings', icon: 'settings', en: 'Settings', zh: '设置' },
  { id: 'about', icon: 'info', en: 'About', zh: '关于' },
];

function resolvedTheme(settings: AppSettings): 'light' | 'dark' {
  if (settings.theme !== 'system') return settings.theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function TokenFenceApp() {
  const initialSettings = useMemo(() => loadSettings(), []);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [active, setActive] = useState<ScreenId>(initialSettings.startScreen);
  const [openConversationId, setOpenConversationId] = useState<string | undefined>(undefined);
  const [newSessionNonce, setNewSessionNonce] = useState(0);
  const language = settings.language;

  useEffect(() => {
    const apply = () => {
      const next = loadSettings();
      setSettings(next);
      document.documentElement.dataset.theme = resolvedTheme(next);
      document.documentElement.lang = next.language;
    };
    apply();
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener('change', apply);
    window.addEventListener('tokenfence:settings-updated', apply);
    return () => {
      media?.removeEventListener('change', apply);
      window.removeEventListener('tokenfence:settings-updated', apply);
    };
  }, []);

  const startNew = () => {
    setActive('workspace');
    setOpenConversationId(undefined);
    setNewSessionNonce((value) => value + 1);
  };

  useEffect(() => {
    const legacy = loadProviderConfig();
    if (!legacy.apiKey.trim() || !isDesktopRuntime()) return;
    void saveProviderSecret(legacy.apiKey.trim()).then((result) => {
      // Whether migration succeeds or not, remove the legacy plaintext value.
      // On failure the user can re-enter the key, but TokenFence must not keep
      // an API credential in browser storage.
      saveProviderConfig({ ...legacy, apiKey: '', credentialStored: result.ok });
    });
  }, []);

  useEffect(() => {
    if (!isDesktopRuntime()) return;
    const cleanups: Array<() => void> = [];
    void listen('tokenfence://new-session', startNew).then((unlisten) => cleanups.push(unlisten));
    void listen<string>('tokenfence://navigate', ({ payload }) => {
      if (payload === 'settings' || payload === 'about' || payload === 'providers' || payload === 'history' || payload === 'workspace') {
        setActive(payload);
      }
    }).then((unlisten) => cleanups.push(unlisten));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="shield" size={22} /></div>
          <div><strong>TokenFence</strong><span>Safe AI Workspace</span></div>
        </div>

        <button className="new-session" onClick={startNew}><Icon name="plus" />{copy(language, 'New session', '新建会话')}</button>

        <nav className="app-nav" aria-label="Primary navigation">
          {NAV.map((item) => (
            <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
              <Icon name={item.icon} />
              <span>{copy(language, item.en, item.zh)}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="local-badge"><Icon name="lock" size={15} /><span>{copy(language, 'Local-first records', '本地优先记录')}</span></div>
          <small>v1.6.1 · macOS</small>
        </div>
      </aside>

      <div className="app-content">
        {active === 'workspace' && <WorkspaceScreen language={language} openConversationId={openConversationId} newSessionNonce={newSessionNonce} onOpenProviders={() => setActive('providers')} />}
        {active === 'history' && <HistoryScreen language={language} onOpen={(id) => { setOpenConversationId(id); setActive('workspace'); }} />}
        {active === 'providers' && <ProvidersScreen language={language} onDone={() => setActive('workspace')} />}
        {active === 'settings' && <SettingsScreen language={language} onSettingsChanged={setSettings} />}
        {active === 'about' && <AboutScreen language={language} />}
      </div>
    </div>
  );
}

export function App() {
  return <ToastProvider><TokenFenceApp /></ToastProvider>;
}
