export interface UserConfig {
    lang: 'en' | 'es';
    themeIdx: number;
}
export declare function loadConfig(): Promise<UserConfig>;
export declare function saveConfig(config: Partial<UserConfig>): Promise<void>;
//# sourceMappingURL=config.d.ts.map