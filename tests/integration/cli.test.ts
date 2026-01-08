import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { $ } from 'bun';

const CLI_PATH = join(import.meta.dir, '../../src/index.ts');

async function runCli(
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const result = await $`bun run ${CLI_PATH} ${args}`.cwd(cwd).quiet();
    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      exitCode: result.exitCode,
    };
  } catch (error: unknown) {
    const e = error as { stdout?: Buffer; stderr?: Buffer; exitCode?: number };
    return {
      stdout: e.stdout?.toString() ?? '',
      stderr: e.stderr?.toString() ?? '',
      exitCode: e.exitCode ?? 1,
    };
  }
}

describe('CLI Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `kq-cli-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('kq init', () => {
    test('creates config and .kimquy directory', async () => {
      const result = await runCli(['init', '--profile=test'], testDir);

      expect(result.exitCode).toBe(0);
      expect(existsSync(join(testDir, 'kimquy.config.ts'))).toBe(true);
      expect(existsSync(join(testDir, '.kimquy'))).toBe(true);
      expect(existsSync(join(testDir, '.kimquy', 'state.json'))).toBe(true);
    });

    test('refuses to init if already initialized', async () => {
      await runCli(['init', '--profile=test'], testDir);
      const result = await runCli(['init', '--profile=test'], testDir);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('--force');
    });

    test('init --force overwrites existing config', async () => {
      await runCli(['init', '--profile=first'], testDir);
      const result = await runCli(['init', '--profile=second', '--force'], testDir);

      expect(result.exitCode).toBe(0);
    });
  });

  describe('kq use', () => {
    test('switches to existing profile', async () => {
      await runCli(['init', '--profile=default'], testDir);
      const result = await runCli(['use', 'default'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('default');
    });

    test('fails for non-existent profile', async () => {
      await runCli(['init', '--profile=default'], testDir);
      const result = await runCli(['use', 'nonexistent'], testDir);

      expect(result.exitCode).toBe(1);
    });
  });

  describe('kq scan', () => {
    test('scans and finds skills', async () => {
      await runCli(['init', '--profile=default'], testDir);

      const skillDir = join(testDir, 'skills');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(
        join(skillDir, 'SKILL.md'),
        `---
name: Test Skill
---

# Test Content`
      );

      const result = await runCli(['scan'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('1');
    });

    test('reports no skills when none exist', async () => {
      await runCli(['init', '--profile=default'], testDir);
      const result = await runCli(['scan'], testDir);

      expect(result.stdout).toContain('--dir');
    });
  });

  describe('kq status', () => {
    test('shows status for initialized project', async () => {
      await runCli(['init', '--profile=default'], testDir);
      const result = await runCli(['status'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Initialized');
      expect(result.stdout).toContain('default');
    });

    test('shows not initialized for empty directory', async () => {
      const result = await runCli(['status'], testDir);

      expect(result.stdout).toContain('Initialized');
      expect(result.stdout).toContain('No');
    });
  });

  describe('kq doctor', () => {
    test('all checks pass for valid project', async () => {
      await runCli(['init', '--profile=default'], testDir);
      const result = await runCli(['doctor'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('checks passed');
    });
  });

  describe('kq --version', () => {
    test('shows version', async () => {
      const result = await runCli(['--version'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('kq --help', () => {
    test('shows help', async () => {
      const result = await runCli(['--help'], testDir);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('kq');
      expect(result.stdout).toContain('Commands');
    });
  });
});
