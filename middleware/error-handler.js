import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, try again later',
    name: err.name
  };
  if (err.name === 'CastError') {
    customError.message = `No item found with id ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  };

  res.render('error', { customError })
};

export default errorHandlerMiddleware;
