import type { KimQuyConfig } from './core/config/schema.ts';

export function defineConfig(config: KimQuyConfig): KimQuyConfig {
  return config;
}

export type { KimQuyConfig, Profile } from './core/config/schema.ts';
export type { Skill } from './core/skill/types.ts';
