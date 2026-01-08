export interface Skill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  profiles: string[];
  priority: 'low' | 'medium' | 'high';
  content: string;
  filePath: string;
}

export interface SkillFrontmatter {
  name: string;
  description?: string;
  tags?: string[];
  profiles?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export type SkillPriority = 'low' | 'medium' | 'high';
