import crypto from "crypto";

// Encryption key - store this SECURELY in your .env file!
// Generate with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not defined in environment variables");
}

// Convert hex string to buffer
const key = Buffer.from(ENCRYPTION_KEY, "hex");

export const encryptMessage = (text) => {
  if (!text) return null;
  
  // Generate random IV (Initialization Vector)
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the message
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  // Get authentication tag
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Return iv + authTag + encrypted data (all needed for decryption)
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptMessage = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    // Split the encrypted data
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
};
