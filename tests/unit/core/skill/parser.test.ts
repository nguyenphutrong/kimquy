import { describe, test, expect } from 'bun:test';
import { parseSkillContent, matchesProfile } from '../../../../src/core/skill/parser.ts';
import { SkillError } from '../../../../src/utils/errors.ts';

describe('parseSkillContent', () => {
  test('parses valid skill with all fields', () => {
    const content = `---
name: Test Skill
description: A test skill
tags: [typescript, react]
profiles: [work, personal]
priority: high
---

# Test Content

This is the skill content.`;

    const skill = parseSkillContent(content, '/path/to/SKILL.md');

    expect(skill.name).toBe('Test Skill');
    expect(skill.description).toBe('A test skill');
    expect(skill.tags).toEqual(['typescript', 'react']);
    expect(skill.profiles).toEqual(['work', 'personal']);
    expect(skill.priority).toBe('high');
    expect(skill.content).toBe('# Test Content\n\nThis is the skill content.');
    expect(skill.filePath).toBe('/path/to/SKILL.md');
    expect(skill.id).toBeDefined();
  });

  test('uses defaults for optional fields', () => {
    const content = `---
name: Minimal Skill
---

Content here.`;

    const skill = parseSkillContent(content, '/path/to/SKILL.md');

    expect(skill.name).toBe('Minimal Skill');
    expect(skill.description).toBe('');
    expect(skill.tags).toEqual([]);
    expect(skill.profiles).toEqual(['*']);
    expect(skill.priority).toBe('medium');
  });

  test('throws on empty content', () => {
    expect(() => parseSkillContent('', '/path/to/SKILL.md')).toThrow(SkillError);
  });

  test('throws on missing frontmatter', () => {
    const content = `# Just Content

No frontmatter here.`;

    expect(() => parseSkillContent(content, '/path/to/SKILL.md')).toThrow(SkillError);
  });

  test('throws on missing name field', () => {
    const content = `---
description: Has description but no name
tags: [test]
---

Content.`;

    expect(() => parseSkillContent(content, '/path/to/SKILL.md')).toThrow(SkillError);
  });

  test('parses triggers field', () => {
    const content = `---
name: Command Skill
triggers: [/my-command, /another]
---

Content.`;

    const skill = parseSkillContent(content, '/path/to/SKILL.md');
    expect(skill.triggers).toEqual(['/my-command', '/another']);
  });
});

describe('matchesProfile', () => {
  test('returns true when skill has wildcard profile', () => {
    const skill = {
      id: 'test',
      name: 'Test',
      description: '',
      tags: [],
      profiles: ['*'],
      priority: 'medium' as const,
      content: '',
      filePath: '/test.md',
    };

    expect(matchesProfile(skill, 'work')).toBe(true);
    expect(matchesProfile(skill, 'personal')).toBe(true);
    expect(matchesProfile(skill, 'anything')).toBe(true);
  });

  test('returns true when profile matches', () => {
    const skill = {
      id: 'test',
      name: 'Test',
      description: '',
      tags: [],
      profiles: ['work', 'dev'],
      priority: 'medium' as const,
      content: '',
      filePath: '/test.md',
    };

    expect(matchesProfile(skill, 'work')).toBe(true);
    expect(matchesProfile(skill, 'dev')).toBe(true);
  });

  test('returns false when profile does not match', () => {
    const skill = {
      id: 'test',
      name: 'Test',
      description: '',
      tags: [],
      profiles: ['work'],
      priority: 'medium' as const,
      content: '',
      filePath: '/test.md',
    };

    expect(matchesProfile(skill, 'personal')).toBe(false);
  });
});
