export interface DetectionContext {
    cwd: string;
    packageJson: Record<string, any>;
    dependencies: string[];
}
export declare function detectProjectStack(cwd: string): Promise<string[]>;
//# sourceMappingURL=detector.d.ts.map