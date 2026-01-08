import { loadConfig as c12LoadConfig } from 'c12';
import { dirname } from 'node:path';
import { ConfigError } from '../../utils/errors.ts';
import { findUpward, CONFIG_FILE_NAME } from '../../utils/fs.ts';
import { defaultConfig, mergeWithDefaults } from './defaults.ts';
import { configSchema, type KimQuyConfig } from './schema.ts';

export interface LoadConfigResult {
  config: KimQuyConfig;
  configPath: string | null;
  isDefault: boolean;
}

export async function loadConfig(cwd?: string): Promise<LoadConfigResult> {
  const searchDir = cwd || process.cwd();

  const configPath = findUpward(CONFIG_FILE_NAME, searchDir);

  if (!configPath) {
    return {
      config: defaultConfig,
      configPath: null,
      isDefault: true,
    };
  }

  try {
    const { config: userConfig } = await c12LoadConfig<Partial<KimQuyConfig>>({
      name: 'kimquy',
      cwd: dirname(configPath),
      configFile: CONFIG_FILE_NAME,
      defaultConfig: {},
    });

    const merged = mergeWithDefaults(userConfig || {});

    const parseResult = configSchema.safeParse(merged);

    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new ConfigError(`Invalid configuration:\n${errors}`, [
        'Check your kimquy.config.ts file for errors',
        'Run "kq doctor" to diagnose issues',
      ]);
    }

    return {
      config: parseResult.data,
      configPath,
      isDefault: false,
    };
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError(
      `Failed to load config from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ['Ensure the config file is valid TypeScript', 'Check for syntax errors in your config']
    );
  }
}

export async function getConfig(cwd?: string): Promise<KimQuyConfig> {
  const result = await loadConfig(cwd);
  return result.config;
}

export function getConfigSync(): KimQuyConfig {
  return defaultConfig;
}
