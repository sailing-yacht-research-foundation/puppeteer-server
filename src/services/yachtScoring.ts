import puppeteer from 'puppeteer';
import logger from '../logger';

const YS_LOGIN_PAGE = 'https://yachtscoring.com/admin_login.cfm';
const YS_LOGIN_INPUT_USER = 'loginuser';
const YS_LOGIN_INPUT_PASS = 'loginpass';
const YS_LOGIN_TIMEOUT = 5000;

export const testCredentials = async (user: string, password: string) => {
  logger.info('YachtScoring.com Login process started');
  const browser = await puppeteer.launch({
    // headless: false, // open this for testing
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-zygote',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ],
  });
  let isSuccessful = false;
  try {
    const page = await browser.newPage();

    await page.goto(YS_LOGIN_PAGE);
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_USER}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_USER}]`, user, { delay: 20 });
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_PASS}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_PASS}]`, password, {
      delay: 20,
    });
    await page.click('input[type="submit"]');
    const successPromise = new Promise<boolean>(async (resolve) => {
      try {
        await page.waitForFunction(
          'document.querySelector("body").innerText.includes("Select the event you would like to work with")',
          { timeout: YS_LOGIN_TIMEOUT },
        );
        resolve(true);
      } catch (error) {}
    });
    const failedPromise = new Promise<boolean>(async (resolve) => {
      try {
        await page.waitForFunction(
          'document.querySelector("body").innerText.includes("We were unable to verify your login")',
          { timeout: YS_LOGIN_TIMEOUT },
        );
        resolve(false);
      } catch (error) {}
    });
    isSuccessful = await Promise.race([successPromise, failedPromise]);
  } catch (error) {
    logger.error(`Failed to login to YS (user: ${user}) - `, error);
  } finally {
    await browser.close();
  }
  logger.info(
    `YachtScoring.com Login process finished. Result: ${
      isSuccessful ? 'Success' : 'Fail'
    }`,
  );
  return isSuccessful;
};
