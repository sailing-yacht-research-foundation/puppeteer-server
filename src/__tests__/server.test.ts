import { Express } from 'express';
import supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { externalServiceSources } from '../models/syrf-schema/enums';
import * as yachtScoringJob from '../jobs/yachtScoringJob';

import createServer from '../server';

jest.mock('../jobs/yachtScoringJob', () => {
  return {
    addJob: jest.fn(),
  };
});
jest.mock('../models');
jest.mock('../utils/createMapScreenshot');

describe('HTTP Server for Puppeteer Server', () => {
  let app: Express;
  beforeAll(() => {
    app = createServer();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET / [Base endpoint]', (done) => {
    supertest(app)
      .get('/')
      .expect(200)
      .then((response) => {
        expect(response.text).toBe('SYRF - Puppeteer Service');
        done();
      });
  });

  test('GET /health [Health Check]', (done) => {
    supertest(app)
      .get('/health')
      .expect(200)
      .then((response) => {
        const data = JSON.parse(response.text);
        expect(data).toMatchObject({
          message: 'OK',
        });
        expect(typeof data.timestamp).toBe('number');
        done();
      });
  });

  test('POST /v1/external-platform/add-credentials - Success', (done) => {
    const spy = jest.spyOn(yachtScoringJob, 'addJob');
    // @ts-ignore
    spy.mockImplementationOnce(() => {
      return {
        finished: () => true,
      };
    });

    supertest(app)
      .post('/v1/external-platform/add-credentials')
      .send({
        userProfileId: uuidv4(),
        source: externalServiceSources.yachtscoring,
        user: 'someuserid',
        password: 'somepassword',
      })
      .expect(200)
      .then((response) => {
        const data = JSON.parse(response.text);
        expect(data).toMatchObject({
          isSuccessful: true,
        });
        done();
      });
  });

  test('POST /v1/external-platform/add-credentials - Failed', (done) => {
    const spy = jest.spyOn(yachtScoringJob, 'addJob');
    // @ts-ignore
    spy.mockImplementationOnce(() => {
      return {
        finished: () => false,
      };
    });

    supertest(app)
      .post('/v1/external-platform/add-credentials')
      .send({
        userProfileId: uuidv4(),
        source: externalServiceSources.yachtscoring,
        user: 'someuserid',
        password: 'somepassword',
      })
      .expect(200)
      .then((response) => {
        const data = JSON.parse(response.text);
        expect(data).toMatchObject({
          isSuccessful: false,
        });
        done();
      });
  });

  test('POST /v1/external-platform/get-events - Success', (done) => {
    const spy = jest.spyOn(yachtScoringJob, 'addJob');
    // @ts-ignore
    spy.mockImplementationOnce(() => {
      return {
        finished: () => {
          return {
            isSuccessful: true,
            message: '',
            events: [
              {
                eventId: 'id-event-here',
                eventName: 'name here',
              },
            ],
          };
        },
      };
    });

    supertest(app)
      .post('/v1/external-platform/get-events')
      .send({
        id: 'some-saved-id',
        source: externalServiceSources.yachtscoring,
      })
      .expect(200)
      .then((response) => {
        const data = JSON.parse(response.text);
        expect(data).toMatchObject({
          isSuccessful: true,
          events: expect.arrayContaining([
            expect.objectContaining({
              eventId: 'id-event-here',
              eventName: 'name here',
            }),
          ]),
        });
        done();
      });
  });
});
