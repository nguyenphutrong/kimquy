export interface Skill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  profiles: string[];
  priority: 'low' | 'medium' | 'high';
  triggers?: string[];
  content: string;
  filePath: string;
}

export interface SkillFrontmatter {
  name: string;
  description?: string;
  tags?: string[];
  profiles?: string[];
  priority?: 'low' | 'medium' | 'high';
  triggers?: string[];
}

export type SkillPriority = 'low' | 'medium' | 'high';
