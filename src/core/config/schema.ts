import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  skillDirs: z.array(z.string()),
  envVars: z.record(z.string(), z.string()).optional(),
});

export const configSchema = z.object({
  profiles: z.record(z.string(), profileSchema),
  defaultProfile: z.string(),
  skillPatterns: z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type KimQuyConfig = z.infer<typeof configSchema>;
