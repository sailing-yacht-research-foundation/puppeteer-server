import * as dotenv from 'dotenv';
dotenv.config();
import { promisify } from 'util';
import { pbkdf2, randomBytes } from 'crypto';

const asyncRandomBytes = promisify(randomBytes);
const asyncPbkdf2 = promisify(pbkdf2);

let passphrase: string = "IT'S A SECRET OF SYRF!";
if (process.argv[2]) {
  passphrase = process.argv[2];
  console.log(`passphrase set to ${passphrase}`);
}
(async () => {
  const salt = await asyncRandomBytes(32);
  const iterations = 200;
  const keyByteLength = 32;

  const key = await asyncPbkdf2(
    passphrase,
    salt,
    iterations,
    keyByteLength,
    'sha256',
  );
  console.log(key.toString('hex'));
})();
