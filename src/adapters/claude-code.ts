import { join } from 'node:path';
import {
  BaseAdapter,
  type AdapterContext,
  type AdapterResult,
  type ValidationResult,
} from './base.ts';

const CLAUDE_DIR = '.claude';
const SETTINGS_FILE = 'settings.local.json';
const COMMANDS_DIR = 'commands';

interface ClaudeSettings {
  permissions?: Record<string, boolean>;
  systemPromptFile?: string;
  contextFiles?: string[];
}

export class ClaudeCodeAdapter extends BaseAdapter {
  readonly name = 'claude-code';
  readonly displayName = 'Claude Code';
  readonly description = 'Generates .claude/ configuration for Anthropic Claude Code';

  async generate(context: AdapterContext): Promise<AdapterResult> {
    const { skills, outputDir, dryRun = false } = context;
    const files: AdapterResult['files'] = [];
    const errors: string[] = [];

    try {
      const claudeDir = join(outputDir, CLAUDE_DIR);
      const skillsContent = this.buildSkillContent(skills);

      if (skillsContent) {
        const skillsFilePath = join(claudeDir, 'skills.md');
        const skillsFile = this.writeFile(skillsFilePath, skillsContent, dryRun);
        files.push(skillsFile);

        const settingsPath = join(claudeDir, SETTINGS_FILE);
        const settings = this.buildSettings(skills);
        const settingsFile = this.writeFile(
          settingsPath,
          JSON.stringify(settings, null, 2),
          dryRun
        );
        files.push(settingsFile);
      }

      const commandsWithTriggers = skills.filter((s) => s.triggers && s.triggers.length > 0);
      for (const skill of commandsWithTriggers) {
        for (const trigger of skill.triggers ?? []) {
          const commandPath = join(claudeDir, COMMANDS_DIR, `${trigger}.md`);
          const commandContent = this.buildCommandContent(skill);
          const commandFile = this.writeFile(commandPath, commandContent, dryRun);
          files.push(commandFile);
        }
      }

      return { success: true, files, errors };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, files, errors };
    }
  }

  override async validate(context: AdapterContext): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = [];

    for (const skill of context.skills) {
      if (!skill.name || skill.name.trim() === '') {
        issues.push({
          file: skill.filePath,
          message: 'Skill is missing a name',
          severity: 'error',
        });
      }

      if (!skill.content || skill.content.trim() === '') {
        issues.push({
          file: skill.filePath,
          message: 'Skill has no content',
          severity: 'warning',
        });
      }
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      issues,
    };
  }

  override async clean(context: AdapterContext): Promise<string[]> {
    const { outputDir, dryRun = false } = context;
    const claudeDir = join(outputDir, CLAUDE_DIR);
    const deleted: string[] = [];

    const skillsPath = join(claudeDir, 'skills.md');
    if (this.deleteFile(skillsPath, dryRun)) {
      deleted.push(skillsPath);
    }

    const settingsPath = join(claudeDir, SETTINGS_FILE);
    if (this.deleteFile(settingsPath, dryRun)) {
      deleted.push(settingsPath);
    }

    return deleted;
  }

  private buildSettings(skills: import('../core/skill/types.ts').Skill[]): ClaudeSettings {
    const settings: ClaudeSettings = {
      contextFiles: ['skills.md'],
    };

    const hasHighPrioritySkills = skills.some((s) => s.priority === 'high');
    if (hasHighPrioritySkills) {
      settings.systemPromptFile = 'skills.md';
    }

    return settings;
  }

  private buildCommandContent(skill: import('../core/skill/types.ts').Skill): string {
    const lines = [`# ${skill.name}`, ''];

    if (skill.description) {
      lines.push(skill.description, '');
    }

    lines.push(skill.content);

    return lines.join('\n');
  }
}
