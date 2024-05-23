import { StatusCodes } from 'http-status-codes';
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later'
  };
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors).map(val => val.message);
    customError.statusCode = StatusCodes.BAD_REQUEST;
  };
  if (err.name === 'CastError') {
    customError.msg = `No item found with id ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  };

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please enter another value`;
  };

  return res.status(customError.statusCode).json({ error: err.name, msg: customError.msg });
};

export default errorHandlerMiddleware;
