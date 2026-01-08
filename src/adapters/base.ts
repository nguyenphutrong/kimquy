import { dirname } from 'node:path';
import { copyFileSync, existsSync, unlinkSync } from 'node:fs';
import type { Skill } from '../core/skill/types.ts';
import type { KimQuyConfig } from '../core/config/schema.ts';
import { ensureDir, writeTextFile } from '../utils/fs.ts';

export interface AdapterContext {
  profileName: string;
  skills: Skill[];
  config: KimQuyConfig;
  outputDir: string;
  dryRun?: boolean;
}

export interface GeneratedFile {
  path: string;
  action: 'created' | 'updated' | 'unchanged';
  backupPath?: string;
}

export interface AdapterResult {
  success: boolean;
  files: GeneratedFile[];
  errors: string[];
}

export interface ValidationIssue {
  file: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export abstract class BaseAdapter {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly description: string;

  abstract generate(context: AdapterContext): Promise<AdapterResult>;

  async validate(_context: AdapterContext): Promise<ValidationResult> {
    return { valid: true, issues: [] };
  }

  async clean(_context: AdapterContext): Promise<string[]> {
    return [];
  }

  protected writeFile(filePath: string, content: string, dryRun = false): GeneratedFile {
    const existed = existsSync(filePath);

    if (dryRun) {
      return {
        path: filePath,
        action: existed ? 'updated' : 'created',
      };
    }

    let backupPath: string | undefined;
    if (existed) {
      backupPath = `${filePath}.backup`;
      copyFileSync(filePath, backupPath);
    }

    ensureDir(dirname(filePath));
    writeTextFile(filePath, content);

    return {
      path: filePath,
      action: existed ? 'updated' : 'created',
      backupPath,
    };
  }

  protected deleteFile(filePath: string, dryRun = false): boolean {
    if (!existsSync(filePath)) {
      return false;
    }

    if (!dryRun) {
      unlinkSync(filePath);
    }

    return true;
  }

  protected restoreBackup(backupPath: string, originalPath: string): void {
    if (existsSync(backupPath)) {
      copyFileSync(backupPath, originalPath);
      unlinkSync(backupPath);
    }
  }

  protected buildSkillContent(skills: Skill[]): string {
    if (skills.length === 0) {
      return '';
    }

    const sections = skills.map((skill) => {
      const header = `## ${skill.name}`;
      const meta = skill.description ? `\n${skill.description}\n` : '';
      return `${header}${meta}\n${skill.content}`;
    });

    return sections.join('\n\n---\n\n');
  }
}
