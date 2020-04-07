const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (error, req, res, next) => {
  let err = error;

  console.log(error);

  //console.log(error.name);

  //Id entered is longer than expected
  if (err.name == 'CastError') {
    const message = `Resource with param id ${error.value} not found`;
    err = new ErrorResponse(message, 404);
  }

  //Duplicate bootcamp name
  if (err.code == 11000) {
    const message = `Duplicate name entered`;
    err = new ErrorResponse(message, 400);
  }

  if (err.message == 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message);
    err = new ErrorResponse(message, 400);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
