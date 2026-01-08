export interface Profile {
  name: string;
  description?: string;
  skillDirs: string[];
  envVars?: Record<string, string>;
}
