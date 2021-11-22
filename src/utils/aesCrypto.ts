import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const asyncRandomBytes = promisify(randomBytes);

export const aes256GCM = (key: string) => {
  const ALGO = 'aes-256-gcm';
  const keyInBytes = Buffer.from(key, 'hex');

  const encrypt = async (str: string) => {
    const iv = Buffer.from(await asyncRandomBytes(12));
    const cipher = createCipheriv(ALGO, keyInBytes, iv, {
      authTagLength: 16,
    });
    let encrypted = cipher.update(str, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag();
    const finalResult = Buffer.concat([
      Buffer.from(encrypted, 'base64'),
      tag,
      iv,
    ]);
    return finalResult.toString('base64');
  };

  const decrypt = (encryptedMsg: string) => {
    const encryptedBuffer = Buffer.from(encryptedMsg, 'base64');
    const iv = encryptedBuffer.slice(
      encryptedBuffer.length - 12,
      encryptedBuffer.length,
    );
    const authTag = encryptedBuffer.slice(
      encryptedBuffer.length - 28,
      encryptedBuffer.length - 12,
    );
    const contentBuffer = encryptedBuffer.slice(0, encryptedBuffer.length - 28);
    const decipher = createDecipheriv(ALGO, keyInBytes, iv);
    decipher.setAuthTag(authTag);
    let str = decipher.update(contentBuffer, undefined, 'utf-8');
    str += decipher.final('utf8');
    return str;
  };

  return {
    encrypt,
    decrypt,
  };
};
