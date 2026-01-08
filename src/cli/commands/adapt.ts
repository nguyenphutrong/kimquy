import { Command } from 'commander';
import pc from 'picocolors';
import ora from 'ora';
import { relative } from 'node:path';
import { adapterRegistry, type AdapterContext, type BaseAdapter } from '../../adapters/index.ts';
import { SkillIndexer } from '../../core/skill/indexer.ts';
import { getConfig } from '../../core/config/loader.ts';
import { getCurrentProfile } from '../../core/state/store.ts';
import { logger } from '../../utils/logger.ts';
import { dirExists, getKimQuyDir } from '../../utils/fs.ts';
import { matchesProfile } from '../../core/skill/parser.ts';

export function createAdaptCommand(): Command {
  return new Command('adapt')
    .description('Generate configuration files for AI tools')
    .argument('[adapter]', 'Adapter name (e.g., claude-code)')
    .option('-a, --all', 'Run all configured adapters')
    .option('--dry-run', 'Show what would be generated without writing')
    .option('--clean', 'Remove all generated files')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (adapterName: string | undefined, options: AdaptOptions) => {
      await runAdapt(adapterName, options);
    });
}

interface AdaptOptions {
  all?: boolean;
  dryRun?: boolean;
  clean?: boolean;
  verbose?: boolean;
}

async function runAdapt(adapterName: string | undefined, options: AdaptOptions): Promise<void> {
  const cwd = process.cwd();

  if (!dirExists(getKimQuyDir(cwd))) {
    logger.error('Kim Quy is not initialized in this directory.');
    logger.info(`Run ${pc.cyan('kq init')} first to set up your project.`);
    process.exit(1);
  }

  const adaptersToRun = getAdaptersToRun(adapterName, options.all);

  if (adaptersToRun.length === 0) {
    if (adapterName) {
      logger.error(`Unknown adapter: ${adapterName}`);
      logger.info(`Available adapters: ${adapterRegistry.list().join(', ')}`);
    } else {
      logger.error('No adapter specified.');
      logger.info(`Usage: ${pc.cyan('kq adapt <adapter>')} or ${pc.cyan('kq adapt --all')}`);
    }
    process.exit(1);
  }

  const config = await getConfig(cwd);
  const currentProfile = getCurrentProfile(cwd) || config.defaultProfile;

  const indexer = new SkillIndexer(cwd);
  const allSkills = await indexer.getAllSkills();
  const profileSkills = allSkills.filter((s) => matchesProfile(s, currentProfile));

  if (profileSkills.length === 0) {
    logger.warn('No skills found for current profile.');
    logger.info(`Run ${pc.cyan('kq scan')} to discover skills.`);
    process.exit(0);
  }

  const context: AdapterContext = {
    profileName: currentProfile,
    skills: profileSkills,
    config,
    outputDir: cwd,
    dryRun: options.dryRun,
  };

  let hasErrors = false;

  for (const adapter of adaptersToRun) {
    if (options.clean) {
      await runClean(adapter, context, options.verbose);
    } else {
      const success = await runGenerate(adapter, context, options);
      if (!success) {
        hasErrors = true;
      }
    }
  }

  process.exit(hasErrors ? 1 : 0);
}

function getAdaptersToRun(adapterName: string | undefined, all?: boolean): BaseAdapter[] {
  if (all) {
    return adapterRegistry.list().map((name) => adapterRegistry.get(name)!);
  }

  if (adapterName) {
    const adapter = adapterRegistry.get(adapterName);
    return adapter ? [adapter] : [];
  }

  return [];
}

async function runGenerate(
  adapter: BaseAdapter,
  context: AdapterContext,
  options: AdaptOptions
): Promise<boolean> {
  const spinner = ora({
    text: `Generating ${adapter.displayName} configuration...`,
    color: 'cyan',
  }).start();

  try {
    const validationResult = await adapter.validate(context);
    if (!validationResult.valid) {
      spinner.stop();
      logger.error(`Validation failed for ${adapter.displayName}:`);
      for (const issue of validationResult.issues) {
        const icon = issue.severity === 'error' ? pc.red('✗') : pc.yellow('⚠');
        console.log(`  ${icon} ${issue.message}`);
        if (options.verbose) {
          console.log(`    ${pc.dim(issue.file)}`);
        }
      }
      return false;
    }

    const result = await adapter.generate(context);

    spinner.stop();

    if (!result.success) {
      logger.error(`Failed to generate ${adapter.displayName} configuration:`);
      for (const error of result.errors) {
        console.log(`  ${pc.red('✗')} ${error}`);
      }
      return false;
    }

    const modeLabel = options.dryRun ? pc.yellow(' (dry run)') : '';
    logger.success(`${adapter.displayName} configuration generated${modeLabel}`);

    if (result.files.length > 0) {
      console.log();
      for (const file of result.files) {
        const relPath = relative(context.outputDir, file.path);
        const actionIcon = getActionIcon(file.action);
        console.log(`  ${actionIcon} ${relPath}`);
      }
      console.log();
    }

    return true;
  } catch (error) {
    spinner.stop();
    logger.error(
      `Error generating ${adapter.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return false;
  }
}

async function runClean(
  adapter: BaseAdapter,
  context: AdapterContext,
  verbose?: boolean
): Promise<void> {
  const spinner = ora({
    text: `Cleaning ${adapter.displayName} files...`,
    color: 'cyan',
  }).start();

  try {
    const deleted = await adapter.clean(context);
    spinner.stop();

    if (deleted.length === 0) {
      logger.info(`No ${adapter.displayName} files to clean.`);
      return;
    }

    logger.success(`Cleaned ${deleted.length} ${adapter.displayName} file(s)`);

    if (verbose) {
      console.log();
      for (const file of deleted) {
        const relPath = relative(context.outputDir, file);
        console.log(`  ${pc.red('✗')} ${relPath}`);
      }
      console.log();
    }
  } catch (error) {
    spinner.stop();
    logger.error(
      `Error cleaning ${adapter.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getActionIcon(action: 'created' | 'updated' | 'unchanged'): string {
  switch (action) {
    case 'created':
      return pc.green('+');
    case 'updated':
      return pc.yellow('~');
    case 'unchanged':
      return pc.dim('=');
  }
}
