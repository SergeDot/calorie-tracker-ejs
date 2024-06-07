import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from './custom-api.js';

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export { BadRequestError };
