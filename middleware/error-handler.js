import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: error.message || 'Something went wrong, try again later',
    name: error.name
  };
  if (error.name === 'CastError') {
    customError.message = `No item found with id ${error.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  };

  res.render('error', { customError })
};

export default errorHandlerMiddleware;
