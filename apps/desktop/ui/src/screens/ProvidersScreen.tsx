import { useEffect, useState } from 'react';
import type { Language, ProviderConfig, ProviderStatus } from '../app/types';
import {
  clearProviderCredentials,
  loadProviderConfig,
  loadProviderStatus,
  loadSettings,
  nowIso,
  saveProviderConfig,
  saveProviderStatus,
} from '../app/store';
import { testDeepSeekConnection } from '../features/providers/providerClient';
import { deleteProviderSecret, saveProviderSecret } from '../features/platform/desktopClient';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

export function ProvidersScreen({ language, onDone }: { language: Language; onDone: () => void }) {
  const [config, setConfig] = useState<ProviderConfig>(() => loadProviderConfig());
  const [status, setStatus] = useState<ProviderStatus>(() => loadProviderStatus());
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const sync = () => {
      setConfig(loadProviderConfig());
      setStatus(loadProviderStatus());
    };
    window.addEventListener('tokenfence:provider-updated', sync);
    return () => window.removeEventListener('tokenfence:provider-updated', sync);
  }, []);

  const persist = async (): Promise<ProviderConfig | null> => {
    const typedKey = config.apiKey.trim();
    let credentialStored = config.credentialStored;

    if (typedKey) {
      const result = await saveProviderSecret(typedKey);
      if (!result.ok) {
        toast.show(
          copy(language, result.message ?? 'Could not save the API key securely.', `无法安全保存 API Key：${result.message ?? '系统凭证库不可用。'}`),
          'error',
        );
        return null;
      }
      credentialStored = true;
    }

    const next: ProviderConfig = {
      ...config,
      apiKey: '',
      credentialStored,
    };
    saveProviderConfig(next);
    setConfig(next);
    return next;
  };

  const save = async () => {
    setBusy(true);
    const next = await persist();
    setBusy(false);
    if (!next) return;
    const nextStatus: ProviderStatus = next.credentialStored ? { state: 'configured' } : { state: 'not-configured' };
    saveProviderStatus(nextStatus);
    setStatus(nextStatus);
    toast.show(
      next.credentialStored
        ? copy(language, 'Provider settings saved. The API key is in the operating-system credential store.', 'Provider 设置已保存，API Key 已写入系统凭证库。')
        : copy(language, 'Provider settings saved without an API key.', 'Provider 设置已保存，但尚未配置 API Key。'),
      'success',
    );
  };

  const test = async () => {
    if (!config.apiKey.trim() && !config.credentialStored) {
      toast.show(copy(language, 'Enter a DeepSeek API key first.', '请先填写 DeepSeek API Key。'), 'warning');
      return;
    }
    setBusy(true);
    const nextConfig = await persist();
    if (!nextConfig) {
      setBusy(false);
      return;
    }
    const result = await testDeepSeekConnection(nextConfig, loadSettings().requestTimeoutMs);
    const nextStatus: ProviderStatus = result.ok
      ? {
          state: 'connected',
          checkedAt: nowIso(),
          latencyMs: result.latencyMs,
          model: result.model ?? nextConfig.model,
          message: 'Connection verified',
        }
      : {
          state: 'error',
          checkedAt: nowIso(),
          message: result.errorMessage ?? 'Connection failed',
        };
    saveProviderStatus(nextStatus);
    setStatus(nextStatus);
    setBusy(false);
    toast.show(
      result.ok
        ? copy(language, 'DeepSeek connection verified.', 'DeepSeek 连接验证成功。')
        : copy(language, nextStatus.message ?? 'Connection failed.', `连接失败：${nextStatus.message ?? '请检查网络和 Key。'}`),
      result.ok ? 'success' : 'error',
    );
  };

  const clear = async () => {
    if (!window.confirm(copy(language, 'Clear the saved API credential?', '确定清除已保存的 API 凭证吗？'))) return;
    setBusy(true);
    const result = await deleteProviderSecret();
    if (!result.ok) {
      setBusy(false);
      toast.show(copy(language, result.message ?? 'Could not clear the credential.', `无法清除凭证：${result.message ?? '系统凭证库不可用。'}`), 'error');
      return;
    }
    clearProviderCredentials();
    setConfig(loadProviderConfig());
    setStatus({ state: 'not-configured' });
    setBusy(false);
    toast.show(copy(language, 'Credential cleared from the operating-system credential store.', '凭证已从系统凭证库中清除。'), 'success');
  };

  const stateLabel = {
    'not-configured': copy(language, 'Not configured', '未配置'),
    configured: copy(language, 'Configured — test required', '已配置—需要测试'),
    connected: copy(language, 'Connected', '已连接'),
    error: copy(language, 'Connection failed', '连接失败'),
  }[status.state];

  return (
    <main className="page-scroll">
      <div className="page-header">
        <div>
          <span className="eyebrow">AI PROVIDER</span>
          <h1>{copy(language, 'Connect DeepSeek', '连接 DeepSeek')}</h1>
          <p>{copy(language, 'Provider requests leave the renderer through the Tauri desktop backend, not a browser fetch.', 'Provider 请求通过 Tauri 桌面后端发出，不再由浏览器前端直连。')}</p>
        </div>
        <div className={`status-pill status-${status.state}`}><span />{stateLabel}</div>
      </div>

      <section className="provider-card">
        <div className="provider-card-head">
          <div className="provider-logo">DS</div>
          <div>
            <h2>DeepSeek</h2>
            <p>https://api.deepseek.com/chat/completions</p>
          </div>
          <div className="provider-state-detail">
            {status.checkedAt && <small>{copy(language, 'Last checked', '上次检测')} {new Date(status.checkedAt).toLocaleString()}</small>}
            {status.latencyMs != null && <strong>{status.latencyMs} ms</strong>}
          </div>
        </div>

        <div className="form-grid">
          <label className="field field-wide">
            <span>API Key</span>
            <div className="input-with-action">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(event) => setConfig({ ...config, apiKey: event.target.value })}
                autoComplete="off"
                spellCheck={false}
                placeholder={config.credentialStored ? copy(language, 'Stored securely — type to replace', '已安全保存—输入新 Key 可替换') : 'sk-…'}
              />
              <button type="button" className="icon-button" onClick={() => setShowKey((value) => !value)} aria-label="Toggle API key visibility">
                <Icon name={showKey ? 'eyeOff' : 'eye'} />
              </button>
            </div>
          </label>

          <label className="field">
            <span>{copy(language, 'Model', '模型')}</span>
            <select value={config.model} onChange={(event) => setConfig({ ...config, model: event.target.value })}>
              <option value="deepseek-v4-flash">deepseek-v4-flash</option>
              <option value="deepseek-v4-pro">deepseek-v4-pro</option>
            </select>
          </label>

          <label className="field">
            <span>{copy(language, 'Endpoint', '接口地址')}</span>
            <input value={config.baseUrl} disabled />
          </label>

          <label className="toggle-row field-wide">
            <input
              type="checkbox"
              checked={config.demoMode}
              onChange={(event) => setConfig({ ...config, demoMode: event.target.checked })}
            />
            <span>
              <strong>{copy(language, 'Local demo mode', '本地演示模式')}</strong>
              <small>{copy(language, 'Generate a local safety demonstration without contacting DeepSeek.', '不连接 DeepSeek，仅在本地生成安全流程演示回复。')}</small>
            </span>
          </label>
        </div>

        {status.state === 'error' && <div className="inline-alert error"><Icon name="alert" />{status.message}</div>}

        <div className="privacy-note">
          <Icon name="lock" />
          <div>
            <strong>{copy(language, 'Protected by the operating system', '由操作系统安全保护')}</strong>
            <p>{copy(language, 'On macOS, the key is stored in Keychain. On Windows, it uses Credential Manager. It is never written to browser localStorage.', 'macOS 使用“钥匙串”，Windows 使用“凭据管理器”；API Key 不再写入浏览器 localStorage。')}</p>
          </div>
        </div>

        <div className="button-row">
          <button className="button secondary" onClick={save} disabled={busy}>{copy(language, 'Save securely', '安全保存')}</button>
          <button className="button primary" onClick={test} disabled={busy}>{busy ? copy(language, 'Working…', '处理中…') : copy(language, 'Test connection', '测试连接')}</button>
          <button className="button ghost danger" onClick={clear} disabled={busy}>{copy(language, 'Clear credential', '清除凭证')}</button>
          {(status.state === 'connected' || config.demoMode) && <button className="button ghost push-right" onClick={onDone}>{copy(language, 'Return to workspace', '返回工作台')} <Icon name="chevron" size={16} /></button>}
        </div>
      </section>
    </main>
  );
}
