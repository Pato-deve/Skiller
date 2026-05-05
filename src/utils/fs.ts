import fs from 'fs/promises';
import path from 'path';

/**
 * Verifica de forma segura si una ruta (archivo o directorio) existe.
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee y parsea un archivo JSON de forma segura.
 * Si no existe o es inválido, retorna un objeto vacío.
 */
export async function readJsonSafe(targetPath: string): Promise<Record<string, any>> {
  try {
    const exists = await pathExists(targetPath);
    if (!exists) return {};

    const content = await fs.readFile(targetPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}
