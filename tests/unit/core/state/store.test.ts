import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getState,
  setCurrentProfile,
  getCurrentProfile,
  setLastScanAt,
} from '../../../../src/core/state/store.ts';
import { STATE_DIR_NAME } from '../../../../src/utils/fs.ts';

describe('State Store', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `kq-test-${Date.now()}`);
    mkdirSync(join(testDir, STATE_DIR_NAME), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test('getState returns default state when no state file exists', () => {
    const state = getState(testDir);
    expect(state.currentProfile).toBeNull();
    expect(state.lastScanAt).toBeNull();
  });

  test('setCurrentProfile updates state', () => {
    setCurrentProfile('work', testDir);
    const profile = getCurrentProfile(testDir);
    expect(profile).toBe('work');
  });

  test('setLastScanAt updates state', () => {
    const now = new Date();
    setLastScanAt(now, testDir);
    const state = getState(testDir);
    expect(state.lastScanAt).toBe(now.toISOString());
  });

  test('state persists across reads', () => {
    setCurrentProfile('test-profile', testDir);
    setLastScanAt(new Date('2025-01-01'), testDir);

    const state = getState(testDir);
    expect(state.currentProfile).toBe('test-profile');
    expect(state.lastScanAt).toBe('2025-01-01T00:00:00.000Z');
  });
});
