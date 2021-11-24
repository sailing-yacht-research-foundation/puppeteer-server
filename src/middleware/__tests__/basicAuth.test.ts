import { Request, Response } from 'express';
import basicAuth from '../basicAuth';
import { generateDateAuthFormat, generateSecret } from '../../utils/authUtils';
import { BadRequestError, AuthInvalidError } from '../errorHandler';

describe('Validate Secret middleware', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
    } as unknown as Response;
  });

  test('Without Authorization', () => {
    try {
      mockRequest = {
        headers: {},
      } as Request;
      basicAuth(mockRequest, mockResponse, nextFunction);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
  });

  test('With Incorrect Authorization', () => {
    mockRequest = {
      headers: {
        authorization: 'abcdef',
      },
    } as unknown as Request;
    try {
      basicAuth(mockRequest, mockResponse, nextFunction);
    } catch (error) {
      expect(error).toBeInstanceOf(AuthInvalidError);
    }
  });

  test('With Correct Authorization', () => {
    mockRequest = {
      headers: {
        authorization: generateSecret(generateDateAuthFormat()),
      },
    } as unknown as Request;
    basicAuth(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toBeCalledTimes(1);
  });
});
