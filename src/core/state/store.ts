import { chmodSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { logger } from '../../utils/logger.ts';
import { ensureDir, fileExists, getKimQuyDir, readJson } from '../../utils/fs.ts';

const STATE_VERSION = '1.0.0';
const STATE_FILE_NAME = 'state.json';

const adapterStateSchema = z.object({
  generatedAt: z.string().nullable(),
  files: z.array(z.string()).default([]),
});

const stateSchema = z.object({
  currentProfile: z.string().nullable(),
  lastScanAt: z.string().nullable(),
  adapters: z.record(z.string(), adapterStateSchema).default({}),
  version: z.string().default(STATE_VERSION),
});

export type AdapterState = z.infer<typeof adapterStateSchema>;
export type AppState = z.infer<typeof stateSchema>;

function getDefaultState(): AppState {
  return {
    currentProfile: null,
    lastScanAt: null,
    adapters: {},
    version: STATE_VERSION,
  };
}

function getStatePath(cwd?: string): string {
  return join(getKimQuyDir(cwd), STATE_FILE_NAME);
}

function atomicWriteJson(filePath: string, data: unknown): void {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const content = JSON.stringify(data, null, 2);

  writeFileSync(tempPath, `${content}\n`, { encoding: 'utf-8', mode: 0o600 });

  try {
    chmodSync(tempPath, 0o600);
  } catch {
    // Ignore chmod errors on platforms that don't support it
  }

  renameSync(tempPath, filePath);
}

export function getState(cwd?: string): AppState {
  const statePath = getStatePath(cwd);

  if (!fileExists(statePath)) {
    return getDefaultState();
  }

  try {
    const data = readJson<unknown>(statePath);
    const result = stateSchema.safeParse(data);

    if (!result.success) {
      logger.warn('Corrupted state file detected, resetting to defaults');
      logger.debug(`Validation errors: ${result.error.message}`);
      return getDefaultState();
    }

    return result.data;
  } catch (error) {
    logger.warn('Failed to read state file, using defaults');
    if (error instanceof Error) {
      logger.debug(error.message);
    }
    return getDefaultState();
  }
}

export function setState(updates: Partial<AppState>, cwd?: string): void {
  const stateDir = getKimQuyDir(cwd);
  const statePath = getStatePath(cwd);

  ensureDir(stateDir);

  const current = getState(cwd);
  const newState: AppState = {
    ...current,
    ...updates,
    version: STATE_VERSION,
  };

  atomicWriteJson(statePath, newState);
}

export function setCurrentProfile(profile: string | null, cwd?: string): void {
  setState({ currentProfile: profile }, cwd);
}

export function getCurrentProfile(cwd?: string): string | null {
  return getState(cwd).currentProfile;
}

export function setLastScanAt(timestamp: Date, cwd?: string): void {
  setState({ lastScanAt: timestamp.toISOString() }, cwd);
}

export function getLastScanAt(cwd?: string): Date | null {
  const state = getState(cwd);
  return state.lastScanAt ? new Date(state.lastScanAt) : null;
}

export function setAdapterState(
  adapterName: string,
  adapterState: AdapterState,
  cwd?: string
): void {
  const current = getState(cwd);
  setState(
    {
      adapters: {
        ...current.adapters,
        [adapterName]: adapterState,
      },
    },
    cwd
  );
}

export function getAdapterState(adapterName: string, cwd?: string): AdapterState | null {
  const state = getState(cwd);
  return state.adapters[adapterName] ?? null;
}

export class StateStore {
  private cwd: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
  }

  getState(): AppState {
    return getState(this.cwd);
  }

  setState(updates: Partial<AppState>): void {
    setState(updates, this.cwd);
  }

  getCurrentProfile(): string | null {
    return getCurrentProfile(this.cwd);
  }

  setCurrentProfile(profile: string | null): void {
    setCurrentProfile(profile, this.cwd);
  }

  getLastScanAt(): Date | null {
    return getLastScanAt(this.cwd);
  }

  setLastScanAt(timestamp: Date): void {
    setLastScanAt(timestamp, this.cwd);
  }
}
