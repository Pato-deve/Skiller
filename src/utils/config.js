import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { pathExists, readJsonSafe } from './fs.js';
const DEFAULT_CONFIG = {
    lang: 'en', // Inglés por defecto
    themeIdx: 0,
};
function getConfigPath() {
    const homeDir = os.homedir();
    return path.join(homeDir, '.skiller', 'config.json');
}
export async function loadConfig() {
    const configPath = getConfigPath();
    const exists = await pathExists(configPath);
    if (!exists)
        return DEFAULT_CONFIG;
    const data = await readJsonSafe(configPath);
    return { ...DEFAULT_CONFIG, ...data };
}
export async function saveConfig(config) {
    try {
        const configPath = getConfigPath();
        const dirPath = path.dirname(configPath);
        const exists = await pathExists(dirPath);
        if (!exists) {
            await fs.mkdir(dirPath, { recursive: true });
        }
        const currentConfig = await loadConfig();
        const newConfig = { ...currentConfig, ...config };
        await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
    }
    catch (error) {
        // Si falla la escritura (ej. permisos), lo ignoramos silenciosamente
        // ya que no debería bloquear la ejecución de la CLI.
    }
}
//# sourceMappingURL=config.js.map