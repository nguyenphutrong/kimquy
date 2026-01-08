import fg from 'fast-glob';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { getConfig } from '../config/loader.ts';
import { setLastScanAt } from '../state/store.ts';
import {
  dirExists,
  ensureDir,
  fileExists,
  getKimQuyDir,
  readJson,
  readTextFile,
  writeJson,
} from '../../utils/fs.ts';
import { parseSkillContent, matchesProfile } from './parser.ts';
import type { Skill } from './types.ts';

const SKILLS_CACHE_FILE = 'skills.json';

interface SkillCacheEntry {
  skill: Skill;
  hash: string;
  mtime: number;
}

interface SkillCache {
  version: string;
  entries: Record<string, SkillCacheEntry>;
  lastScanAt: string;
}

function hashContent(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

function getSkillsCachePath(cwd?: string): string {
  return join(getKimQuyDir(cwd), SKILLS_CACHE_FILE);
}

function loadSkillsCache(cwd?: string): SkillCache | null {
  const cachePath = getSkillsCachePath(cwd);
  if (!fileExists(cachePath)) {
    return null;
  }
  try {
    return readJson<SkillCache>(cachePath);
  } catch {
    return null;
  }
}

function saveSkillsCache(cache: SkillCache, cwd?: string): void {
  const cacheDir = getKimQuyDir(cwd);
  ensureDir(cacheDir);
  writeJson(getSkillsCachePath(cwd), cache);
}

export interface ScanResult {
  skills: Skill[];
  stats: {
    total: number;
    newCount: number;
    updatedCount: number;
    unchangedCount: number;
    errorCount: number;
    directories: number;
    duration: number;
  };
  errors: Array<{ file: string; error: string }>;
}

export class SkillIndexer {
  private cwd: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
  }

  async scan(directories?: string[], patterns?: string[], force = false): Promise<ScanResult> {
    const startTime = Date.now();
    const config = await getConfig(this.cwd);
    const cache = force ? null : loadSkillsCache(this.cwd);

    const skillDirs = directories ||
      config.profiles[config.defaultProfile]?.skillDirs || ['./skills'];
    const skillPatterns = patterns || config.skillPatterns || ['**/SKILL.md'];

    const resolvedDirs = skillDirs
      .map((dir) => resolve(this.cwd, dir))
      .filter((dir) => dirExists(dir));

    const skills: Skill[] = [];
    const errors: Array<{ file: string; error: string }> = [];
    const newEntries: Record<string, SkillCacheEntry> = {};

    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const dir of resolvedDirs) {
      const files = await fg(skillPatterns, {
        cwd: dir,
        absolute: true,
        onlyFiles: true,
        followSymbolicLinks: false,
      });

      for (const filePath of files) {
        try {
          const content = readTextFile(filePath);
          const currentHash = hashContent(content);
          const cachedEntry = cache?.entries[filePath];

          if (cachedEntry && cachedEntry.hash === currentHash) {
            skills.push(cachedEntry.skill);
            newEntries[filePath] = cachedEntry;
            unchangedCount++;
            continue;
          }

          const skill = parseSkillContent(content, filePath);
          skills.push(skill);

          newEntries[filePath] = {
            skill,
            hash: currentHash,
            mtime: Date.now(),
          };

          if (cachedEntry) {
            updatedCount++;
          } else {
            newCount++;
          }
        } catch (error) {
          errorCount++;
          errors.push({
            file: filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    const newCache: SkillCache = {
      version: '1.0.0',
      entries: newEntries,
      lastScanAt: new Date().toISOString(),
    };
    saveSkillsCache(newCache, this.cwd);
    setLastScanAt(new Date(), this.cwd);

    const duration = Date.now() - startTime;

    return {
      skills,
      stats: {
        total: skills.length,
        newCount,
        updatedCount,
        unchangedCount,
        errorCount,
        directories: resolvedDirs.length,
        duration,
      },
      errors,
    };
  }

  async getForProfile(profileKey: string): Promise<Skill[]> {
    const cache = loadSkillsCache(this.cwd);
    if (!cache) {
      const result = await this.scan();
      return result.skills.filter((s) => matchesProfile(s, profileKey));
    }

    return Object.values(cache.entries)
      .map((entry) => entry.skill)
      .filter((skill) => matchesProfile(skill, profileKey));
  }

  async getAllSkills(): Promise<Skill[]> {
    const cache = loadSkillsCache(this.cwd);
    if (!cache) {
      const result = await this.scan();
      return result.skills;
    }
    return Object.values(cache.entries).map((entry) => entry.skill);
  }
}

export async function scanSkills(cwd?: string, force = false): Promise<ScanResult> {
  const indexer = new SkillIndexer(cwd);
  return indexer.scan(undefined, undefined, force);
}
