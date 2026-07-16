import { useRef, useState } from 'react';
import type { AttachmentDraft, Language } from '../app/types';
import { loadSettings } from '../app/store';
import { processFile } from '../features/files/fileProcessor';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';

const copy = (language: Language, en: string, zh: string) => language === 'zh-CN' ? zh : en;

const processors = [
  { id: 'pdf', icon: 'fileText', name: 'PDF Extractor', formats: 'PDF', noteEn: 'Embedded text with page markers', noteZh: '提取嵌入文本并保留页码标记' },
  { id: 'ocr', icon: 'scanText', name: 'Local OCR', formats: 'PNG · JPG · WEBP', noteEn: 'Tesseract local recognition', noteZh: 'Tesseract 本地文字识别' },
  { id: 'docx', icon: 'file', name: 'Document Reader', formats: 'DOCX', noteEn: 'Raw text extraction', noteZh: '提取文档原始文本' },
  { id: 'sheet', icon: 'table', name: 'Sheet Reader', formats: 'XLSX · XLS', noteEn: 'Every sheet converted to CSV context', noteZh: '每个工作表转换为 CSV 上下文' },
  { id: 'code', icon: 'code', name: 'Code Reader', formats: 'TS · PY · RS · more', noteEn: 'Language-aware file classification', noteZh: '按代码语言分类文件' },
] as const;

export function FilesScreen({ language, onUseInWorkspace }: { language: Language; onUseInWorkspace: () => void }) {
  const [files, setFiles] = useState<AttachmentDraft[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const input = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const active = files.find((file) => file.id === activeId) ?? files[0];

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    const next: AttachmentDraft[] = [];
    for (const file of Array.from(list)) {
      try { next.push(await processFile(file, loadSettings().maxFileScanSize, setProgress)); }
      catch (error) { toast.show(error instanceof Error ? error.message : copy(language, 'File processing failed.', '文件处理失败。'), 'error'); }
    }
    setFiles((current) => [...current, ...next]);
    if (next[0]) setActiveId(next[0].id);
    setBusy(false); setProgress(0);
  };

  return <main className="modern-page files-page">
    <header className="compact-page-header"><div><span className="section-kicker">CONTEXT PIPELINE</span><h1>{copy(language, 'Local file processors', '本地文件处理')}</h1><p>{copy(language, 'Extract, classify and inspect files before they enter model context.', '在文件进入模型上下文前完成提取、分类与检查。')}</p></div><div className="header-actions"><button className="button primary" onClick={() => input.current?.click()}><Icon name="plus" />{copy(language, 'Add files', '添加文件')}</button><button className="button secondary" onClick={onUseInWorkspace}><Icon name="workspace" />{copy(language, 'Open workspace', '进入工作台')}</button></div></header>
    <input ref={input} hidden type="file" multiple accept=".txt,.md,.json,.csv,.log,.xml,.yaml,.yml,.js,.jsx,.ts,.tsx,.py,.rs,.go,.java,.html,.css,.pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.webp" onChange={(event) => { void add(event.target.files); event.currentTarget.value = ''; }} />
    <section className="processor-grid">{processors.map((processor) => <article key={processor.id}><span><Icon name={processor.icon} /></span><div><strong>{processor.name}</strong><small>{processor.formats}</small><p>{copy(language, processor.noteEn, processor.noteZh)}</p></div><em>{copy(language, 'Built in', '内置')}</em></article>)}</section>
    {busy && <div className="processing-banner"><Icon name="cpu" /><div><strong>{copy(language, 'Processing locally', '正在本地处理')}</strong><div><span style={{ width: `${Math.max(6, progress * 100)}%` }} /></div></div></div>}
    <div className="file-workbench">
      <aside><div className="panel-title"><span>{copy(language, 'Processed files', '已处理文件')}</span><small>{files.length}</small></div>{files.length ? files.map((file) => <button key={file.id} className={active?.id === file.id ? 'selected' : ''} onClick={() => setActiveId(file.id)}><Icon name={file.kind === 'image' ? 'image' : file.kind === 'spreadsheet' ? 'table' : file.kind === 'code' ? 'code' : 'file'} /><span><strong>{file.name}</strong><small>{file.processor} · {Math.ceil(file.content.length / 4)} tokens</small></span></button>) : <div className="file-empty-small"><Icon name="folder" /><p>{copy(language, 'Add a supported file to test the local pipeline.', '添加支持的文件来测试本地处理链路。')}</p></div>}</aside>
      <section>{active ? <><header><div><span className="file-kind-pill">{active.kind}</span><h2>{active.name}</h2><p>{active.processor} · {(active.size / 1024).toFixed(1)} KB {active.pageCount ? `· ${active.pageCount} pages` : ''}</p></div><button className="icon-button danger" onClick={() => { setFiles((current) => current.filter((file) => file.id !== active.id)); setActiveId(null); }}><Icon name="trash" /></button></header>{active.warnings?.map((warning) => <div className="inline-alert warning" key={warning}><Icon name="alert" />{warning}</div>)}<pre className="file-preview">{active.content || copy(language, 'No text extracted.', '未提取到文本。')}</pre></> : <div className="file-preview-empty"><Icon name="fileText" size={34} /><h2>{copy(language, 'Preview extracted context', '预览提取后的上下文')}</h2><p>{copy(language, 'The original file stays on your device. Only the reviewed extracted text can be sent to a provider.', '原文件保留在你的设备上，只有经过审查的提取文本才可发送给模型。')}</p></div>}</section>
    </div>
  </main>;
}
