import { useEffect, useState } from 'react';
import type { Language } from '../app/types';
import { getPlatformInfo, type PlatformInfo } from '../features/platform/desktopClient';
import { Icon } from '../components/Icon';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

const fallback: PlatformInfo = {
  appVersion: '1.6.1',
  os: 'Loading…',
  arch: 'Loading…',
  secureStore: 'Loading…',
  desktopRuntime: true,
};

export function AboutScreen({ language }: { language: Language }) {
  const [platform, setPlatform] = useState<PlatformInfo>(fallback);

  useEffect(() => {
    void getPlatformInfo().then(setPlatform);
  }, []);

  return (
    <main className="page-scroll about-page">
      <section className="about-hero">
        <div className="brand-mark large"><Icon name="shield" size={32} /></div>
        <span className="eyebrow">TOKENFENCE STUDIO {platform.appVersion}</span>
        <h1>Safe AI Workspace</h1>
        <p>{copy(language, 'A local-first safety layer between your data and AI models.', '位于你的数据与 AI 模型之间的一道本地优先安全防线。')}</p>
      </section>
      <section className="about-grid">
        <article><Icon name="shield" /><h2>{copy(language, 'Review before send', '发送前审查')}</h2><p>{copy(language, 'Prompts and supported text files are scanned together before any provider request is approved.', '提示词与支持的文本文件会在 Provider 请求获批前统一扫描。')}</p></article>
        <article><Icon name="lock" /><h2>{copy(language, 'Native credential protection', '系统级凭证保护')}</h2><p>{copy(language, 'The macOS build stores API credentials in Keychain instead of browser localStorage.', 'macOS 版本将 API 凭证保存在“钥匙串”中，不再写入浏览器 localStorage。')}</p></article>
        <article><Icon name="server" /><h2>{copy(language, 'Explicit destination', '明确发送目标')}</h2><p>{copy(language, 'The selected Provider, model and connection state remain visible before every send.', '每次发送前都会明确展示 Provider、模型与连接状态。')}</p></article>
      </section>
      <section className="about-details">
        <div><span>{copy(language, 'Application version', '应用版本')}</span><strong>{platform.appVersion}</strong></div>
        <div><span>{copy(language, 'Platform', '平台')}</span><strong>{platform.os} · {platform.arch}</strong></div>
        <div><span>{copy(language, 'Credential protection', '凭证保护')}</span><strong>{platform.secureStore}</strong></div>
        <div><span>{copy(language, 'Runtime', '运行环境')}</span><strong>{platform.desktopRuntime ? 'React + TypeScript + Tauri' : 'Browser preview'}</strong></div>
        <div><span>{copy(language, 'Repository', '代码仓库')}</span><a href="https://github.com/Chrisbetheking/tokenfence-studio" target="_blank" rel="noreferrer">Chrisbetheking/tokenfence-studio</a></div>
        <div><span>License</span><strong>MIT</strong></div>
        <div><span>{copy(language, 'Report an issue', '反馈问题')}</span><a href="https://github.com/Chrisbetheking/tokenfence-studio/issues" target="_blank" rel="noreferrer">GitHub Issues</a></div>
      </section>
    </main>
  );
}
