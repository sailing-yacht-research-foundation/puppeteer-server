import { aes256GCM } from '../aesCrypto';

describe('aesCrypto - functions to generate encrypted message, or decrypt the cipher using AES', () => {
  it('aes256GCM - should return encryptor & decryptor with provided key using Galois/Counter Mode', async () => {
    const key =
      '1c2d78b421b5565982c9de306e3ccc996f84053d3f2e8009591ce273f44fe133';
    const { encrypt, decrypt } = aes256GCM(key);
    expect(typeof encrypt).toBe('function');
    expect(typeof decrypt).toBe('function');

    const plainMessage = 'This is a test';
    const cipher1 = await encrypt(plainMessage);
    const cipher2 = await encrypt(plainMessage);

    expect(cipher1).not.toEqual(plainMessage);
    expect(cipher2).not.toEqual(plainMessage);
    expect(cipher1).not.toEqual(cipher2);

    const decrypted1 = decrypt(cipher1);
    const decrypted2 = decrypt(cipher2);

    expect(decrypted1).toEqual(decrypted2);
    expect(decrypted1).toEqual(plainMessage);
  });
});
