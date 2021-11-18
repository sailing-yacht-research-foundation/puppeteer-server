import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

const asyncRandomBytes = promisify(randomBytes);

export const aes256GCM = (key: string) => {
  const ALGO = 'aes-256-gcm';

  const encrypt = async (str: string) => {
    const iv = Buffer.from(await asyncRandomBytes(16));
    const cipher = createCipheriv(ALGO, key, iv, {
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
      encryptedBuffer.length - 16,
      encryptedBuffer.length,
    );
    const authTag = encryptedBuffer.slice(
      encryptedBuffer.length - 32,
      encryptedBuffer.length - 16,
    );
    const contentBuffer = encryptedBuffer.slice(0, encryptedBuffer.length - 32);
    const decipher = createDecipheriv(ALGO, key, iv);
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
