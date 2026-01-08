import { Command } from 'commander';
import pc from 'picocolors';
import { relative } from 'node:path';
import { SkillIndexer } from '../../core/skill/indexer.ts';
import { parseSkillFile, matchesProfile } from '../../core/skill/parser.ts';
import { getCurrentProfile } from '../../core/state/store.ts';
import { logger } from '../../utils/logger.ts';
import { dirExists, getKimQuyDir } from '../../utils/fs.ts';
import { SkillError } from '../../utils/errors.ts';
import type { Skill } from '../../core/skill/types.ts';

export function createSkillCommand(): Command {
  const skillCmd = new Command('skill').description('Manage skills');

  skillCmd.addCommand(createListSubcommand());
  skillCmd.addCommand(createValidateSubcommand());

  return skillCmd;
}

function createListSubcommand(): Command {
  return new Command('list')
    .description('List skills for current profile')
    .option('-a, --all', 'Show all skills regardless of profile')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (options: ListOptions) => {
      await runList(options);
    });
}

function createValidateSubcommand(): Command {
  return new Command('validate')
    .description('Validate all SKILL.md files')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (options: ValidateOptions) => {
      await runValidate(options);
    });
}

interface ListOptions {
  all?: boolean;
  tags?: string;
  verbose?: boolean;
}

interface ValidateOptions {
  verbose?: boolean;
}

async function runList(options: ListOptions): Promise<void> {
  const cwd = process.cwd();

  if (!dirExists(getKimQuyDir(cwd))) {
    logger.error('Kim Quy is not initialized in this directory.');
    logger.info(`Run ${pc.cyan('kq init')} first to set up your project.`);
    process.exit(1);
  }

  const indexer = new SkillIndexer(cwd);
  let skills = await indexer.getAllSkills();

  if (skills.length === 0) {
    logger.warn('No skills found.');
    logger.info(`Run ${pc.cyan('kq scan')} to discover skills.`);
    process.exit(0);
  }

  const currentProfile = getCurrentProfile(cwd);

  if (!options.all && currentProfile) {
    skills = skills.filter((s) => matchesProfile(s, currentProfile));
  }

  if (options.tags) {
    const filterTags = options.tags.split(',').map((t) => t.trim().toLowerCase());
    skills = skills.filter((s) => s.tags.some((tag) => filterTags.includes(tag.toLowerCase())));
  }

  if (skills.length === 0) {
    logger.warn('No skills match the current filters.');
    if (!options.all && currentProfile) {
      logger.info(`Try ${pc.cyan('kq skill list --all')} to see all skills.`);
    }
    process.exit(0);
  }

  console.log();
  const profileLabel = options.all ? 'all profiles' : currentProfile || 'default';
  console.log(pc.bold(`Skills for ${pc.cyan(profileLabel)}:`));
  console.log(pc.dim('─'.repeat(60)));

  const groupedByDir = groupByDirectory(skills, cwd);

  for (const [dir, dirSkills] of Object.entries(groupedByDir)) {
    console.log();
    console.log(pc.dim(`📁 ${dir}/`));

    for (const skill of dirSkills) {
      const priorityIcon = getPriorityIcon(skill.priority);
      const tagsStr = skill.tags.length > 0 ? pc.dim(` [${skill.tags.join(', ')}]`) : '';
      const profileStr = skill.profiles.includes('*')
        ? pc.dim(' (all)')
        : pc.dim(` (${skill.profiles.join(', ')})`);

      console.log(
        `   ${priorityIcon} ${pc.cyan(skill.name)}${tagsStr}${options.verbose ? profileStr : ''}`
      );

      if (options.verbose && skill.description) {
        console.log(`      ${pc.dim(skill.description)}`);
      }
    }
  }

  console.log();
  console.log(pc.dim('─'.repeat(60)));
  console.log(`Total: ${pc.green(skills.length.toString())} skill(s)`);
  console.log();

  process.exit(0);
}

async function runValidate(options: ValidateOptions): Promise<void> {
  const cwd = process.cwd();

  if (!dirExists(getKimQuyDir(cwd))) {
    logger.error('Kim Quy is not initialized in this directory.');
    logger.info(`Run ${pc.cyan('kq init')} first to set up your project.`);
    process.exit(1);
  }

  const indexer = new SkillIndexer(cwd);
  const result = await indexer.scan(undefined, undefined, true);

  console.log();

  if (result.errors.length === 0) {
    logger.success(`All ${result.stats.total} skill(s) are valid.`);
    console.log();
    process.exit(0);
  }

  logger.error(`Found ${result.errors.length} invalid skill file(s):`);
  console.log();

  for (const { file, error } of result.errors) {
    const relPath = relative(cwd, file);
    console.log(`${pc.red('✗')} ${pc.bold(relPath)}`);
    console.log(`  ${pc.dim('Error:')} ${error}`);

    if (options.verbose) {
      await printValidationSuggestions(file);
    }

    console.log();
  }

  console.log(pc.dim('─'.repeat(60)));
  console.log(
    `${pc.green(result.stats.total.toString())} valid, ${pc.red(result.errors.length.toString())} invalid`
  );
  console.log();

  process.exit(1);
}

async function printValidationSuggestions(filePath: string): Promise<void> {
  try {
    await parseSkillFile(filePath);
  } catch (error) {
    if (error instanceof SkillError && error.suggestions) {
      console.log(`  ${pc.dim('Suggestions:')}`);
      for (const suggestion of error.suggestions) {
        console.log(`    ${pc.yellow('•')} ${suggestion}`);
      }
    }
  }
}

function groupByDirectory(skills: Skill[], cwd: string): Record<string, Skill[]> {
  const grouped: Record<string, Skill[]> = {};

  for (const skill of skills) {
    const relPath = relative(cwd, skill.filePath);
    const dir = relPath.split('/').slice(0, -1).join('/') || '.';

    if (!grouped[dir]) {
      grouped[dir] = [];
    }
    grouped[dir].push(skill);
  }

  for (const dir of Object.keys(grouped)) {
    grouped[dir]?.sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'high':
      return pc.red('⬆');
    case 'low':
      return pc.dim('⬇');
    default:
      return pc.dim('•');
  }
}
