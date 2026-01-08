import { Command } from 'commander';
import pc from 'picocolors';
import { relative, resolve } from 'node:path';
import { getConfig } from '../../core/config/loader.ts';
import { getCurrentProfile, getState } from '../../core/state/store.ts';
import { SkillIndexer } from '../../core/skill/indexer.ts';
import { matchesProfile } from '../../core/skill/parser.ts';
import { logger } from '../../utils/logger.ts';
import { dirExists, fileExists, getKimQuyDir, getConfigPath } from '../../utils/fs.ts';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show current profile and configuration status')
    .action(async () => {
      await runStatus();
    });
}

async function runStatus(): Promise<void> {
  const cwd = process.cwd();
  const kimquyDir = getKimQuyDir(cwd);
  const configPath = getConfigPath(cwd);

  console.log();
  console.log(pc.bold('Kim Quy Status'));
  console.log(pc.dim('─'.repeat(50)));

  if (!dirExists(kimquyDir)) {
    console.log(`  ${pc.red('✗')} ${pc.dim('Initialized:')} No`);
    console.log();
    logger.info(`Run ${pc.cyan('kq init')} to initialize Kim Quy in this directory.`);
    process.exit(0);
  }

  console.log(`  ${pc.green('✓')} ${pc.dim('Initialized:')} Yes`);

  const relConfigPath = relative(cwd, configPath);
  console.log(`  ${pc.dim('Config:')} ${relConfigPath}`);

  try {
    const config = await getConfig(cwd);
    const state = getState(cwd);
    const currentProfile = getCurrentProfile(cwd) || config.defaultProfile;

    console.log(`  ${pc.dim('Profile:')} ${pc.cyan(currentProfile)}`);

    const profileConfig = config.profiles[currentProfile];
    if (profileConfig) {
      if (profileConfig.description) {
        console.log(`  ${pc.dim('Description:')} ${profileConfig.description}`);
      }
      const skillDirs = profileConfig.skillDirs || ['./skills'];
      console.log(`  ${pc.dim('Skill Dirs:')} ${skillDirs.join(', ')}`);
    }

    console.log(pc.dim('─'.repeat(50)));

    const indexer = new SkillIndexer(cwd);
    const allSkills = await indexer.getAllSkills();
    const profileSkills = allSkills.filter((s) => matchesProfile(s, currentProfile));

    console.log(`  ${pc.dim('Total Skills:')} ${allSkills.length}`);
    console.log(`  ${pc.dim('Profile Skills:')} ${profileSkills.length}`);

    if (state.lastScanAt) {
      const lastScan = new Date(state.lastScanAt);
      console.log(`  ${pc.dim('Last Scan:')} ${formatRelativeTime(lastScan)}`);
    } else {
      console.log(`  ${pc.dim('Last Scan:')} Never`);
    }

    console.log(pc.dim('─'.repeat(50)));

    const claudeDir = resolve(cwd, '.claude');
    if (dirExists(claudeDir)) {
      const skillsFile = resolve(claudeDir, 'skills.md');
      if (fileExists(skillsFile)) {
        console.log(`  ${pc.green('✓')} ${pc.dim('Claude Code:')} Configured`);
      } else {
        console.log(
          `  ${pc.yellow('⚠')} ${pc.dim('Claude Code:')} Directory exists, no skills generated`
        );
      }
    } else {
      console.log(`  ${pc.dim('−')} ${pc.dim('Claude Code:')} Not configured`);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Failed to load configuration');
    process.exit(1);
  }

  console.log();
  process.exit(0);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute(s) ago`;
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  return `${diffDays} day(s) ago`;
}
