interface StoredKey {
    id: string;
    name: string;
    encryptedKey: string;
    createdAt: number;
    lastUsed: number;
    recoveryHint?: string;
}

interface KeyMetadata {
    id: string;
    name: string;
    createdAt: number;
    lastUsed: number;
    hasRecoveryHint: boolean;
}

export class KeyManagementService {
    private static readonly STORAGE_KEY = 'encryption_keys';
    private static readonly MAX_KEYS = 5;
    private static readonly RECOVERY_QUESTIONS = [
        "What was your first pet's name?",
        "What city were you born in?",
        "What was your childhood nickname?",
        "What was your first car?",
        "What elementary school did you attend?"
    ];

    static async storeKey(
        name: string,
        password: string,
        recoveryAnswer?: string
    ): Promise<string> {
        const keys = this.getStoredKeys();
        
        // Generate a unique ID for the key
        const keyId = crypto.randomUUID();

        // Encrypt the password with the recovery answer if provided
        let encryptedKey = await EncryptionService.encryptData(password, 'master-key');
        let recoveryHint: string | undefined;

        if (recoveryAnswer) {
            // Hash the recovery answer
            const recoveryHash = await this.hashRecoveryAnswer(recoveryAnswer);
            // Store the hint encrypted with the recovery hash
            recoveryHint = await EncryptionService.encryptData(password, recoveryHash);
        }

        // Add the new key
        const newKey: StoredKey = {
            id: keyId,
            name,
            encryptedKey,
            createdAt: Date.now(),
            lastUsed: Date.now(),
            recoveryHint
        };

        // Maintain key limit
        const updatedKeys = [newKey, ...keys.slice(0, this.MAX_KEYS - 1)];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedKeys));

        return keyId;
    }

    static async getKey(keyId: string): Promise<string | null> {
        const keys = this.getStoredKeys();
        const key = keys.find(k => k.id === keyId);
        
        if (!key) return null;

        try {
            // Decrypt the stored key
            const password = await EncryptionService.decryptData(
                key.encryptedKey,
                'master-key'
            );

            // Update last used timestamp
            this.updateKeyUsage(keyId);

            return password;
        } catch (error) {
            console.error('Failed to retrieve key:', error);
            return null;
        }
    }

    static async recoverKey(
        keyId: string,
        recoveryAnswer: string
    ): Promise<string | null> {
        const keys = this.getStoredKeys();
        const key = keys.find(k => k.id === keyId);
        
        if (!key || !key.recoveryHint) return null;

        try {
            // Hash the recovery answer
            const recoveryHash = await this.hashRecoveryAnswer(recoveryAnswer);
            
            // Attempt to decrypt the hint using the recovery hash
            const password = await EncryptionService.decryptData(
                key.recoveryHint,
                recoveryHash
            );

            return password;
        } catch (error) {
            console.error('Recovery failed:', error);
            return null;
        }
    }

    static getKeyMetadata(): KeyMetadata[] {
        return this.getStoredKeys().map(key => ({
            id: key.id,
            name: key.name,
            createdAt: key.createdAt,
            lastUsed: key.lastUsed,
            hasRecoveryHint: !!key.recoveryHint
        }));
    }

    static getRecoveryQuestions(): string[] {
        return [...this.RECOVERY_QUESTIONS];
    }

    static async validateRecoveryAnswer(answer: string): Promise<boolean> {
        // Implement answer strength validation
        return answer.length >= 3;
    }

    private static getStoredKeys(): StoredKey[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to retrieve stored keys:', error);
            return [];
        }
    }

    private static async hashRecoveryAnswer(answer: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(answer.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async createBackup(password: string): Promise<string> {
        try {
            const keys = this.getStoredKeys();
            const backupData = {
                version: '1.0',
                timestamp: Date.now(),
                keys,
                checksum: await this.generateChecksum(keys)
            };

            // Encrypt the backup with the provided password
            const encryptedBackup = await EncryptionService.encryptData(
                JSON.stringify(backupData),
                password
            );

            return encryptedBackup;
        } catch (error) {
            console.error('Backup creation failed:', error);
            throw new Error('Failed to create backup');
        }
    }

    static async restoreFromBackup(backupData: string, password: string): Promise<boolean> {
        try {
            // Decrypt the backup
            const decryptedData = await EncryptionService.decryptData(backupData, password);
            const backup = JSON.parse(decryptedData);

            // Validate backup format and version
            if (!this.validateBackup(backup)) {
                throw new Error('Invalid backup format');
            }

            // Verify checksum
            const calculatedChecksum = await this.generateChecksum(backup.keys);
            if (calculatedChecksum !== backup.checksum) {
                throw new Error('Backup integrity check failed');
            }

            // Merge with existing keys
            const existingKeys = this.getStoredKeys();
            const mergedKeys = this.mergeBackupKeys(existingKeys, backup.keys);

            // Save merged keys
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedKeys));

            return true;
        } catch (error) {
            console.error('Backup restoration failed:', error);
            throw error;
        }
    }

    private static async generateChecksum(data: any): Promise<string> {
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private static validateBackup(backup: any): boolean {
        return (
            backup &&
            backup.version &&
            backup.timestamp &&
            Array.isArray(backup.keys) &&
            backup.checksum &&
            backup.keys.every((key: any) => (
                key.id &&
                key.name &&
                key.encryptedKey &&
                key.createdAt
            ))
        );
    }

    private static mergeBackupKeys(existing: StoredKey[], backup: StoredKey[]): StoredKey[] {
        const keyMap = new Map<string, StoredKey>();

        // Add existing keys
        existing.forEach(key => keyMap.set(key.id, key));

        // Merge backup keys
        backup.forEach(key => {
            if (!keyMap.has(key.id)) {
                // New key from backup
                keyMap.set(key.id, key);
            } else {
                // Key exists - keep the newer version
                const existingKey = keyMap.get(key.id)!;
                if (key.lastUsed > existingKey.lastUsed) {
                    keyMap.set(key.id, key);
                }
            }
        });

        // Convert back to array and sort by last used
        return Array.from(keyMap.values())
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, this.MAX_KEYS);
    }

    private static updateKeyUsage(keyId: string): void {
        const keys = this.getStoredKeys();
        const updatedKeys = keys.map(key => 
            key.id === keyId
                ? { ...key, lastUsed: Date.now() }
                : key
        );
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedKeys));
    }
}
