import path from 'path';
import puppeteer from 'puppeteer';
import Jimp from 'jimp';
import sharp from 'sharp';

const { createMapScreenshot } = require('../../utils/createMapScreenshot');

// ==== Puppeteer related mocks ====
const mockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
  waitForNetworkIdle: jest.fn(),
  screenshot: jest.fn(async () => {
    const image: Jimp = await new Promise((resolve, reject) => {
      new Jimp(300, 530, 'white', (err, image) => {
        if (err) reject(err);
        resolve(image);
      });
    });

    return image.getBufferAsync(Jimp.MIME_PNG);
  }),
};
const mockBrowser = {
  newPage: jest.fn(() => {
    return mockPage;
  }),
  close: jest.fn(),
};
jest.mock('puppeteer', () => {
  return {
    launch: jest.fn(() => {
      return mockBrowser;
    }),
  };
});
// ==== Puppeteer related mocks ====
describe('createMapScreenshot - function to generate an open graph image of a competition / event', () => {
  const originalMapboxId = process.env.MAPBOX_ID;
  const originalApiKey = process.env.MAPBOX_API_KEY;
  beforeAll(() => {
    // We don't need to actually create a map page. This serves to make sure test run if no env is set
    process.env.MAPBOX_ID = 'id';
    process.env.MAPBOX_API_KEY = 'key';
  });
  afterAll(() => {
    process.env.MAPBOX_ID = originalMapboxId;
    process.env.MAPBOX_API_KEY = originalApiKey;
    jest.resetAllMocks();
  });
  it('should fire up puppeteer instance, and return buffer of the image', async () => {
    const spy = jest.spyOn(Jimp, 'read');
    const result = await createMapScreenshot([106.6380912, -6.259368]);
    expect(result).toBeInstanceOf(Buffer);

    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.goto).toHaveBeenCalledTimes(1);
    expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    expect(mockPage.waitForNetworkIdle).toHaveBeenCalledTimes(1);
    expect(mockPage.screenshot).toHaveBeenCalledTimes(1);
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);

    expect(spy).toHaveBeenCalledTimes(2);

    const image = await Jimp.read(result);
    expect(image.getMIME()).toEqual(Jimp.MIME_JPEG);
  }, 10000);
  it('should throw error when no required environment is setup', async () => {
    delete process.env.MAPBOX_ID;
    delete process.env.MAPBOX_API_KEY;
    try {
      await createMapScreenshot([106.6380912, -6.259368]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual('MAPBOX Credentials not set');
    }
  });
});
