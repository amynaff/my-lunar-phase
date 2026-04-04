/**
 * Application-level encryption for sensitive health data.
 *
 * Uses AES-256-GCM which provides both confidentiality and integrity.
 * Each encrypted value gets its own random IV, so identical plaintext
 * produces different ciphertext every time.
 *
 * Requires ENCRYPTION_KEY env var (64-char hex string = 32 bytes).
 * Generate one with: openssl rand -hex 32
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate with: openssl rand -hex 32"
    );
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a string value.
 * Returns: base64 string containing IV + ciphertext + auth tag
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Pack: IV (16) + authTag (16) + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString("base64");
}

/**
 * Decrypt a string value.
 * Expects base64 string from encrypt().
 */
export function decrypt(encryptedBase64: string): string {
  const key = getKey();
  const packed = Buffer.from(encryptedBase64, "base64");

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Encrypt a JSON-serializable object.
 */
export function encryptJSON(data: unknown): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt back to a parsed object.
 */
export function decryptJSON<T = unknown>(encryptedBase64: string): T {
  return JSON.parse(decrypt(encryptedBase64)) as T;
}

/**
 * Encrypt a value only if ENCRYPTION_KEY is set.
 * Falls back to plain text in development if no key is configured.
 */
export function encryptIfAvailable(plaintext: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    return plaintext;
  }
  return encrypt(plaintext);
}

/**
 * Decrypt a value, falling back to returning as-is if it doesn't
 * look like encrypted data (for backward compatibility).
 */
export function decryptIfEncrypted(value: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    return value;
  }
  try {
    return decrypt(value);
  } catch {
    // Not encrypted (legacy data) — return as-is
    return value;
  }
}
