#!/usr/bin/env bun

const VERSION = '0.1.0';
const NAME = 'kimquy';

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-V')) {
    console.log(`${NAME} v${VERSION}`);
    return;
  }

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
${NAME} v${VERSION}
A powerful CLI tool to manage AI Profiles and Skills

Usage:
  kq <command> [options]

Commands:
  init              Initialize Kim Quy in current directory
  use <profile>     Switch to a profile
  profile           Manage profiles
  skill             Manage skills
  scan              Scan and index all skills
  adapt <target>    Generate config for AI tool

Options:
  -h, --help        Show help
  -V, --version     Show version

Examples:
  kq init
  kq use work
  kq profile list
  kq skill list
`);
    return;
  }

  console.log(`Unknown command: ${args[0]}`);
  console.log('Run "kq --help" for usage information.');
  process.exit(1);
}

main();
