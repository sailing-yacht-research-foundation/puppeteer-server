import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import logger from '../logger';
import { closePageAndBrowser, launchBrowser } from '../utils/puppeteerLauncher';

const YS_LOGIN_PAGE = 'https://yachtscoring.com/admin_login.cfm';
const YS_LOGIN_INPUT_USER = 'loginuser';
const YS_LOGIN_INPUT_PASS = 'loginpass';
const YS_LOGIN_TIMEOUT = 5000;

export const testCredentials = async (user: string, password: string) => {
  logger.info('YachtScoring.com Login process started');
  const browser = await launchBrowser();
  let isSuccessful = false;
  let page: puppeteer.Page | undefined;
  try {
    page = await browser.newPage();
    if (!page) {
      throw new Error('Page failed to initialize');
    }

    await page.goto(YS_LOGIN_PAGE);
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_USER}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_USER}]`, user, { delay: 20 });
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_PASS}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_PASS}]`, password, {
      delay: 20,
    });
    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click('input[type="submit"]'),
    ]);
    const loginResultHtml = await page.$eval(
      'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr',
      (element) => {
        return element.innerHTML;
      },
    );

    isSuccessful = loginResultHtml.includes(
      'Select the event you would like to work with',
    );
  } catch (error) {
    logger.error(`Failed to login to YS (user: ${user}) - `, error);
  } finally {
    closePageAndBrowser({ page, browser });
  }
  logger.info(
    `YachtScoring.com Login process finished. Result: ${
      isSuccessful ? 'Success' : 'Fail'
    }`,
  );
  return isSuccessful;
};

// F(x) belows are WIP. Not clear how we will store the data, so this function works, but still rough draft

export const fetchEvents = async (user: string, password: string) => {
  logger.info('YachtScoring.com fetch process started');
  const browser = await puppeteer.launch({
    headless: false, // open this for testing
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
  try {
    const page = await browser.newPage();

    await page.goto(YS_LOGIN_PAGE);
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_USER}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_USER}]`, user, { delay: 20 });
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_PASS}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_PASS}]`, password, {
      delay: 20,
    });
    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click('input[type="submit"]'),
    ]);

    const mainTableRows = await page.$$eval(
      'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr',
      (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll('td');
          // return columns;
          return Array.from(columns, (column) => column.innerHTML);
        });
      },
    );
    if (mainTableRows.length === 0) {
      throw new Error('Unable to get any events');
    }

    const events = mainTableRows
      .filter((row) => {
        return !(row.length < 4 || !row[0].includes('Event_ID='));
      })
      .map((row) => {
        const $ = cheerio.load(row[0]);
        return {
          link: $('a').attr('href'),
          eventId: $('a')
            .attr('href')
            ?.split('admin_main.cfm?')[1]
            .split('=')[1],
          eventName: $('a').text(),
        };
      });

    console.table(events);
    // === Quick Note selectors | Remove after dev
    // selectors guide: https://api.jquery.com/category/selectors/
    // = is exactly equal
    // != is not equal
    // ^= is starts with
    // $= is ends with
    // *= is contains
    // ~= is contains word
    // |= is starts with prefix (i.e., |= "prefix" matches "prefix-...")
    // ===
    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click('a[href$="12987"]'),
    ]);
    await page.waitForNetworkIdle({ idleTime: 5000 });
  } catch (error) {
    logger.error(`Failed to fetch events from YS (user: ${user}) - `, error);
  } finally {
    await browser.close();
  }
};

export const scrapeEventById = async (
  user: string,
  password: string,
  eventId: string,
) => {
  logger.info('YachtScoring.com scrape event started');
  const browser = await puppeteer.launch({
    headless: false, // open this for testing
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
  try {
    const page = await browser.newPage();

    await page.goto(YS_LOGIN_PAGE);
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_USER}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_USER}]`, user, { delay: 20 });
    await page.waitForSelector(`input[name=${YS_LOGIN_INPUT_PASS}]`);
    await page.type(`input[name=${YS_LOGIN_INPUT_PASS}]`, password, {
      delay: 20,
    });
    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click('input[type="submit"]'),
    ]);

    const mainTableRows = await page.$$eval(
      'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr',
      (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, (column) => column.innerHTML);
        });
      },
    );
    if (mainTableRows.length === 0) {
      throw new Error('Unable to get any events');
    }

    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click(`a[href$="${eventId}"]`),
    ]);

    await Promise.all([
      page.waitForNavigation({ timeout: YS_LOGIN_TIMEOUT }),
      page.click(`a[href="./edit_yacht_list.cfm"]`),
    ]);

    const yachtTableRows = await page.$$eval(
      'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr',
      (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, (column) => column.innerHTML);
        });
      },
    );
    const yachts = yachtTableRows
      .filter((row) => {
        return !(row.length < 15 || row[0] === '');
      })
      .map((row) => {
        return {
          id: row[1],
          circle: row[3],
          division: row[4],
          class: row[5],
          altClass: row[6],
          sailNumber: row[7],
          yachtName: row[8],
          ownerName: row[9],
          yachtType: row[10],
          length: parseFloat(row[11]),
          origin: row[12],
          paid: row[13].includes('Yes'),
        };
      });
    logger.info(yachts);

    await page.waitForNetworkIdle({ idleTime: 5000 });
  } catch (error) {
    logger.error(`Failed to fetch events from YS (user: ${user}) - `, error);
  } finally {
    await browser.close();
  }
};
