export class EncryptionService {
    private static readonly SALT_LENGTH = 16;
    private static readonly IV_LENGTH = 12;
    private static readonly AUTH_TAG_LENGTH = 16;
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly KEY_ALGORITHM = 'PBKDF2';
    private static readonly KEY_LENGTH = 256;
    private static readonly ITERATIONS = 100000;

    static async encryptData(data: string, password: string): Promise<string> {
        try {
            // Generate a random salt
            const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            
            // Generate a key from the password
            const key = await this.generateKey(password, salt);
            
            // Generate a random IV
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
            
            // Encrypt the data
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(data);
            
            const encryptedContent = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                encodedData
            );

            // Combine salt, IV, and encrypted content
            const result = new Uint8Array(
                salt.length + iv.length + encryptedContent.byteLength
            );
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(
                new Uint8Array(encryptedContent),
                salt.length + iv.length
            );

            // Convert to base64
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    static async decryptData(encryptedData: string, password: string): Promise<string> {
        try {
            // Convert from base64
            const data = new Uint8Array(
                atob(encryptedData).split('').map(c => c.charCodeAt(0))
            );

            // Extract salt, IV, and encrypted content
            const salt = data.slice(0, this.SALT_LENGTH);
            const iv = data.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
            const content = data.slice(this.SALT_LENGTH + this.IV_LENGTH);

            // Generate the key from the password and salt
            const key = await this.generateKey(password, salt);

            // Decrypt the content
            const decryptedContent = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                content
            );

            // Convert back to string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedContent);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data: Invalid password or corrupted data');
        }
    }

    private static async generateKey(
        password: string,
        salt: Uint8Array
    ): Promise<CryptoKey> {
        // Convert password to key material
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Generate key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derive the actual key
        return await crypto.subtle.deriveKey(
            {
                name: this.KEY_ALGORITHM,
                salt: salt,
                iterations: this.ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    static validatePassword(password: string): {
        isValid: boolean;
        message?: string;
    } {
        if (password.length < 8) {
            return {
                isValid: false,
                message: 'Password must be at least 8 characters long'
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one uppercase letter'
            };
        }

        if (!/[a-z]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one lowercase letter'
            };
        }

        if (!/[0-9]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one number'
            };
        }

        return { isValid: true };
    }

    static generateRandomPassword(): string {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one of each required character type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

        // Fill the rest randomly
        while (password.length < length) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}