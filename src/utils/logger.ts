import pc from 'picocolors';
import ora, { type Ora } from 'ora';

const isDebugEnabled = (): boolean =>
  process.env.DEBUG === 'true' || process.argv.includes('--verbose');

const isColorDisabled = (): boolean =>
  process.env.NO_COLOR !== undefined || process.env.TERM === 'dumb';

const formatMessage = (prefix: string, message: string): string => `${prefix} ${message}`;

export const logger = {
  info(message: string): void {
    const prefix = isColorDisabled() ? 'ℹ' : pc.blue('ℹ');
    console.log(formatMessage(prefix, message));
  },

  success(message: string): void {
    const prefix = isColorDisabled() ? '✔' : pc.green('✔');
    console.log(formatMessage(prefix, message));
  },

  warn(message: string): void {
    const prefix = isColorDisabled() ? '⚠' : pc.yellow('⚠');
    console.warn(formatMessage(prefix, message));
  },

  error(message: string): void {
    const prefix = isColorDisabled() ? '✖' : pc.red('✖');
    console.error(formatMessage(prefix, message));
  },

  debug(message: string): void {
    if (isDebugEnabled()) {
      const prefix = isColorDisabled() ? '◯' : pc.dim('◯');
      const text = isColorDisabled() ? message : pc.dim(message);
      console.log(formatMessage(prefix, text));
    }
  },

  blank(): void {
    console.log('');
  },

  spinner(text: string): Ora {
    return ora({ text, color: 'cyan' });
  },

  table(data: Record<string, string>): void {
    const maxKeyLength = Math.max(...Object.keys(data).map((k) => k.length));
    for (const [key, value] of Object.entries(data)) {
      const paddedKey = key.padEnd(maxKeyLength);
      const keyText = isColorDisabled() ? paddedKey : pc.dim(paddedKey);
      console.log(`  ${keyText}  ${value}`);
    }
  },

  box(title: string, content: string): void {
    const titleText = isColorDisabled() ? title : pc.bold(title);
    console.log(`\n${titleText}`);
    console.log(isColorDisabled() ? '─'.repeat(40) : pc.dim('─'.repeat(40)));
    console.log(content);
    console.log('');
  },
};
