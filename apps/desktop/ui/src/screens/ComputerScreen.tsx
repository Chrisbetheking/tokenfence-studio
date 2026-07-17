import { useEffect, useState } from 'react';
import type { ComputerAuditEntry, ComputerCapability, Language } from '../app/types';
import { appendComputerAudit, clearComputerAudit, loadComputerAudit, makeId, nowIso } from '../app/store';
import { getComputerCapabilities } from '../features/platform/desktopClient';
import {
  captureScreen,
  clickPointer,
  openApplication,
  openComputerPrivacySettings,
  pressKey,
  requestComputerPermissions,
  typeText,
} from '../features/computer/computerClient';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

type DesktopAction = 'capture' | 'open' | 'click' | 'type' | 'key';

const APP_OPTIONS = [
  { value: 'TextEdit', en: 'TextEdit', zh: '文本编辑' },
  { value: 'Notes', en: 'Notes', zh: '备忘录' },
  { value: 'Safari', en: 'Safari', zh: 'Safari' },
  { value: 'Finder', en: 'Finder', zh: '访达' },
  { value: 'Terminal', en: 'Terminal', zh: '终端' },
  { value: 'System Settings', en: 'System Settings', zh: '系统设置' },
];

export function ComputerScreen({ language }: { language: Language }) {
  const [capabilities, setCapabilities] = useState<ComputerCapability[]>([]);
  const [screenshot, setScreenshot] = useState('');
  const [application, setApplication] = useState('TextEdit');
  const [x, setX] = useState(400);
  const [y, setY] = useState(300);
  const [text, setText] = useState('');
  const [key, setKey] = useState('enter');
  const [approved, setApproved] = useState(false);
  const [audit, setAudit] = useState<ComputerAuditEntry[]>(() => loadComputerAudit());
  const [busyAction, setBusyAction] = useState<DesktopAction | null>(null);
  const toast = useToast();

  useEffect(() => { void getComputerCapabilities().then(setCapabilities); }, []);

  const record = (action: string, detail: string, ok: boolean) => {
    const entry = { id: makeId('audit'), action, detail, ok, createdAt: nowIso() };
    appendComputerAudit(entry);
    setAudit(loadComputerAudit());
  };

  const execute = async (action: DesktopAction) => {
    if (!approved) {
      toast.show(copy(language, 'Review and approve this single desktop action first.', '请先审查并批准这一项桌面操作。'), 'warning');
      return;
    }

    if (action === 'type' && !text.trim()) {
      toast.show(copy(language, 'Enter text before approving the action.', '请先填写需要输入的文字。'), 'warning');
      return;
    }

    setBusyAction(action);
    try {
      const result = action === 'capture' ? await captureScreen(true)
        : action === 'open' ? await openApplication(application, true)
        : action === 'click' ? await clickPointer(x, y, true)
        : action === 'type' ? await typeText(text, true)
        : await pressKey(key, true);

      if (result.screenshotDataUrl) setScreenshot(result.screenshotDataUrl);
      record(result.action, result.message, result.ok);
      toast.show(result.message, result.ok ? 'success' : 'error');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      record(action, message, false);
      toast.show(message, 'error');
    } finally {
      setApproved(false);
      setBusyAction(null);
    }
  };

  const requestPermissions = async () => {
    setBusyAction('capture');
    try {
      const result = await requestComputerPermissions();
      toast.show(result.message, result.ok ? 'success' : 'warning');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : String(error), 'error');
    } finally {
      setBusyAction(null);
    }
  };

  const busy = busyAction !== null;

  return <main className="modern-page computer-page">
    <header className="compact-page-header">
      <div>
        <span className="section-kicker">COMPUTER USE · APPROVAL FIRST</span>
        <h1>{copy(language, 'Permission-gated desktop control', '权限门控的桌面控制')}</h1>
        <p>{copy(language, 'Most desktop actions now run directly from the main conversation. This advanced page remains for preview, manual control and audit.', '大多数桌面操作现已可直接在主对话中完成。本页保留用于屏幕预览、手动控制和审计。')}</p>
      </div>
      <div className="header-actions">
        <button className="button primary" onClick={() => void requestPermissions()} disabled={busy}>
          <Icon name="shield" />{copy(language, 'Request permissions', '请求系统权限')}
        </button>
        <button className="button secondary" onClick={() => void openComputerPrivacySettings()} disabled={busy}>
          <Icon name="settings" />{copy(language, 'Open settings', '打开系统设置')}
        </button>
      </div>
    </header>

    <section className="capability-row-modern">
      {capabilities.map((capability) => <article key={capability.id}>
        <span className={`cap-dot cap-${capability.status}`} />
        <div><strong>{capability.id}</strong><small>{capability.status}</small></div>
      </article>)}
    </section>

    <div className="computer-layout">
      <section className="screen-preview-panel">
        <header>
          <div><span className="section-kicker">VISIBLE STATE</span><h2>{copy(language, 'Screen preview', '屏幕预览')}</h2></div>
          <button className="button secondary" onClick={() => void execute('capture')} disabled={busy}>
            <Icon name="monitor" />{busyAction === 'capture' ? copy(language, 'Working…', '处理中…') : copy(language, 'Capture now', '立即截屏')}
          </button>
        </header>
        {screenshot
          ? <img src={screenshot} alt="Current desktop capture" />
          : <div className="screen-placeholder"><Icon name="monitor" size={40} /><p>{copy(language, 'Approve and capture the current screen. macOS may request Screen Recording permission.', '批准后截取当前屏幕，macOS 可能请求“屏幕与系统音频录制”权限。')}</p></div>}
      </section>

      <aside className="computer-control-panel">
        <div className="panel-title"><span>{copy(language, 'Next approved action', '下一项批准操作')}</span></div>

        <label>
          <span>{copy(language, 'Open application', '打开应用')}</span>
          <select value={application} onChange={(event) => setApplication(event.target.value)}>
            {APP_OPTIONS.map((option) => <option key={option.value} value={option.value}>{copy(language, option.en, option.zh)}</option>)}
          </select>
        </label>
        <button className="button secondary full" onClick={() => void execute('open')} disabled={busy}>
          <Icon name="external" />{busyAction === 'open' ? copy(language, 'Opening…', '正在打开…') : copy(language, 'Open application', '打开应用')}
        </button>

        <label><span>{copy(language, 'Pointer coordinates', '鼠标坐标')}</span><div className="inline-fields"><input type="number" value={x} onChange={(event) => setX(Number(event.target.value))} /><input type="number" value={y} onChange={(event) => setY(Number(event.target.value))} /></div></label>
        <button className="button secondary full" onClick={() => void execute('click')} disabled={busy}><Icon name="circle" />{copy(language, 'Click coordinate', '点击坐标')}</button>

        <label><span>{copy(language, 'Text to type', '输入文字')}</span><textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} placeholder={copy(language, 'Text is typed into the currently focused app.', '文字将输入到当前获得焦点的应用中。')} /></label>
        <button className="button secondary full" onClick={() => void execute('type')} disabled={busy || !text.trim()}><Icon name="edit" />{copy(language, 'Type text', '输入文字')}</button>

        <label><span>{copy(language, 'Approved key', '批准按键')}</span><select value={key} onChange={(event) => setKey(event.target.value)}><option value="enter">Enter</option><option value="escape">Escape</option><option value="tab">Tab</option><option value="space">Space</option><option value="delete">Delete</option><option value="cmd+n">⌘N</option><option value="cmd+s">⌘S</option><option value="cmd+l">⌘L</option></select></label>
        <button className="button secondary full" onClick={() => void execute('key')} disabled={busy}><Icon name="command" />{copy(language, 'Press key', '执行按键')}</button>

        <label className="critical-approval">
          <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} disabled={busy} />
          <span><strong>{copy(language, 'I reviewed this single action', '我已审查这一项操作')}</strong><small>{copy(language, 'Approval resets after every action.', '每次操作后批准状态都会重置。')}</small></span>
        </label>
      </aside>

      <aside className="audit-panel">
        <div className="panel-title"><span>{copy(language, 'Local audit log', '本地审计日志')}</span><button onClick={() => { clearComputerAudit(); setAudit([]); }}>{copy(language, 'Clear', '清空')}</button></div>
        {audit.length
          ? audit.slice(0, 50).map((entry) => <article key={entry.id} className={entry.ok ? 'ok' : 'failed'}><span>{entry.ok ? '✓' : '!'}</span><div><strong>{entry.action}</strong><p>{entry.detail}</p><small>{new Date(entry.createdAt).toLocaleString()}</small></div></article>)
          : <div className="file-empty-small"><Icon name="shield" /><p>{copy(language, 'Approved desktop actions will appear here.', '已批准的桌面操作会显示在这里。')}</p></div>}
      </aside>
    </div>
  </main>;
}
