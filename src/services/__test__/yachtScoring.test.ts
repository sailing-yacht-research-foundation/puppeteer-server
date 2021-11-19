import { launchBrowser } from '../../utils/puppeteerLauncher';
import yachtScoring from '../yachtScoring';

jest.mock('../../utils/puppeteerLauncher');

const mockLoginSuccessTableHtml = `<td align="center" colspan="4">
<b style="font-size: 14px">Yacht Scoring Administration</b>
<hr size="1" style="color: Navy" noshade="">
<b>Select the event you would like to work with:</b>
<br>(<i>If your Login is Inactive, please contact your Event Administrator</i>)
<hr size="1" style="color: Navy" noshade="">
</td>`;

const mockLoginSuccessWithEventsArray = [
  [
    '\n' +
      '\t<b style="font-size: 14px">Yacht Scoring Administration</b>\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t<b>Select the event you would like to work with:</b>\n' +
      '\t<br>(<i>If your Login is Inactive, please contact your Event Administrator</i>)\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t',
  ],
  [
    '<dd><b>Event Name</b></dd>',
    '<b>Event Date</b>',
    '<b>Event Status</b>',
    '<b>Login Status</b>',
  ],
  ['<hr size="1" style="color: Navy" noshade="">'],
  [
    '<dd><li><a href="./admin_main.cfm?Event_ID=12987">Spirit of Bermuda Charity Rally</a></li></dd>',
    '&nbsp; 06/Jul/2020 &nbsp;',
    '&nbsp; <i style="color: green">Active</i>&nbsp;',
    '&nbsp; <i style="color: green">Active</i>&nbsp;',
  ],
  [
    '\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t<a href="./logout.cfm"><b>Logout</b></a>\n' +
      '\t',
  ],
];

describe('yachtScoring - functions to test credentials of Yachtscoring.com, scrape events and yachts/crews data', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loginProcess - should return true if supplied credentials is correct', async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spy = jest.spyOn(page, '$eval');
    spy.mockImplementationOnce(async () => {
      return mockLoginSuccessTableHtml;
    });
    const result = await yachtScoring.loginProcess(page, {
      user: 'test',
      password: 'test',
    });

    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(page.waitForSelector).toHaveBeenCalledTimes(2);
    expect(page.type).toHaveBeenCalledTimes(2);
    expect(page.click).toHaveBeenCalledTimes(1);
    expect(page.waitForNavigation).toHaveBeenCalledTimes(1);

    expect(result).toEqual(true);
  });
  it('loginProcess - should return false if supplied credentials is incorrect', async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spy = jest.spyOn(page, '$eval');
    spy.mockImplementationOnce(async () => {
      throw new Error('Mocked error failed to find selector');
    });
    const result = await yachtScoring.loginProcess(page, {
      user: 'test',
      password: 'test',
    });

    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(page.waitForSelector).toHaveBeenCalledTimes(2);
    expect(page.type).toHaveBeenCalledTimes(2);
    expect(page.click).toHaveBeenCalledTimes(1);
    expect(page.waitForNavigation).toHaveBeenCalledTimes(1);

    expect(result).toEqual(false);
  });

  it('testCredentials - should fire up browser instance and return result of login process', async () => {
    const spy = jest.spyOn(yachtScoring, 'loginProcess');
    spy.mockImplementationOnce(async () => {
      return true;
    });
    const result = await yachtScoring.testCredentials('test', 'test');
    expect(result).toEqual(true);

    spy.mockImplementationOnce(async () => {
      return false;
    });
    const failedResult = await yachtScoring.testCredentials('test', 'test');
    expect(failedResult).toEqual(false);
  });

  it('fetchEvents - should return available events for that credentials', async () => {
    const spy = jest.spyOn(yachtScoring, 'loginProcess');
    spy.mockImplementationOnce(async () => {
      return true;
    });

    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spyPage = jest.spyOn(page, '$$eval');
    spyPage.mockImplementationOnce(async () => {
      return mockLoginSuccessWithEventsArray;
    });
    const result = await yachtScoring.fetchEvents('test', 'test');
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          link: expect.any(String),
          eventId: '12987',
          eventName: 'Spirit of Bermuda Charity Rally',
        }),
      ]),
    );
  });
});
