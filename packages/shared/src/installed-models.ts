/* ============================================================
   TokenFence Studio — Installed Models v1.2.3
   User-managed model library: add/remove/enable/disable
   Storage key: tokenfence.installedModels
   ============================================================ */

import { storeGet, storeSet } from "./agent-runtime/safeStorage";
import { MODEL_REGISTRY, type ModelRegistryItem, type ModelCapability } from "./model-registry";

export type InstalledModelSource = "registry" | "fetched" | "custom";

export interface InstalledModel {
  id: string;
  providerId: string;
  modelId: string;
  displayName: string;
  alias?: string;
  enabled: boolean;
  isDefault?: boolean;
  addedAt: number;
  lastUsedAt?: number;
  source: InstalledModelSource;
  customModelId?: string;
}

const STORAGE_KEY = "tokenfence.installedModels";

export function loadInstalledModels(): InstalledModel[] {
  try {
    const raw = storeGet(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInstalledModels(models: InstalledModel[]): void {
  try {
    storeSet(STORAGE_KEY, JSON.stringify(models));
  } catch { /* ignore */ }
}

export function installModel(
  providerId: string,
  modelId: string,
  source: InstalledModelSource = "registry",
  customModelId?: string,
): InstalledModel | null {
  const models = loadInstalledModels();

  // Prevent duplicate: same providerId + modelId
  if (source !== "custom") {
    const dup = models.find((m) => m.providerId === providerId && m.modelId === modelId);
    if (dup) return dup;
  } else {
    // Custom: allow duplicate if different customModelId
    const dup = models.find(
      (m) => m.providerId === providerId && m.modelId === modelId && m.customModelId === customModelId,
    );
    if (dup) return dup;
  }

  // Look up display name from registry
  let displayName = modelId;
  let alias: string | undefined;
  const reg = MODEL_REGISTRY.find((m) => m.providerId === providerId && m.modelId === modelId);
  if (reg) {
    displayName = reg.displayName;
    alias = reg.alias;
  }

  const installed: InstalledModel = {
    id: `${providerId}:${modelId}:${Date.now()}`,
    providerId,
    modelId,
    displayName,
    alias,
    enabled: true,
    isDefault: models.length === 0, // first model is default
    addedAt: Date.now(),
    source,
    customModelId,
  };

  models.push(installed);
  saveInstalledModels(models);
  return installed;
}

export function uninstallModel(id: string): void {
  const models = loadInstalledModels();
  const filtered = models.filter((m) => m.id !== id);
  saveInstalledModels(filtered);
}

export function toggleModel(id: string): void {
  const models = loadInstalledModels();
  const m = models.find((x) => x.id === id);
  if (m) {
    m.enabled = !m.enabled;
    saveInstalledModels(models);
  }
}

export function setDefaultModel(id: string): void {
  const models = loadInstalledModels();
  let found = false;
  for (const m of models) {
    if (m.id === id) { m.isDefault = true; found = true; }
    else m.isDefault = false;
  }
  if (found) saveInstalledModels(models);
}

export function updateModelAlias(id: string, alias: string): void {
  const models = loadInstalledModels();
  const m = models.find((x) => x.id === id);
  if (m) {
    m.alias = alias || undefined;
    saveInstalledModels(models);
  }
}

export function markModelUsed(id: string): void {
  const models = loadInstalledModels();
  const m = models.find((x) => x.id === id);
  if (m) {
    m.lastUsedAt = Date.now();
    saveInstalledModels(models);
  }
}

export function getEnabledModels(): InstalledModel[] {
  return loadInstalledModels().filter((m) => m.enabled);
}

export function getDefaultModel(): InstalledModel | undefined {
  const models = loadInstalledModels();
  return models.find((m) => m.isDefault && m.enabled) ?? models.find((m) => m.enabled);
}

export function getModelsForProvider(providerId: string): InstalledModel[] {
  return loadInstalledModels().filter((m) => m.providerId === providerId);
}

// Migration: old key → new key (one-time)
export function migrateInstalledModels(): void {
  try {
    const oldValue = storeGet("tokenfence-installed-models");
    const newValue = storeGet(STORAGE_KEY);
    if (!newValue && oldValue) {
      storeSet(STORAGE_KEY, oldValue);
    }
  } catch { /* ignore */ }
}
