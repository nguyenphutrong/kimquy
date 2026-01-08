import { Command } from 'commander';
import pc from 'picocolors';
import { resolve } from 'node:path';
import { getConfig } from '../../core/config/loader.ts';
import { SkillIndexer } from '../../core/skill/indexer.ts';
import { logger } from '../../utils/logger.ts';
import { dirExists, fileExists, getKimQuyDir, getConfigPath } from '../../utils/fs.ts';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  suggestion?: string;
}

export function createDoctorCommand(): Command {
  return new Command('doctor').description('Diagnose configuration issues').action(async () => {
    await runDoctor();
  });
}

async function runDoctor(): Promise<void> {
  const cwd = process.cwd();
  const checks: CheckResult[] = [];

  console.log();
  console.log(pc.bold('Kim Quy Doctor'));
  console.log(pc.dim('Checking your configuration...\n'));

  checks.push(checkKimQuyDir(cwd));
  checks.push(checkConfigFile(cwd));
  checks.push(await checkConfigValid(cwd));
  checks.push(await checkSkillDirs(cwd));
  checks.push(await checkSkillFiles(cwd));
  checks.push(checkClaudeCodeSetup(cwd));

  console.log(pc.dim('─'.repeat(50)));

  let hasErrors = false;

  for (const check of checks) {
    const icon = check.passed ? pc.green('✓') : pc.red('✗');
    console.log(`  ${icon} ${check.name}`);

    if (!check.passed) {
      console.log(`    ${pc.dim(check.message)}`);
      if (check.suggestion) {
        console.log(`    ${pc.yellow('💡')} ${check.suggestion}`);
      }
      hasErrors = true;
    }
  }

  console.log(pc.dim('─'.repeat(50)));
  console.log();

  const passedCount = checks.filter((c) => c.passed).length;
  const failedCount = checks.length - passedCount;

  if (failedCount === 0) {
    logger.success(`All ${passedCount} checks passed. Your configuration is healthy!`);
  } else {
    logger.warn(`${failedCount} issue(s) found. Please review the suggestions above.`);
  }

  console.log();
  process.exit(hasErrors ? 1 : 0);
}

function checkKimQuyDir(cwd: string): CheckResult {
  const kimquyDir = getKimQuyDir(cwd);
  const exists = dirExists(kimquyDir);

  return {
    name: '.kimquy directory exists',
    passed: exists,
    message: 'The .kimquy directory is missing',
    suggestion: 'Run "kq init" to initialize Kim Quy',
  };
}

function checkConfigFile(cwd: string): CheckResult {
  const configPath = getConfigPath(cwd);
  const exists = fileExists(configPath);

  return {
    name: 'kimquy.config.ts exists',
    passed: exists,
    message: 'Configuration file not found',
    suggestion: 'Run "kq init" to create the configuration file',
  };
}

async function checkConfigValid(cwd: string): Promise<CheckResult> {
  try {
    await getConfig(cwd);
    return {
      name: 'Configuration is valid',
      passed: true,
      message: '',
    };
  } catch (error) {
    return {
      name: 'Configuration is valid',
      passed: false,
      message: error instanceof Error ? error.message : 'Invalid configuration',
      suggestion: 'Check your kimquy.config.ts for syntax errors',
    };
  }
}

async function checkSkillDirs(cwd: string): Promise<CheckResult> {
  try {
    const config = await getConfig(cwd);
    const defaultProfile = config.profiles[config.defaultProfile];
    const skillDirs = defaultProfile?.skillDirs || ['./skills'];

    const missingDirs: string[] = [];
    for (const dir of skillDirs) {
      const fullPath = resolve(cwd, dir);
      if (!dirExists(fullPath)) {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length > 0) {
      return {
        name: 'Skill directories exist',
        passed: false,
        message: `Missing directories: ${missingDirs.join(', ')}`,
        suggestion: 'Create the skill directories or update skillDirs in config',
      };
    }

    return {
      name: 'Skill directories exist',
      passed: true,
      message: '',
    };
  } catch {
    return {
      name: 'Skill directories exist',
      passed: false,
      message: 'Could not check skill directories',
      suggestion: 'Fix configuration errors first',
    };
  }
}

async function checkSkillFiles(cwd: string): Promise<CheckResult> {
  try {
    const indexer = new SkillIndexer(cwd);
    const result = await indexer.scan(undefined, undefined, true);

    if (result.errors.length > 0) {
      return {
        name: 'All SKILL.md files are valid',
        passed: false,
        message: `${result.errors.length} file(s) have errors`,
        suggestion: 'Run "kq skill validate --verbose" for details',
      };
    }

    if (result.stats.total === 0) {
      return {
        name: 'All SKILL.md files are valid',
        passed: true,
        message: 'No skill files found (this is OK)',
      };
    }

    return {
      name: 'All SKILL.md files are valid',
      passed: true,
      message: `${result.stats.total} skill(s) validated`,
    };
  } catch {
    return {
      name: 'All SKILL.md files are valid',
      passed: false,
      message: 'Could not scan skill files',
      suggestion: 'Ensure skill directories are readable',
    };
  }
}

function checkClaudeCodeSetup(cwd: string): CheckResult {
  const claudeDir = resolve(cwd, '.claude');

  if (!dirExists(claudeDir)) {
    return {
      name: 'Claude Code integration',
      passed: true,
      message: 'Not configured (optional)',
    };
  }

  const skillsFile = resolve(claudeDir, 'skills.md');
  if (!fileExists(skillsFile)) {
    return {
      name: 'Claude Code integration',
      passed: false,
      message: '.claude directory exists but skills.md is missing',
      suggestion: 'Run "kq adapt claude-code" to generate configuration',
    };
  }

  return {
    name: 'Claude Code integration',
    passed: true,
    message: 'Configured and ready',
  };
}
