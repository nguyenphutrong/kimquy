import { loadConfig as c12LoadConfig } from 'c12';
import { dirname } from 'node:path';
import { ConfigError } from '../../utils/errors.ts';
import { findUpward, CONFIG_FILE_NAME, getGlobalConfigPath, fileExists } from '../../utils/fs.ts';
import { defaultConfig, mergeWithDefaults, mergeConfigs } from './defaults.ts';
import { configSchema, type KimQuyConfig } from './schema.ts';

export interface LoadConfigResult {
  config: KimQuyConfig;
  configPath: string | null;
  globalConfigPath: string | null;
  isDefault: boolean;
}

async function loadConfigFromPath(configPath: string): Promise<Partial<KimQuyConfig>> {
  const { config } = await c12LoadConfig<Partial<KimQuyConfig>>({
    name: 'kimquy',
    cwd: dirname(configPath),
    configFile: CONFIG_FILE_NAME,
    defaultConfig: {},
  });
  return config || {};
}

export async function loadGlobalConfig(): Promise<Partial<KimQuyConfig> | null> {
  const globalConfigPath = getGlobalConfigPath();

  if (!fileExists(globalConfigPath)) {
    return null;
  }

  try {
    return await loadConfigFromPath(globalConfigPath);
  } catch {
    return null;
  }
}

export async function loadConfig(cwd?: string): Promise<LoadConfigResult> {
  const searchDir = cwd || process.cwd();
  const projectConfigPath = findUpward(CONFIG_FILE_NAME, searchDir);
  const globalConfigPath = getGlobalConfigPath();
  const hasGlobalConfig = fileExists(globalConfigPath);

  if (!projectConfigPath && !hasGlobalConfig) {
    return {
      config: defaultConfig,
      configPath: null,
      globalConfigPath: null,
      isDefault: true,
    };
  }

  try {
    let globalConfig: Partial<KimQuyConfig> = {};
    let projectConfig: Partial<KimQuyConfig> = {};

    if (hasGlobalConfig) {
      globalConfig = await loadConfigFromPath(globalConfigPath);
    }

    if (projectConfigPath) {
      projectConfig = await loadConfigFromPath(projectConfigPath);
    }

    const mergedUserConfig = mergeConfigs(globalConfig, projectConfig);
    const merged = mergeWithDefaults(mergedUserConfig);

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
      configPath: projectConfigPath,
      globalConfigPath: hasGlobalConfig ? globalConfigPath : null,
      isDefault: false,
    };
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    const configSource = projectConfigPath || globalConfigPath;
    throw new ConfigError(
      `Failed to load config from ${configSource}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
