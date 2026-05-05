import fs from 'fs/promises';
import path from 'path';
import { pathExists, readJsonSafe } from '../utils/fs.js';

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  category?: string;
  tags?: string[];
}

const DB_PATH = path.join(process.cwd(), 'database', 'antigravity-awesome-skills');
const INDEX_FILE = path.join(DB_PATH, 'skills_index.json');

export async function getSkillsFromDb(): Promise<Skill[]> {
  const index = await readJsonSafe(INDEX_FILE);
  if (!Array.isArray(index)) return [];

  return index.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    path: path.join(DB_PATH, item.path),
    category: item.category,
    tags: [item.category, ...(item.tags || [])].filter(Boolean)
  }));
}

export async function installSkill(skill: Skill, projectRoot: string): Promise<void> {
  const targetDir = path.join(projectRoot, '.agents', 'skills', skill.id);
  const sourceFile = path.join(skill.path, 'SKILL.md');

  if (!(await pathExists(sourceFile))) {
    throw new Error(`Source SKILL.md not found at ${sourceFile}`);
  }

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(sourceFile, path.join(targetDir, 'SKILL.md'));

  // Also copy resources or templates if they exist
  const resourcesDir = path.join(skill.path, 'resources');
  if (await pathExists(resourcesDir)) {
    await copyDir(resourcesDir, path.join(targetDir, 'resources'));
  }
}

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
