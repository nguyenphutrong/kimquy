import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function readFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
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

export const CONFIG_FILE_NAME = 'kimquy.config.ts';
export const STATE_DIR_NAME = '.kimquy';
