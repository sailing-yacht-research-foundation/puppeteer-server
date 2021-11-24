import { generateDateAuthFormat, generateSecret } from '../authUtils';

describe('Generate Date for Auth format', () => {
  test('Successfully return date with format', () => {
    const result = generateDateAuthFormat('2021-05-28');
    expect(result).toEqual(`2021 May 28, Fri`);
  });
});

describe('Generate secret for authentication', () => {
  test('Successfully return a secure hash from a string', () => {
    const result = generateSecret('this is a secret');
    expect(result).toEqual('7dbbcee180ba4d456e4aa1cfbdad9c7b');
  });
});
