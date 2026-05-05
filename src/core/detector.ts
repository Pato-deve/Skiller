import path from 'path';
import { pathExists, readJsonSafe } from '../utils/fs.js';

export interface DetectionContext {
  cwd: string;
  packageJson: Record<string, any>;
  dependencies: string[];
}

type Matcher = (ctx: DetectionContext) => Promise<string[]> | string[];

// --- REGLAS HEURÍSTICAS ---

const dependencyMatcher: Matcher = (ctx) => {
  const tags = new Set<string>();
  const deps = ctx.dependencies;

  // Frontend / Frameworks
  if (deps.includes('react') || deps.includes('next')) {
    tags.add('react').add('frontend').add('web-design');
  }
  if (deps.includes('vue') || deps.includes('nuxt')) {
    tags.add('vue').add('frontend').add('web-design');
  }

  // Backend / APIs
  if (deps.includes('express') || deps.includes('fastify') || deps.includes('@nestjs/core')) {
    tags.add('node').add('backend').add('api');
  }

  // Bases de datos
  if (deps.includes('mongoose') || deps.includes('prisma') || deps.includes('pg') || deps.includes('typeorm')) {
    tags.add('database').add('backend');
  }

  // Styling
  if (deps.includes('tailwindcss') || deps.includes('styled-components')) {
    tags.add('frontend').add('web-design').add('styling');
  }

  return Array.from(tags);
};

const structureMatcher: Matcher = async (ctx) => {
  const tags = new Set<string>();

  // Verificamos archivos clave
  if (await pathExists(path.join(ctx.cwd, 'tsconfig.json'))) tags.add('typescript');
  if (await pathExists(path.join(ctx.cwd, 'next.config.js')) || await pathExists(path.join(ctx.cwd, 'next.config.mjs'))) {
    tags.add('nextjs').add('react').add('frontend');
  }
  
  // Verificamos carpetas clave
  if (await pathExists(path.join(ctx.cwd, 'src', 'app')) || await pathExists(path.join(ctx.cwd, 'pages'))) {
    tags.add('frontend');
  }

  // Infraestructura
  if (await pathExists(path.join(ctx.cwd, 'Dockerfile')) || await pathExists(path.join(ctx.cwd, 'docker-compose.yml'))) {
    tags.add('docker').add('infrastructure');
  }

  return Array.from(tags);
};

// --- MOTOR PRINCIPAL ---

export async function detectProjectStack(cwd: string): Promise<string[]> {
  // 1. Preparar contexto (lee package.json de forma segura)
  const pkgPath = path.join(cwd, 'package.json');
  const packageJson = await readJsonSafe(pkgPath);
  
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});
  const allDependencies = [...deps, ...devDeps];

  const context: DetectionContext = {
    cwd,
    packageJson,
    dependencies: allDependencies,
  };

  // 2. Ejecutar matchers en paralelo
  const matchers = [dependencyMatcher, structureMatcher];
  const results = await Promise.all(matchers.map(m => m(context)));

  // 3. Agregar y deduplicar
  const finalTags = new Set<string>();
  results.flat().forEach(tag => finalTags.add(tag));

  // Siempre agregamos el tag universal para skills que aplican a todo
  finalTags.add('universal');

  return Array.from(finalTags);
}
