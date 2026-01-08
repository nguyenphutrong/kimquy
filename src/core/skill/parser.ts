import matter from 'gray-matter';
import { basename } from 'node:path';
import { z } from 'zod';
import { SkillError } from '../../utils/errors.ts';
import { fileExists, readTextFile } from '../../utils/fs.ts';
import type { Skill, SkillFrontmatter } from './types.ts';

const frontmatterSchema = z.object({
  name: z.string({ message: 'Skill name is required in frontmatter' }),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
  profiles: z.array(z.string()).default(['*']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  triggers: z.array(z.string()).optional(),
});

function generateSkillId(filePath: string, name: string): string {
  const base = basename(filePath, '.md').toLowerCase();
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${normalized}-${base}`.replace(/^-|-$/g, '');
}

export function parseSkillContent(content: string, filePath: string): Skill {
  if (!content.trim()) {
    throw new SkillError(`Empty skill file: ${filePath}`, [
      'Add frontmatter with at least a "name" field',
      'Add skill content in markdown format',
    ]);
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(content);
  } catch (error) {
    throw new SkillError(
      `Failed to parse frontmatter in ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ['Check YAML syntax in frontmatter', 'Ensure frontmatter is between --- markers']
    );
  }

  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    throw new SkillError(`No frontmatter found in ${filePath}`, [
      'Add frontmatter at the top of the file between --- markers',
      'Example:\n---\nname: My Skill\ntags: [typescript]\n---',
    ]);
  }

  const frontmatterResult = frontmatterSchema.safeParse(parsed.data);

  if (!frontmatterResult.success) {
    const errors = frontmatterResult.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new SkillError(`Invalid frontmatter in ${filePath}:\n${errors}`, [
      'Ensure "name" field is present',
      'Check field types match expected format',
    ]);
  }

  const fm: SkillFrontmatter = frontmatterResult.data;

  return {
    id: generateSkillId(filePath, fm.name),
    name: fm.name,
    description: fm.description ?? '',
    tags: fm.tags ?? [],
    profiles: fm.profiles ?? ['*'],
    priority: fm.priority ?? 'medium',
    triggers: fm.triggers,
    content: parsed.content.trim(),
    filePath,
  };
}

export async function parseSkillFile(filePath: string): Promise<Skill> {
  if (!fileExists(filePath)) {
    throw new SkillError(`Skill file not found: ${filePath}`);
  }

  const content = readTextFile(filePath);
  return parseSkillContent(content, filePath);
}

export function matchesProfile(skill: Skill, profileKey: string): boolean {
  if (skill.profiles.includes('*')) {
    return true;
  }
  return skill.profiles.includes(profileKey);
}

export class SkillParser {
  async parse(filePath: string): Promise<Skill> {
    return parseSkillFile(filePath);
  }

  parseSync(content: string, filePath: string): Skill {
    return parseSkillContent(content, filePath);
  }
}
