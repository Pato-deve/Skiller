#!/usr/bin/env node
import pc from 'picocolors';
import readline from 'readline';
import { detectProjectStack } from './core/detector.js';
import { loadConfig, saveConfig } from './utils/config.js';
import { getSkillsFromDb, installSkill } from './core/skills.js';
import type { Skill } from './core/skills.js';

const SKILLER_ASCII = `
  ____  _  _____ _     _     _____ ____  
 / ___|| |/ /_ _| |   | |   | ____|  _ \\ 
 \\___ \\| ' / | || |   | |   |  _| | |_) |
  ___) | . \\ | || |___| |___| |___|  _ < 
 |____/|_|\\_\\___|_____|_____|_____|_| \\_\\
`;

// --- SISTEMA DE TEMAS ---
const THEMES = [
  { name: 'cyan', color: pc.cyan, bg: pc.bgCyan },
  { name: 'green', color: pc.green, bg: pc.bgGreen },
  { name: 'magenta', color: pc.magenta, bg: pc.bgMagenta },
  { name: 'yellow', color: pc.yellow, bg: pc.bgYellow },
];

// --- SISTEMA DE I18N (IDIOMAS) ---
const I18N = {
  es: {
    subtitle: '         Skill agent delivery\n',
    analyzing: 'Analizando dependencias y estructura del proyecto',
    no_skills: '⚠ No se encontraron skills compatibles. Saliendo...',
    provisioning: 'Aprovisionando',
    success: '✓ ¡Listo! Skills generadas exitosamente.',
    configured: '  Tus agentes ahora tienen el contexto configurado.\n',
    analysis_title: ' ANÁLISIS DE PROYECTO ',
    stack_detected: 'Stack detectado:',
    accept_btn: 'ACEPTAR E INSTALAR',
    skills_suffix: 'SKILLS',
    footer: '↑/↓: Navegar | Espacio: Marcar | →: Aceptar | L: Idioma | T: Tema | Ctrl+C: Salir'
  },
  en: {
    subtitle: '          Skill agent delivery\n',
    analyzing: 'Analyzing dependencies and project structure',
    no_skills: '⚠ No compatible skills found. Exiting...',
    provisioning: 'Provisioning',
    success: '✓ Done! Skills successfully generated.',
    configured: '  Your agents now have the configured context.\n',
    analysis_title: ' PROJECT ANALYSIS ',
    stack_detected: 'Detected stack:',
    accept_btn: 'ACCEPT AND INSTALL',
    skills_suffix: 'SKILLS',
    footer: '↑/↓: Navigate | Space: Toggle | →: Accept | L: Lang | T: Theme | Ctrl+C: Exit'
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let globalCleanup = () => {};

// Variables de estado global
let currentLang: 'es' | 'en' = 'es';
let currentThemeIdx = 0;

async function main() {
  const config = await loadConfig();
  currentLang = config.lang;
  currentThemeIdx = config.themeIdx;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdout.write('\x1B[?1049h\x1B[?25l');

  globalCleanup = () => {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdout.write('\x1B[?1049l\x1B[?25h');
    rl.close();
  };

  const handleGlobalQuit = (str: string, key: any) => {
    if (key.ctrl && key.name === 'c') {
      globalCleanup();
      process.exit(0);
    }
  };
  process.stdin.on('keypress', handleGlobalQuit);

  // ==========================================
  // FASE 1: SPINNER DE ANÁLISIS
  // ==========================================
  await new Promise<void>((resolve) => {
    const frames = ['/', '-', '\\', '|'];
    let ticks = 0;
    
    const interval = setInterval(() => {
      const theme = THEMES[currentThemeIdx] || THEMES[0]!;
      const lang = I18N[currentLang];
      
      process.stdout.write('\x1B[2J\x1B[H');
      
      console.log(theme.color(SKILLER_ASCII));
      console.log(theme.color(lang.subtitle));
      
      const spin = frames[ticks % frames.length];
      const dots = '.'.repeat(Math.floor(ticks / 3) % 4);
      
      console.log(theme.color(`  ${spin} ${lang.analyzing}${dots}`));
      
      ticks++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 1000);
  });

  // ==========================================
  // FASE 2: TUI INTERACTIVA
  // ==========================================
  process.stdin.removeListener('keypress', handleGlobalQuit);

  const detectedTags = await detectProjectStack(process.cwd()); 
  const allSkills = await getSkillsFromDb();
  
  // Mapping de tags a categorías de la DB
  const tagToCategoryMap: Record<string, string[]> = {
    'react': ['frontend', 'front-end', 'web-development'],
    'vue': ['frontend', 'front-end', 'web-development'],
    'frontend': ['frontend', 'front-end', 'web-development', 'design'],
    'backend': ['backend', 'api-integration', 'node'],
    'node': ['backend', 'node', 'development'],
    'typescript': ['development', 'coding', 'code'],
    'database': ['database', 'database-processing'],
    'docker': ['devops', 'cloud'],
    'infrastructure': ['devops', 'cloud'],
    'universal': ['productivity', 'writing', 'planning', 'meta']
  };

  const targetCategories = new Set<string>();
  detectedTags.forEach(tag => {
    const categories = tagToCategoryMap[tag] || [];
    categories.forEach(cat => targetCategories.add(cat));
  });

  const filteredSkills = allSkills.filter(skill => 
    targetCategories.has(skill.category || '') || 
    skill.id.includes('git') || // Siempre útil
    detectedTags.some(tag => skill.id.includes(tag) || skill.description.toLowerCase().includes(tag))
  ).slice(0, 50); // Limitamos a 50 para no romper la TUI por ahora

  if (filteredSkills.length === 0) {
    globalCleanup();
    console.clear();
    const theme = THEMES[currentThemeIdx] || THEMES[0]!;
    const lang = I18N[currentLang];
    console.log(theme.color(SKILLER_ASCII));
    console.log(pc.yellow(lang.no_skills));
    process.exit(0);
  }

  const selectedSkills = await renderCustomPrompt(filteredSkills, detectedTags);

  // ==========================================
  // FASE 3: INSTALACIÓN Y SALIDA
  // ==========================================
  globalCleanup(); 
  console.clear();
  
  process.stdout.write('\x1B[?25l'); 
  
  const theme = THEMES[currentThemeIdx] || THEMES[0]!;
  const lang = I18N[currentLang];

  console.log(theme.color(SKILLER_ASCII));
  console.log(theme.color(lang.subtitle));

  if (selectedSkills.length === 0) {
    console.log(pc.yellow(lang.no_skills));
    process.stdout.write('\x1B[?25h');
    process.exit(0);
  }

  for (const skill of selectedSkills) {
    process.stdout.write('\r\x1B[K');
    process.stdout.write(theme.color(`  ➜ ${lang.provisioning} ${skill.name}...`));
    await installSkill(skill, process.cwd());
    await sleep(200);
  }

  console.log('\n' + pc.green(lang.success));
  console.log(pc.dim(lang.configured));
  
  process.stdout.write('\x1B[?25h'); 
  process.exit(0);
}

function renderCustomPrompt(options: Skill[], detectedTags: string[]): Promise<Skill[]> {
  return new Promise((resolve) => {
    let cursor = 0;
    let scrollOffset = 0;
    const PAGE_SIZE = 12;
    const selected = new Set<number>();
    const totalItems = options.length + 1; 

    const render = () => {
      const theme = THEMES[currentThemeIdx] || THEMES[0]!;
      const lang = I18N[currentLang];

      process.stdout.write('\x1B[2J\x1B[H');
      
      console.log(theme.color(SKILLER_ASCII));
      console.log(theme.color(lang.subtitle));
      
      console.log(theme.bg(pc.black(lang.analysis_title)) + ` ${lang.stack_detected} ${detectedTags.join(', ')}\n`);

      const visibleOptions = options.slice(scrollOffset, scrollOffset + PAGE_SIZE);

      options.forEach((opt, i) => {
        if (i < scrollOffset || i >= scrollOffset + PAGE_SIZE) return;

        const isSelected = selected.has(i);
        const isHovered = cursor === i;
        const checkbox = isSelected ? pc.green('[x]') : pc.dim('[ ]');
        const prefix = isHovered ? theme.color('❯') : ' ';
        
        let line = `  ${prefix} ${checkbox} ${pc.bold(opt.name.padEnd(30))} ${pc.dim(opt.description.substring(0, 50) + '...')}`;
        
        if (isHovered) {
          console.log(theme.color(line)); 
        } else {
          console.log(line);
        }
      });

      if (options.length > PAGE_SIZE) {
        console.log(pc.dim(`\n  (Mostrando ${scrollOffset + 1}-${Math.min(scrollOffset + PAGE_SIZE, options.length)} de ${options.length})`));
      } else {
        console.log('');
      }

      const acceptHovered = cursor === options.length;
      const acceptText = `  [ ${lang.accept_btn} (${selected.size} ${lang.skills_suffix}) ]  `;
      
      if (acceptHovered) {
        console.log('\n  ' + theme.bg(pc.black(acceptText.trim())));
      } else {
        console.log('\n  ' + pc.dim(acceptText.trim()));
      }

      console.log('\n');
      console.log(pc.dim('─'.repeat(75)));
      console.log(theme.color(`  ${lang.footer}`));
    };

    const handleKeypress = (str: string, key: any) => {
      if (key.ctrl && key.name === 'c') {
        globalCleanup();
        process.exit(0);
      }
      
      if (key.name === 'l') {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        saveConfig({ lang: currentLang, themeIdx: currentThemeIdx }).catch(() => {});
        render();
        return;
      }
      if (key.name === 't') {
        currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
        saveConfig({ lang: currentLang, themeIdx: currentThemeIdx }).catch(() => {});
        render();
        return;
      }

      if (key.name === 'up') {
        cursor = cursor > 0 ? cursor - 1 : totalItems - 1;
        if (cursor < scrollOffset && cursor < options.length) {
          scrollOffset = cursor;
        } else if (cursor === totalItems - 1) {
          scrollOffset = Math.max(0, options.length - PAGE_SIZE);
        }
        render();
      } else if (key.name === 'down') {
        cursor = cursor < totalItems - 1 ? cursor + 1 : 0;
        if (cursor >= scrollOffset + PAGE_SIZE && cursor < options.length) {
          scrollOffset = cursor - PAGE_SIZE + 1;
        } else if (cursor === 0) {
          scrollOffset = 0;
        }
        render();
      } else if (key.name === 'right') {
        cursor = options.length; 
        render();
      } else if (key.name === 'space' || (key.name === 'return' && cursor === options.length)) {
        if (cursor === options.length) {
          process.stdin.removeListener('keypress', handleKeypress);
          const selectedSkills = options.filter((_, i) => selected.has(i));
          resolve(selectedSkills);
        } else {
          if (selected.has(cursor)) {
            selected.delete(cursor);
          } else {
            selected.add(cursor);
          }
          render();
        }
      }
    };

    process.stdin.on('keypress', handleKeypress);
    render();
  });
}

main().catch(err => {
  globalCleanup();
  console.error(err);
});
