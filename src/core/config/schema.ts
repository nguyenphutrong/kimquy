import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  skillDirs: z.array(z.string()).default(['./skills']),
  skillPatterns: z.array(z.string()).optional(),
  envVars: z.record(z.string(), z.string()).optional(),
});

export const adapterConfigSchema = z.object({
  enabled: z.boolean().default(true),
  outputDir: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const configSchema = z.object({
  profiles: z.record(z.string(), profileSchema).default({}),
  defaultProfile: z.string().default('default'),
  skillPatterns: z.array(z.string()).default(['**/SKILL.md', '**/*.skill.md']),
  adapters: z
    .object({
      'claude-code': adapterConfigSchema.optional(),
      cursor: adapterConfigSchema.optional(),
    })
    .optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type AdapterConfig = z.infer<typeof adapterConfigSchema>;
export type KimQuyConfig = z.infer<typeof configSchema>;

export type UserConfig = Partial<{
  profiles: Record<string, Partial<Profile>>;
  defaultProfile: string;
  skillPatterns: string[];
  adapters: Partial<{
    'claude-code': Partial<AdapterConfig>;
    cursor: Partial<AdapterConfig>;
  }>;
}>;

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}
