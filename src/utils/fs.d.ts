/**
 * Verifica de forma segura si una ruta (archivo o directorio) existe.
 */
export declare function pathExists(targetPath: string): Promise<boolean>;
/**
 * Lee y parsea un archivo JSON de forma segura.
 * Si no existe o es inválido, retorna un objeto vacío.
 */
export declare function readJsonSafe(targetPath: string): Promise<Record<string, any>>;
//# sourceMappingURL=fs.d.ts.map