import { invoke } from '@tauri-apps/api/tauri';
import type { ChatMessage, ProviderConfig } from '../../app/types';
import { loadProviderSecret } from '../platform/desktopClient';

export interface ProviderReply {
  ok: boolean;
  status: number;
  content?: string;
  model?: string;
  errorCode?: string;
  errorMessage?: string;
  latencyMs: number;
}

interface ProviderRuntimeConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

async function runtimeConfig(config: ProviderConfig, timeoutMs: number): Promise<ProviderRuntimeConfig> {
  const apiKey = config.apiKey.trim() || await loadProviderSecret();
  return {
    apiKey,
    model: config.model.trim(),
    baseUrl: config.baseUrl.trim(),
    timeoutMs,
  };
}

function safeFailure(error: unknown): ProviderReply {
  const message = error instanceof Error ? error.message : String(error);
  const isDesktopRuntimeError = /__TAURI__|invoke|not a function|window/i.test(message);
  return {
    ok: false,
    status: 0,
    errorCode: isDesktopRuntimeError ? 'DESKTOP_RUNTIME_REQUIRED' : 'CLIENT_ERROR',
    errorMessage: isDesktopRuntimeError
      ? 'Provider requests must run inside the TokenFence desktop app.'
      : 'The provider request could not be started.',
    latencyMs: 0,
  };
}

function missingCredential(): ProviderReply {
  return {
    ok: false,
    status: 0,
    errorCode: 'INVALID_CREDENTIAL',
    errorMessage: 'No DeepSeek API key is stored in the operating-system credential store.',
    latencyMs: 0,
  };
}

export async function testDeepSeekConnection(
  config: ProviderConfig,
  timeoutMs: number,
): Promise<ProviderReply> {
  try {
    const resolved = await runtimeConfig(config, timeoutMs);
    if (!resolved.apiKey) return missingCredential();
    return await invoke<ProviderReply>('provider_connection_test', { config: resolved });
  } catch (error) {
    return safeFailure(error);
  }
}

export async function sendDeepSeekChat(
  config: ProviderConfig,
  messages: ChatMessage[],
  timeoutMs: number,
): Promise<ProviderReply> {
  try {
    const resolved = await runtimeConfig(config, timeoutMs);
    if (!resolved.apiKey) return missingCredential();
    return await invoke<ProviderReply>('provider_chat', {
      request: {
        config: resolved,
        messages: messages.map(({ role, content }) => ({ role, content })),
        maxTokens: 2048,
        temperature: 0.3,
      },
    });
  } catch (error) {
    return safeFailure(error);
  }
}
