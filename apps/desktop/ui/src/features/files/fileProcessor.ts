import type { AttachmentDraft, FileKind, ProcessorId } from '../../app/types';
import { makeId } from '../../app/store';

const CODE_EXTENSIONS = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'java', 'kt', 'swift', 'c', 'cc', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'sh', 'zsh', 'fish', 'sql', 'html', 'css', 'scss', 'vue', 'svelte', 'toml', 'ini', 'env']);
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'json', 'jsonl', 'csv', 'log', 'xml', 'yaml', 'yml', 'rtf']);
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff']);

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function classifyFile(file: Pick<File, 'name' | 'type'>): FileKind {
  const ext = extension(file.name);
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) return 'text';
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (['docx', 'doc'].includes(ext)) return 'document';
  if (['xlsx', 'xls', 'ods'].includes(ext)) return 'spreadsheet';
  if (IMAGE_EXTENSIONS.has(ext) || file.type.startsWith('image/')) return 'image';
  return 'unknown';
}

async function readPdf(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let index = 1; index <= document.numPages; index += 1) {
    const page = await document.getPage(index);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(`[Page ${index}]\n${text}`);
  }
  return { text: pages.join('\n\n'), pages: document.numPages };
}

async function readDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

function csvValue(value: unknown): string {
  if (value == null) return '';
  const normalized = typeof value === 'object' && value && 'text' in value
    ? String((value as { text?: unknown }).text ?? '')
    : value instanceof Date
      ? value.toISOString()
      : String(value);
  return /[\n\r,"]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

async function readSheet(file: File): Promise<string> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer() as never);
  const sections: string[] = [];
  workbook.eachSheet((sheet) => {
    const rows: string[] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      rows.push(values.map(csvValue).join(','));
    });
    sections.push(`# Sheet: ${sheet.name}\n${rows.join('\n')}`);
  });
  return sections.join('\n\n');
}

async function readOcr(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text' && typeof message.progress === 'number') onProgress?.(message.progress);
    },
  });
  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}

function processorFor(kind: FileKind): ProcessorId {
  if (kind === 'pdf') return 'pdf-extractor';
  if (kind === 'document') return 'docx-reader';
  if (kind === 'spreadsheet') return 'sheet-reader';
  if (kind === 'image') return 'local-ocr';
  return 'text-reader';
}

export async function processFile(file: File, maxBytes: number, onProgress?: (progress: number) => void): Promise<AttachmentDraft> {
  if (file.size > maxBytes) throw new Error(`File exceeds the configured ${Math.round(maxBytes / 1_000_000)} MB processing limit.`);
  const kind = classifyFile(file);
  let content = '';
  let pageCount: number | undefined;
  const warnings: string[] = [];

  if (kind === 'text' || kind === 'code') content = await file.text();
  else if (kind === 'pdf') {
    const result = await readPdf(file);
    content = result.text;
    pageCount = result.pages;
    if (!content.trim()) warnings.push('No embedded text was found. Try OCR on page images in a future release.');
  } else if (kind === 'document') content = await readDocx(file);
  else if (kind === 'spreadsheet') content = await readSheet(file);
  else if (kind === 'image') {
    content = await readOcr(file, onProgress);
    warnings.push('Local OCR currently starts with the English language pack. Additional packs can be added later.');
  } else {
    throw new Error('This file type is not supported by the local processor yet.');
  }

  return {
    id: makeId('attachment'),
    name: file.name,
    size: file.size,
    content: content.slice(0, 1_500_000),
    kind,
    processor: processorFor(kind),
    mimeType: file.type,
    pageCount,
    warnings,
  };
}
