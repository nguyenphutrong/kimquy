import { Command } from 'commander';
import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { homedir } from 'node:os';
import { logger } from '../../utils/logger.ts';
import {
  fileExists,
  dirExists,
  ensureDir,
  readTextFile,
  writeTextFile,
  getGlobalSkillsDir,
} from '../../utils/fs.ts';

interface ImportOptions {
  output?: string;
  force: boolean;
}

interface ClaudeCommandFrontmatter {
  description?: string;
  'allowed-tools'?: string;
}

function parseClaudeCommandFrontmatter(content: string): {
  frontmatter: ClaudeCommandFrontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match || !match[1]) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2] || '';
  const frontmatter: ClaudeCommandFrontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key === 'description') {
        frontmatter.description = value;
      } else if (key === 'allowed-tools') {
        frontmatter['allowed-tools'] = value;
      }
    }
  }

  return { frontmatter, body };
}

function convertToSkillFormat(
  filename: string,
  frontmatter: ClaudeCommandFrontmatter,
  body: string
): string {
  const name = basename(filename, '.md')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const trigger = `/${basename(filename, '.md')}`;

  const skillFrontmatter = `---
name: ${name}
description: ${frontmatter.description || ''}
tags: [claude, imported]
profiles: ["*"]
priority: medium
triggers: [${trigger}]
---`;

  return `${skillFrontmatter}\n\n${body.trim()}\n`;
}

function getClaudeCommandsDir(): string {
  return join(homedir(), '.claude', 'commands');
}

async function importClaudeCommands(options: ImportOptions): Promise<void> {
  const sourceDir = getClaudeCommandsDir();

  if (!dirExists(sourceDir)) {
    logger.error(`Claude commands directory not found: ${sourceDir}`);
    logger.info('Make sure you have Claude Code installed with custom commands.');
    process.exit(1);
  }

  const outputDir = options.output || join(getGlobalSkillsDir(), 'claude-imported');
  ensureDir(outputDir);

  const files = readdirSync(sourceDir).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    logger.warn('No command files found in Claude commands directory.');
    process.exit(0);
  }

  const spinner = logger.spinner(`Importing ${files.length} Claude command(s)...`);
  spinner.start();

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const sourcePath = join(sourceDir, file);
    const destPath = join(outputDir, `${basename(file, '.md')}.skill.md`);

    if (fileExists(destPath) && !options.force) {
      skipped++;
      continue;
    }

    try {
      const content = readTextFile(sourcePath);
      const { frontmatter, body } = parseClaudeCommandFrontmatter(content);
      const skillContent = convertToSkillFormat(file, frontmatter, body);
      writeTextFile(destPath, skillContent);
      imported++;
    } catch (error) {
      logger.warn(
        `Failed to import ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  spinner.succeed('Import complete!');

  logger.blank();
  logger.info('Import summary:');
  logger.table({
    Source: sourceDir,
    Output: outputDir,
    Imported: String(imported),
    Skipped: String(skipped),
  });

  if (imported > 0) {
    logger.blank();
    logger.info('Next steps:');
    console.log('  1. Run "kq scan" to index the imported skills');
    console.log('  2. Run "kq adapt claude-code" to regenerate Claude config');
  }

  logger.blank();
}

async function importCursorRules(options: ImportOptions): Promise<void> {
  const cursorRulesPath = join(homedir(), '.cursor', 'rules');

  if (!fileExists(cursorRulesPath)) {
    logger.error(`Cursor rules file not found: ${cursorRulesPath}`);
    logger.info('Make sure you have Cursor IDE installed with custom rules.');
    process.exit(1);
  }

  const outputDir = options.output || join(getGlobalSkillsDir(), 'cursor-imported');
  ensureDir(outputDir);

  const destPath = join(outputDir, 'cursor-rules.skill.md');

  if (fileExists(destPath) && !options.force) {
    logger.warn(`Skill already exists: ${destPath}`);
    logger.info('Use --force to overwrite.');
    process.exit(1);
  }

  const spinner = logger.spinner('Importing Cursor rules...');
  spinner.start();

  try {
    const content = readTextFile(cursorRulesPath);

    const skillContent = `---
name: Cursor Rules
description: Imported rules from Cursor IDE
tags: [cursor, imported]
profiles: ["*"]
priority: medium
---

${content.trim()}
`;

    writeTextFile(destPath, skillContent);
    spinner.succeed('Cursor rules imported successfully!');

    logger.blank();
    logger.info('Import summary:');
    logger.table({
      Source: cursorRulesPath,
      Output: destPath,
    });

    logger.blank();
    logger.info('Next steps:');
    console.log('  1. Run "kq scan" to index the imported skill');
    console.log('  2. Run "kq adapt --all" to regenerate configs');
    logger.blank();
  } catch (error) {
    spinner.fail('Failed to import Cursor rules');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

export function createImportCommand(): Command {
  const importCmd = new Command('import').description(
    'Import skills from external AI tools (Claude, Cursor)'
  );

  importCmd
    .command('claude')
    .description('Import commands from ~/.claude/commands/')
    .option('-o, --output <dir>', 'Output directory for imported skills')
    .option('-f, --force', 'Overwrite existing skills', false)
    .action(importClaudeCommands);

  importCmd
    .command('cursor')
    .description('Import rules from ~/.cursor/rules')
    .option('-o, --output <dir>', 'Output directory for imported skills')
    .option('-f, --force', 'Overwrite existing skills', false)
    .action(importCursorRules);

  return importCmd;
}
