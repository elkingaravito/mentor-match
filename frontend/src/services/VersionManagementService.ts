interface BackupVersion {
    id: string;
    timestamp: number;
    description: string;
    tags: string[];
    keyCount: number;
    size: number;
    checksum: string;
    parentVersion?: string;
    changes?: {
        added: number;
        modified: number;
        removed: number;
    };
}

interface Branch {
    name: string;
    description: string;
    createdAt: number;
    lastUpdated: number;
    headVersion: string;
    protected: boolean;
    tags: string[];
}

interface VersionMetadata {
    version: string;
    branchName: string;
    author: string;
    deviceId: string;
    commitMessage: string;
    timestamp: number;
    branchPoint?: string;  // ID of version where branch was created
    mergePoint?: string;   // ID of version where branch was merged
}

interface BranchDiff {
    commonAncestor: string;
    branchAVersions: BackupVersion[];
    branchBVersions: BackupVersion[];
    conflicts: {
        keyId: string;
        branchAVersion: string;
        branchBVersion: string;
    }[];
}

export class VersionManagementService {
    private static readonly VERSION_STORAGE_KEY = 'backup_versions';
    private static readonly MAX_VERSIONS = 10;

    static async createVersion(
        backupData: string,
        metadata: Partial<VersionMetadata>
    ): Promise<BackupVersion> {
        const versions = this.getVersionHistory();
        const latestVersion = versions[0];

        // Calculate changes from previous version
        const changes = latestVersion
            ? await this.calculateChanges(latestVersion.id, backupData)
            : { added: 0, modified: 0, removed: 0 };

        const newVersion: BackupVersion = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            description: metadata.commitMessage || 'Backup created',
            tags: [],
            keyCount: this.countKeys(backupData),
            size: new Blob([backupData]).size,
            checksum: await this.calculateChecksum(backupData),
            parentVersion: latestVersion?.id,
            changes
        };

        // Add to version history
        versions.unshift(newVersion);

        // Maintain version limit
        if (versions.length > this.MAX_VERSIONS) {
            versions.pop();
        }

        // Save updated history
        this.saveVersionHistory(versions);

