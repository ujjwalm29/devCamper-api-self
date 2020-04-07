const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Reviews = require('../models/Reviews');

// @desc : Get reviews
// @route : GET api/v1/reviews
// @route : GET api/v1/bootcamps/:bootcampId/reviews
// @access : Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    const reviews = await Reviews.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc : Get SINGLE review
// @route : GET api/v1/reviews/:id
// @access : Public
exports.getReview = asyncHandler(async (req, res, next) => {
  let query;
  query = Reviews.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  const reviews = await query;
  if (!reviews) {
    return next(
      new ErrorResponse(`Review with param id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc : Add a new review
// @route : POST api/v1/bootcamps/:bootcampId/reviews
// @access : Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with param id ${req.params.bootcampId} not found`,
        404
      )
    );
  }

  const reviews = await Reviews.create(req.body);
  res.status(201).json({
    success: true,
    body: reviews
  });
});

// @desc : Update review
// @route : PUT api/v1/reviews/:id
// @access : Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Reviews.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`Review with param id ${req.params.id} not found`, 404)
    );
  }
  if (review.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update a Review`,
        401
      )
    );
  }
  review = await Reviews.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    body: review
  });
});

// @desc : Delete review
// @route : DELETE api/v1/reviews/:id
// @access : Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`review with param id ${req.params.id} not found`, 404)
    );
  }

  if (review.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update a review`,
        401
      )
    );
  }

  review.remove();

  res
    .status(200)
    .json({ success: true, msg: `Deleted review ${req.params.id}` });
});
