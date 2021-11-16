import path from 'path';
import puppeteer from 'puppeteer';
import Jimp from 'jimp';
import sharp from 'sharp';

// Need to have the file:// to work
const htmlPath = `file://${path.resolve(
  __dirname,
  '../assets/html/mapView.html',
)}`;
const OG_WIDTH = 1200;
const OG_HEIGHT = 627;
const LOGO_MARGIN_PERCENTAGE = 0.05;
const LOGO_SIZE_PERCENTAGE = 0.1;

export const createMapScreenshot = async (centerPosition: [number, number]) => {
  const mapboxId = process.env.MAPBOX_ID;
  const accessToken = process.env.MAPBOX_API_KEY;
  if (mapboxId === undefined || accessToken === undefined) {
    throw new Error('MAPBOX Credentials not set');
  }
  const latLon = [centerPosition[1], centerPosition[0]];
  const browser = await puppeteer.launch({
    // headless: false, // open this for testing
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--window-size=${OG_WIDTH},${OG_HEIGHT}`,
    ],
    defaultViewport: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    },
  });
  const page = await browser.newPage();

  await page.goto(htmlPath);
  await page.evaluate(initMap, {
    center: latLon,
    zoom: 8,
    tileLayerUrl: `https://api.mapbox.com/styles/v1/${mapboxId}/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
  });

  await page.evaluate(addMarker, latLon);
  await page.waitForNetworkIdle({
    idleTime: 1000,
  });
  const imageBuffer = await page.screenshot();

  const [image, logo] = await Promise.all([
    Jimp.read(imageBuffer as Buffer),
    Jimp.read(path.resolve(__dirname, '../assets/images/logo-light.png')),
  ]);
  logo.resize(image.bitmap.width * LOGO_SIZE_PERCENTAGE, Jimp.AUTO);

  const xMargin = image.bitmap.width * LOGO_MARGIN_PERCENTAGE;
  const yMargin = image.bitmap.height * LOGO_MARGIN_PERCENTAGE;
  const x = image.bitmap.width - logo.bitmap.width - xMargin;
  const y = image.bitmap.height - logo.bitmap.height - yMargin;

  image.composite(logo, x, y, {
    mode: Jimp.BLEND_SCREEN,
    opacitySource: 0.1,
    opacityDest: 1,
  });
  let finalImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
  try {
    const compressedBuffer = await sharp(finalImageBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    finalImageBuffer = compressedBuffer;
  } catch (error) {
    console.trace(error);
  }

  await browser.close();
  return finalImageBuffer;
};

// Browser run functions, we're not going to test this browser functions
// @ts-ignore
function initMap(config) {
  return new Promise((resolve) => {
    // @ts-ignore
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView(config.center, config.zoom);
    // @ts-ignore
    const tileLayer = L.tileLayer(config.tileLayerUrl).addTo(map);
    // @ts-ignore
    window.map = map;

    tileLayer.on('load', resolve);
  });
}

// @ts-ignore
function addMarker(coordinates) {
  // @ts-ignore
  L.marker(coordinates, {
    // @ts-ignore
    icon: L.divIcon({
      html: '<span style="font-size: 35px; color: #FFF;"><i class="fas fa-map-marker-alt"></i></span>',
      className: 'my-race',
      iconSize: [20, 20],
      iconAnchor: [18, 42],
    }),
    // @ts-ignore
  }).addTo(map);
}
