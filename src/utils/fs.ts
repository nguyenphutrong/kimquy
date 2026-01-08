import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { FileSystemError } from './errors.ts';

export const CONFIG_FILE_NAME = 'kimquy.config.ts';
export const STATE_DIR_NAME = '.kimquy';

export function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

export function dirExists(dirPath: string): boolean {
  try {
    return statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function readTextFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileSystemError(`File not found: ${filePath}`, [
        'Check if the file path is correct',
        'Run "kq init" to create configuration files',
      ]);
    }
    throw new FileSystemError(`Failed to read file: ${filePath}`);
  }
}

export function writeTextFile(filePath: string, content: string): void {
  try {
    ensureDir(dirname(filePath));
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }
    throw new FileSystemError(`Failed to write file: ${filePath}`, [
      'Check if you have write permissions',
      'Verify the directory exists',
    ]);
  }
}

export function readJson<T>(filePath: string): T {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileSystemError(`File not found: ${filePath}`, [
        'Check if the file path is correct',
        'Run "kq init" to create configuration files',
      ]);
    }
    throw new FileSystemError(`Failed to read JSON file: ${filePath}`, [
      'Check if the file contains valid JSON',
    ]);
  }
}

export function writeJson<T>(filePath: string, data: T, pretty = true): void {
  try {
    ensureDir(dirname(filePath));
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    writeFileSync(filePath, `${content}\n`, 'utf-8');
  } catch (error) {
    if (error instanceof FileSystemError) {
      throw error;
    }
    throw new FileSystemError(`Failed to write JSON file: ${filePath}`, [
      'Check if you have write permissions',
    ]);
  }
}

export function findUpward(filename: string, startDir?: string): string | null {
  let currentDir = resolve(startDir || process.cwd());
  const root = dirname(currentDir);

  while (currentDir !== root) {
    const filePath = join(currentDir, filename);
    if (fileExists(filePath)) {
      return filePath;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  const filePath = join(currentDir, filename);
  if (fileExists(filePath)) {
    return filePath;
  }

  return null;
}

export function resolvePath(...paths: string[]): string {
  return resolve(...paths);
}

export function joinPath(...paths: string[]): string {
  return join(...paths);
}

export function getProjectRoot(): string {
  return process.cwd();
}

export function getKimQuyDir(baseDir?: string): string {
  return join(baseDir || process.cwd(), STATE_DIR_NAME);
}

export function getConfigPath(baseDir?: string): string {
  return join(baseDir || process.cwd(), CONFIG_FILE_NAME);
}
