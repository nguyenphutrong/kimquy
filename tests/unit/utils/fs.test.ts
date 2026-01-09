import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  fileExists,
  dirExists,
  ensureDir,
  readTextFile,
  writeTextFile,
  readJson,
  writeJson,
  getKimQuyDir,
  getConfigPath,
} from '../../../src/utils/fs.ts';
import { FileSystemError } from '../../../src/utils/errors.ts';

describe('File System Utils', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `kq-fs-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('fileExists', () => {
    test('returns true for existing file', () => {
      const filePath = join(testDir, 'test.txt');
      writeFileSync(filePath, 'content');
      expect(fileExists(filePath)).toBe(true);
    });

    test('returns false for non-existing file', () => {
      expect(fileExists(join(testDir, 'nonexistent.txt'))).toBe(false);
    });

    test('returns false for directory', () => {
      expect(fileExists(testDir)).toBe(false);
    });
  });

  describe('dirExists', () => {
    test('returns true for existing directory', () => {
      expect(dirExists(testDir)).toBe(true);
    });

    test('returns false for non-existing directory', () => {
      expect(dirExists(join(testDir, 'nonexistent'))).toBe(false);
    });

    test('returns false for file', () => {
      const filePath = join(testDir, 'test.txt');
      writeFileSync(filePath, 'content');
      expect(dirExists(filePath)).toBe(false);
    });
  });

  describe('ensureDir', () => {
    test('creates directory if not exists', () => {
      const newDir = join(testDir, 'new', 'nested', 'dir');
      ensureDir(newDir);
      expect(existsSync(newDir)).toBe(true);
    });

    test('does nothing if directory exists', () => {
      ensureDir(testDir);
      expect(existsSync(testDir)).toBe(true);
    });
  });

  describe('readTextFile / writeTextFile', () => {
    test('writes and reads text file', () => {
      const filePath = join(testDir, 'text.txt');
      writeTextFile(filePath, 'Hello, World!');
      expect(readTextFile(filePath)).toBe('Hello, World!');
    });

    test('throws FileSystemError for non-existing file', () => {
      expect(() => readTextFile(join(testDir, 'nonexistent.txt'))).toThrow(FileSystemError);
    });
  });

  describe('readJson / writeJson', () => {
    test('writes and reads JSON', () => {
      const filePath = join(testDir, 'data.json');
      const data = { name: 'test', count: 42 };
      writeJson(filePath, data);
      const result = readJson<typeof data>(filePath);
      expect(result.name).toBe('test');
      expect(result.count).toBe(42);
    });

    test('throws FileSystemError for invalid JSON', () => {
      const filePath = join(testDir, 'invalid.json');
      writeFileSync(filePath, 'not valid json');
      expect(() => readJson(filePath)).toThrow(FileSystemError);
    });
  });

  describe('path helpers', () => {
    test('getKimQuyDir returns .kimquy path', () => {
      expect(getKimQuyDir('/project')).toBe(join('/project', '.kimquy'));
    });

    test('getConfigPath returns config path', () => {
      expect(getConfigPath('/project')).toBe(join('/project', 'kimquy.config.ts'));
    });
  });
});