        return newVersion;
    }

    static async getVersion(versionId: string): Promise<string | null> {
        try {
            const version = this.findVersion(versionId);
            if (!version) return null;

            const backupData = await this.retrieveBackupData(versionId);
            if (!backupData) return null;

            // Verify checksum
            const checksum = await this.calculateChecksum(backupData);
            if (checksum !== version.checksum) {
                throw new Error('Version checksum verification failed');
            }

            return backupData;
        } catch (error) {
            console.error('Failed to retrieve version:', error);
            return null;
        }
    }

    static getVersionHistory(): BackupVersion[] {
        try {
            const history = localStorage.getItem(this.VERSION_STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to get version history:', error);
            return [];
        }
    }

    static async compareVersions(
        versionId1: string,
        versionId2: string
    ): Promise<{
        added: string[];
        modified: string[];
        removed: string[];
    }> {
        const data1 = await this.getVersion(versionId1);
        const data2 = await this.getVersion(versionId2);

        if (!data1 || !data2) {
            throw new Error('Failed to retrieve versions for comparison');
        }

        return this.diffVersions(data1, data2);
    }

    static async tagVersion(
        versionId: string,
        tag: string
    ): Promise<void> {
        const versions = this.getVersionHistory();
        const version = versions.find(v => v.id === versionId);

        if (version) {
            if (!version.tags.includes(tag)) {
                version.tags.push(tag);
                this.saveVersionHistory(versions);
            }
        }
    }

    static async revertToVersion(versionId: string): Promise<string> {
        const targetVersion = await this.getVersion(versionId);
        if (!targetVersion) {
            throw new Error('Failed to retrieve target version');
        }

        // Create a new version with the reverted data
        const newVersion = await this.createVersion(targetVersion, {
            commitMessage: `Reverted to version ${versionId}`,
            branchName: 'main'
        });

        return newVersion.id;
    }

    private static async calculateChanges(
        previousVersionId: string,
        newData: string
    ): Promise<{ added: number; modified: number; removed: number }> {
        const previousData = await this.getVersion(previousVersionId);
        if (!previousData) {
            return { added: 0, modified: 0, removed: 0 };
        }

        const { added, modified, removed } = this.diffVersions(previousData, newData);
        return {
            added: added.length,
            modified: modified.length,
            removed: removed.length
        };
    }

    private static diffVersions(
        data1: string,
        data2: string
    ): { added: string[]; modified: string[]; removed: string[] } {
        const keys1 = new Set(this.extractKeys(data1));
        const keys2 = new Set(this.extractKeys(data2));

        return {
            added: Array.from(keys2).filter(key => !keys1.has(key)),
            removed: Array.from(keys1).filter(key => !keys2.has(key)),
            modified: Array.from(keys1).filter(key => {
                if (!keys2.has(key)) return false;
                return this.hasKeyChanged(data1, data2, key);
            })
        };
    }

    private static countKeys(data: string): number {
        return this.extractKeys(data).length;
    }

    private static extractKeys(data: string): string[] {
        try {
            const parsed = JSON.parse(data);
            return Object.keys(parsed.keys || {});
        } catch {
            return [];
        }
    }

    private static async calculateChecksum(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private static findVersion(versionId: string): BackupVersion | null {
        const versions = this.getVersionHistory();
        return versions.find(v => v.id === versionId) || null;
    }

    private static async retrieveBackupData(versionId: string): Promise<string | null> {
        // Implementation would depend on where/how backup data is stored
        return null;
    }

    private static readonly BRANCH_STORAGE_KEY = 'backup_branches';

    static async createBranch(
        name: string,
        fromVersion: string,
        description?: string
    ): Promise<Branch> {
        const branches = this.getBranches();
        if (branches.some(b => b.name === name)) {
            throw new Error(`Branch "${name}" already exists`);
        }

        const newBranch: Branch = {
            name,
            description: description || '',
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            headVersion: fromVersion,
            protected: false,
            tags: []
        };

        branches.push(newBranch);
        this.saveBranches(branches);

        return newBranch;
    }

    static async switchBranch(
        branchName: string,
        createIfNotExists: boolean = false
    ): Promise<Branch> {
        const branches = this.getBranches();
        let branch = branches.find(b => b.name === branchName);

        if (!branch && createIfNotExists) {
            const currentBranch = this.getCurrentBranch();
            branch = await this.createBranch(
                branchName,
                currentBranch.headVersion,
                `Created from ${currentBranch.name}`
            );
        } else if (!branch) {
            throw new Error(`Branch "${branchName}" does not exist`);
        }

        localStorage.setItem('current_branch', branchName);
        return branch;
    }

    static async mergeBranches(
        sourceBranch: string,
        targetBranch: string,
        strategy: 'fast-forward' | 'merge-commit' | 'squash' = 'merge-commit'
    ): Promise<string> {
        const diff = await this.compareBranches(sourceBranch, targetBranch);
        
        if (diff.conflicts.length > 0) {
            throw new Error('Cannot merge: branches have conflicts');
        }

        switch (strategy) {
            case 'fast-forward':
                return await this.fastForwardMerge(sourceBranch, targetBranch);
            case 'squash':
                return await this.squashMerge(sourceBranch, targetBranch);
            default:
                return await this.createMergeCommit(sourceBranch, targetBranch);
        }
    }

    static async compareBranches(
        branchA: string,
        branchB: string
    ): Promise<BranchDiff> {
        const branches = this.getBranches();
        const branchAData = branches.find(b => b.name === branchA);
        const branchBData = branches.find(b => b.name === branchB);

        if (!branchAData || !branchBData) {
            throw new Error('Branch not found');
        }

        const commonAncestor = await this.findCommonAncestor(
            branchAData.headVersion,
            branchBData.headVersion
        );

        const branchAVersions = await this.getVersionsSince(commonAncestor, branchA);
        const branchBVersions = await this.getVersionsSince(commonAncestor, branchB);

        const conflicts = await this.detectConflicts(branchAVersions, branchBVersions);

        return {
            commonAncestor,
            branchAVersions,
            branchBVersions,
            conflicts
        };
    }

    private static getBranches(): Branch[] {
        try {
            const branches = localStorage.getItem(this.BRANCH_STORAGE_KEY);
            return branches ? JSON.parse(branches) : [
                {
                    name: 'main',
                    description: 'Main branch',
                    createdAt: Date.now(),
                    lastUpdated: Date.now(),
                    headVersion: '',
                    protected: true,
                    tags: []
                }
            ];
        } catch (error) {
            console.error('Failed to get branches:', error);
            return [];
        }
    }

    private static saveBranches(branches: Branch[]): void {
        localStorage.setItem(this.BRANCH_STORAGE_KEY, JSON.stringify(branches));
    }

    private static getCurrentBranch(): Branch {
        const branchName = localStorage.getItem('current_branch') || 'main';
        const branch = this.getBranches().find(b => b.name === branchName);
        if (!branch) {
            throw new Error('Current branch not found');
        }
        return branch;
    }

    private static async findCommonAncestor(
        versionA: string,
        versionB: string
    ): Promise<string> {
        const historyA = await this.getVersionHistory(versionA);
        const historyB = await this.getVersionHistory(versionB);

        for (const version of historyA) {
            if (historyB.some(v => v.id === version.id)) {
                return version.id;
            }
        }

        throw new Error('No common ancestor found');
    }

    private static async fastForwardMerge(
        sourceBranch: string,
        targetBranch: string
    ): Promise<string> {
        const branches = this.getBranches();
        const source = branches.find(b => b.name === sourceBranch);
        const target = branches.find(b => b.name === targetBranch);

        if (!source || !target) {
            throw new Error('Branch not found');
        }

        target.headVersion = source.headVersion;
        target.lastUpdated = Date.now();

        this.saveBranches(branches);
        return target.headVersion;
    }

    private static async squashMerge(
        sourceBranch: string,
        targetBranch: string
    ): Promise<string> {
        const diff = await this.compareBranches(sourceBranch, targetBranch);
        const squashedChanges = this.squashChanges(diff.branchAVersions);

        const newVersion = await this.createVersion(squashedChanges, {
            branchName: targetBranch,
            commitMessage: `Squashed changes from ${sourceBranch}`,
            mergePoint: diff.branchAVersions[diff.branchAVersions.length - 1].id
        });

        return newVersion.id;
    }

    private static async createMergeCommit(
        sourceBranch: string,
        targetBranch: string
    ): Promise<string> {
        const branches = this.getBranches();
        const source = branches.find(b => b.name === sourceBranch);
        const target = branches.find(b => b.name === targetBranch);

        if (!source || !target) {
            throw new Error('Branch not found');
        }

        const mergeVersion = await this.createVersion(
            await this.getVersion(source.headVersion),
            {
                branchName: targetBranch,
                commitMessage: `Merge branch '${sourceBranch}' into ${targetBranch}`,
                mergePoint: source.headVersion
            }
        );

        target.headVersion = mergeVersion.id;
        target.lastUpdated = Date.now();

        this.saveBranches(branches);
        return mergeVersion.id;
    }

    private static saveVersionHistory(versions: BackupVersion[]): void {
        const currentBranch = this.getCurrentBranch();
        localStorage.setItem(
            `${this.VERSION_STORAGE_KEY}_${currentBranch.name}`,
            JSON.stringify(versions)
        );
    }

    private static async getVersionHistory(
        startVersion?: string
    ): Promise<BackupVersion[]> {
        const currentBranch = this.getCurrentBranch();
        const history = localStorage.getItem(
            `${this.VERSION_STORAGE_KEY}_${currentBranch.name}`
        );
        const versions = history ? JSON.parse(history) : [];

        if (startVersion) {
            const startIndex = versions.findIndex(v => v.id === startVersion);
            return versions.slice(startIndex);
        }

        return versions;
    }

    private static async getVersionsSince(
        startVersion: string,
        branchName: string
    ): Promise<BackupVersion[]> {
        const versions = await this.getVersionHistory();
        const startIndex = versions.findIndex(v => v.id === startVersion);
        return versions.slice(0, startIndex + 1);
    }

    private static async detectConflicts(
        versionsA: BackupVersion[],
        versionsB: BackupVersion[]
    ): Promise<{ keyId: string; branchAVersion: string; branchBVersion: string; }[]> {
        // Implement conflict detection logic
        return [];
    }

    private static squashChanges(versions: BackupVersion[]): string {
        // Implement changes squashing logic
        return '';
    }

    private static hasKeyChanged(data1: string, data2: string, key: string): boolean {
        try {
            const parsed1 = JSON.parse(data1);
            const parsed2 = JSON.parse(data2);
            return JSON.stringify(parsed1.keys[key]) !== JSON.stringify(parsed2.keys[key]);
        } catch {
            return false;
        }
    }
}
