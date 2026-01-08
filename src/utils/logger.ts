type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatMessage(level: LogLevel, message: string): string {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✔${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✖${colors.reset}`,
    debug: `${colors.dim}◯${colors.reset}`,
  };

  return `${prefix[level]} ${message}`;
}

export const logger = {
  info(message: string): void {
    console.log(formatMessage('info', message));
  },

  success(message: string): void {
    console.log(formatMessage('success', message));
  },

  warn(message: string): void {
    console.warn(formatMessage('warn', message));
  },

  error(message: string): void {
    console.error(formatMessage('error', message));
  },

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(formatMessage('debug', colors.dim + message + colors.reset));
    }
  },

  blank(): void {
    console.log('');
  },
};
