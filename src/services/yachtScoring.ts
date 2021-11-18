import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

import logger from '../logger';
import { closePageAndBrowser, launchBrowser } from '../utils/puppeteerLauncher';

const YS_LOGIN_PAGE = 'https://yachtscoring.com/admin_login.cfm';
const YS_LOGIN_INPUT_USER = 'loginuser';
const YS_LOGIN_INPUT_PASS = 'loginpass';
const YS_LOGIN_TIMEOUT = 10000;
const YS_REDIRECT_TIMEOUT = 5000;
const YS_MAIN_TABLE_LOGGED_IN_SELECTOR =
  'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr';
const YS_YACHT_TABLE_SELECTOR =
  'body > table:nth-child(2) > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr';

// All of the scrape process will require login first and it's a repetitive task
// This function should serve as the initial process for all f(x)
export const loginProcess = async (
  page: puppeteer.Page,
  credentials: { user: string; password: string },
) => {
  const { user, password } = credentials;
  let isSuccessful = false;
  try {
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
      YS_MAIN_TABLE_LOGGED_IN_SELECTOR,
      (element) => {
        return element.innerHTML;
      },
    );
    isSuccessful = loginResultHtml.includes(
      'Select the event you would like to work with',
    );
  } catch (error) {
    logger.error(`Failed to login to YS (user: ${user}) - `, error);
  }

  return isSuccessful;
};

export const testCredentials = async (user: string, password: string) => {
  logger.info('YachtScoring.com Login process started');
  const browser = await launchBrowser();
  let isSuccessful = false;
  let page: puppeteer.Page | undefined;
  try {
    page = await browser.newPage();
    isSuccessful = await loginProcess(page, { user, password });
  } catch (error) {
    logger.error(`Unexpected error - yachtScoring.testCredentials - `, error);
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
  logger.info('YachtScoring.com fetch event process started');
  const browser = await launchBrowser();
  let page: puppeteer.Page | undefined;
  let events: {
    link: string | undefined;
    eventId: string | undefined;
    eventName: string;
  }[] = [];
  try {
    page = await browser.newPage();
    const isLoggedIn = await loginProcess(page, { user, password });

    if (!isLoggedIn) {
      throw new Error('Failed to fetch events - Login Failed');
    }
    const mainTableRows = await page.$$eval(
      YS_MAIN_TABLE_LOGGED_IN_SELECTOR,
      (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, (column) => column.innerHTML);
        });
      },
    );

    events = mainTableRows
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
  } catch (error) {
    logger.error(`Failed to fetch events from YS (user: ${user}) - `, error);
  } finally {
    closePageAndBrowser({ page, browser });
  }
  return events;
};

export const scrapeEventById = async (
  user: string,
  password: string,
  eventId: string,
) => {
  logger.info('YachtScoring.com scrape event started');
  const browser = await launchBrowser();
  let page: puppeteer.Page | undefined;
  let yachts: {
    id: string;
    circle: string;
    division: string;
    class: string;
    altClass: string;
    sailNumber: string;
    yachtName: string;
    ownerName: string;
    yachtType: string;
    length: number;
    origin: string;
    paid: boolean;
  }[] = [];
  try {
    page = await browser.newPage();
    const isLoggedIn = await loginProcess(page, { user, password });

    if (!isLoggedIn) {
      throw new Error('Failed to fetch events - Login Failed');
    }

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

    // Click the link with selected event, wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: YS_REDIRECT_TIMEOUT }),
      page.click(`a[href$="${eventId}"]`),
    ]);

    // Click the link of yacht list, wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: YS_REDIRECT_TIMEOUT }),
      page.click(`a[href="./edit_yacht_list.cfm"]`),
    ]);

    // Parse the table containing available yachts, filter useless rows, map into object
    const yachtTableRows = await page.$$eval(
      YS_YACHT_TABLE_SELECTOR,
      (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, (column) => column.innerHTML);
        });
      },
    );
    yachts = yachtTableRows
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

    // Click the link to main menu, wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: YS_REDIRECT_TIMEOUT }),
      page.click(`a[href="./admin_main.cfm"]`),
    ]);
    // Click the link of crew list, wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: YS_REDIRECT_TIMEOUT }),
      page.click(`a[href="./crew_list_report.cfm"]`),
    ]);

    // TODO: Enable chrome visual, Fetch the crews for each yacht
  } catch (error) {
    logger.error(
      `Failed to fetch event data from YS (user: ${user}) - `,
      error,
    );
  } finally {
    closePageAndBrowser({ page, browser });
  }

  return {
    yachts,
  };
};
