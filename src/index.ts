#!/usr/bin/env bun

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitCommand } from './cli/commands/init.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageJson {
  version: string;
  description: string;
}

function getPackageJson(): PackageJson {
  const paths = [
    join(__dirname, '../package.json'),
    join(__dirname, '../../package.json'),
    join(process.cwd(), 'package.json'),
  ];

  for (const path of paths) {
    try {
      const content = readFileSync(path, 'utf-8');
      return JSON.parse(content) as PackageJson;
    } catch {}
  }

  return { version: '0.1.0', description: 'Kim Quy CLI' };
}

const pkg = getPackageJson();

const program = new Command();

program
  .name('kq')
  .description(pkg.description)
  .version(pkg.version, '-V, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help information')
  .showHelpAfterError('(add --help for additional information)')
  .configureOutput({
    outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
  });

program.addCommand(createInitCommand());

program
  .command('use <profile>')
  .description('Switch to a profile')
  .action((profile: string) => {
    console.log(`kq use ${profile} - Coming soon`);
    process.exit(0);
  });

program
  .command('profile')
  .description('Manage profiles')
  .addCommand(
    new Command('list').description('List all profiles').action(() => {
      console.log('kq profile list - Coming soon');
      process.exit(0);
    })
  )
  .addCommand(
    new Command('create')
      .argument('<name>', 'Profile name')
      .description('Create a new profile')
      .action((name: string) => {
        console.log(`kq profile create ${name} - Coming soon`);
        process.exit(0);
      })
  )
  .addCommand(
    new Command('delete')
      .argument('<name>', 'Profile name')
      .description('Delete a profile')
      .option('-f, --force', 'Skip confirmation')
      .action((name: string) => {
        console.log(`kq profile delete ${name} - Coming soon`);
        process.exit(0);
      })
  );

program
  .command('skill')
  .description('Manage skills')
  .addCommand(
    new Command('list')
      .description('List skills for current profile')
      .option('-a, --all', 'Show all skills')
      .action(() => {
        console.log('kq skill list - Coming soon');
        process.exit(0);
      })
  )
  .addCommand(
    new Command('validate').description('Validate all SKILL.md files').action(() => {
      console.log('kq skill validate - Coming soon');
      process.exit(0);
    })
  );

program
  .command('scan')
  .description('Scan and index all skills')
  .option('-d, --dir <directory>', 'Directory to scan')
  .action(() => {
    console.log('kq scan - Coming soon');
    process.exit(0);
  });

program
  .command('adapt')
  .description('Generate config for AI tool')
  .argument('[target]', 'Target AI tool (claude-code, cursor)')
  .option('-a, --all', 'Generate for all configured adapters')
  .option('--dry-run', 'Show what would be generated without writing')
  .action((target?: string) => {
    console.log(`kq adapt ${target || 'all'} - Coming soon`);
    process.exit(0);
  });

program
  .command('status')
  .description('Show current profile and configuration status')
  .action(() => {
    console.log('kq status - Coming soon');
    process.exit(0);
  });

program
  .command('doctor')
  .description('Diagnose configuration issues')
  .action(() => {
    console.log('kq doctor - Coming soon');
    process.exit(0);
  });

try {
  program.parse(process.argv);
} catch (error) {
  if (error instanceof Error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
  }
  process.exit(1);
}
