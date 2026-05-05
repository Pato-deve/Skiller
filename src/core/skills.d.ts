export interface Skill {
    id: string;
    name: string;
    description: string;
    path: string;
    category?: string;
    tags?: string[];
}
export declare function getSkillsFromDb(): Promise<Skill[]>;
export declare function installSkill(skill: Skill, projectRoot: string): Promise<void>;
//# sourceMappingURL=skills.d.ts.map