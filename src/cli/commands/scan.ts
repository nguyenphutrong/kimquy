import { Command } from 'commander';
import ora from 'ora';
import pc from 'picocolors';
import { resolve } from 'node:path';
import { SkillIndexer } from '../../core/skill/indexer.ts';
import { logger } from '../../utils/logger.ts';
import { KimQuyError } from '../../utils/errors.ts';
import { dirExists, getKimQuyDir } from '../../utils/fs.ts';

export function createScanCommand(): Command {
  return new Command('scan')
    .description('Scan and index all skills from configured directories')
    .option('-d, --dir <directory>', 'Additional directory to scan', collect, [])
    .option('-f, --force', 'Force full rescan, ignoring cache')
    .option('-q, --quiet', 'Only show summary')
    .option('-v, --verbose', 'Show detailed output')
    .action(async (options: ScanOptions) => {
      await runScan(options);
    });
}

interface ScanOptions {
  dir: string[];
  force?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

async function runScan(options: ScanOptions): Promise<void> {
  const cwd = process.cwd();

  if (!dirExists(getKimQuyDir(cwd))) {
    logger.error('Kim Quy is not initialized in this directory.');
    logger.info(`Run ${pc.cyan('kq init')} first to set up your project.`);
    process.exit(1);
  }

  const spinner = ora({
    text: 'Scanning for skills...',
    color: 'cyan',
  }).start();

  try {
    const indexer = new SkillIndexer(cwd);
    const directories =
      options.dir.length > 0 ? options.dir.map((d) => resolve(cwd, d)) : undefined;

    const result = await indexer.scan(directories, undefined, options.force ?? false);

    spinner.stop();

    if (result.stats.total === 0) {
      logger.warn('No skills found.');
      logger.info(
        `Create skills in your configured directories or use ${pc.cyan('--dir')} to specify a directory.`
      );
      process.exit(0);
    }

    console.log();
    logger.success(`Scan complete in ${pc.cyan(`${result.stats.duration}ms`)}`);
    console.log();

    console.log(pc.dim('─'.repeat(40)));
    console.log(`  ${pc.bold('Skills found:')}     ${pc.green(result.stats.total.toString())}`);

    if (!options.quiet) {
      if (result.stats.newCount > 0) {
        console.log(
          `  ${pc.dim('New:')}              ${pc.cyan(result.stats.newCount.toString())}`
        );
      }
      if (result.stats.updatedCount > 0) {
        console.log(
          `  ${pc.dim('Updated:')}          ${pc.yellow(result.stats.updatedCount.toString())}`
        );
      }
      if (result.stats.unchangedCount > 0) {
        console.log(
          `  ${pc.dim('Unchanged:')}        ${pc.dim(result.stats.unchangedCount.toString())}`
        );
      }
      if (result.stats.errorCount > 0) {
        console.log(
          `  ${pc.dim('Errors:')}           ${pc.red(result.stats.errorCount.toString())}`
        );
      }
      console.log(`  ${pc.dim('Directories:')}      ${result.stats.directories}`);
    }
    console.log(pc.dim('─'.repeat(40)));

    if (options.verbose && result.skills.length > 0) {
      console.log();
      console.log(pc.bold('Skills:'));
      for (const skill of result.skills) {
        const profileInfo =
          skill.profiles.length > 0
            ? pc.dim(` [${skill.profiles.join(', ')}]`)
            : pc.dim(' [all profiles]');
        console.log(`  ${pc.cyan('•')} ${skill.name}${profileInfo}`);
        if (skill.description) {
          console.log(`    ${pc.dim(skill.description)}`);
        }
      }
    }

    if (result.errors.length > 0) {
      console.log();
      logger.warn(`${result.errors.length} file(s) had errors:`);
      for (const { file, error } of result.errors) {
        console.log(`  ${pc.red('✗')} ${pc.dim(file)}`);
        console.log(`    ${pc.red(error)}`);
      }
    }

    console.log();
    process.exit(0);
  } catch (error) {
    spinner.stop();

    if (error instanceof KimQuyError) {
      logger.error(error.message);
      if (error.suggestions && error.suggestions.length > 0) {
        for (const suggestion of error.suggestions) {
          logger.info(suggestion);
        }
      }
    } else if (error instanceof Error) {
      logger.error(`Scan failed: ${error.message}`);
    } else {
      logger.error('An unexpected error occurred during scan.');
    }
    process.exit(1);
  }
}
