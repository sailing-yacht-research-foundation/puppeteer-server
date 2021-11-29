import { createHash } from 'crypto';

const MONTHS: { [key: number]: string } = {
  [0]: 'January',
  [1]: 'February',
  [2]: 'March',
  [3]: 'April',
  [4]: 'May',
  [5]: 'June',
  [6]: 'July',
  [7]: 'August',
  [8]: 'September',
  [9]: 'October',
  [10]: 'November',
  [11]: 'December',
};

const DAY: { [key: number]: string } = {
  [0]: 'Sunday',
  [1]: 'Monday',
  [2]: 'Tuesday',
  [3]: 'Wednesday',
  [4]: 'Thursday',
  [5]: 'Friday',
  [6]: 'Saturday',
};

export const generateDateAuthFormat = (inputDate?: string) => {
  let currentDate = inputDate ? new Date(inputDate) : new Date();
  return `${currentDate.getUTCFullYear()} ${String(
    MONTHS[currentDate.getUTCMonth()],
  ).substring(0, 3)} ${currentDate.getUTCDate()}, ${String(
    DAY[currentDate.getUTCDay()],
  ).substring(0, 3)}`;
};

export const generateSecret = (plainText: string) => {
  return createHash('md5').update(plainText).digest('hex');
};
