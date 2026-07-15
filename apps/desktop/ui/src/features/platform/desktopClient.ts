import { invoke } from '@tauri-apps/api/tauri';

export interface PlatformInfo {
  appVersion: string;
  os: string;
  arch: string;
  secureStore: string;
  desktopRuntime: boolean;
}

interface SecretReply {
  ok: boolean;
  hasValue: boolean;
  value?: string;
  errorMessage?: string;
}

export function isDesktopRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export async function getPlatformInfo(): Promise<PlatformInfo> {
  if (!isDesktopRuntime()) {
    return {
      appVersion: '1.6.1-web-preview',
      os: navigator.platform || 'browser',
      arch: 'browser',
      secureStore: 'Desktop runtime required',
      desktopRuntime: false,
    };
  }

  try {
    return await invoke<PlatformInfo>('platform_info');
  } catch {
    return {
      appVersion: '1.6.1',
      os: 'unknown',
      arch: 'unknown',
      secureStore: 'Unavailable',
      desktopRuntime: true,
    };
  }
}

export async function loadProviderSecret(): Promise<string> {
  if (!isDesktopRuntime()) return '';
  try {
    const result = await invoke<SecretReply>('provider_secret_load');
    return result.ok && result.hasValue ? result.value ?? '' : '';
  } catch {
    return '';
  }
}

export async function saveProviderSecret(secret: string): Promise<{ ok: boolean; message?: string }> {
  if (!isDesktopRuntime()) {
    return { ok: false, message: 'The operating-system credential store is only available in the desktop app.' };
  }
  try {
    const result = await invoke<SecretReply>('provider_secret_save', { secret });
    return { ok: result.ok, message: result.errorMessage };
  } catch {
    return { ok: false, message: 'The operating-system credential store could not be opened.' };
  }
}

export async function deleteProviderSecret(): Promise<{ ok: boolean; message?: string }> {
  if (!isDesktopRuntime()) return { ok: true };
  try {
    const result = await invoke<SecretReply>('provider_secret_delete');
    return { ok: result.ok, message: result.errorMessage };
  } catch {
    return { ok: false, message: 'The operating-system credential store could not be opened.' };
  }
}
