const Courses = require('../models/Courses');
const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc : Get courses
// @route : GET api/v1/courses
// @route : GET api/v1/bootcamps/:bootcampId/courses
// @access : Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    const courses = await Courses.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc : Get SINGLE course
// @route : GET api/v1/courses/:id
// @access : Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  let query;
  query = Courses.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  const courses = await query;
  if (!courses) {
    return next(
      new ErrorResponse(`Course with param id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc : Add a new course
// @route : POST api/v1/bootcamps/:bootcampId/courses
// @access : Private
exports.createCourse = asyncHandler(async (req, res, next) => {
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

  if (bootcamp.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to add a course`,
        401
      )
    );
  }

  const course = await Courses.create(req.body);
  res.status(201).json({
    success: true,
    body: course
  });
});

// @desc : Update course
// @route : PUT api/v1/courses/:id
// @access : Private
exports.updateCourses = asyncHandler(async (req, res, next) => {
  let course = await Courses.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course with param id ${req.params.id} not found`, 404)
    );
  }
  if (course.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update a course`,
        401
      )
    );
  }
  course = await Courses.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    body: course
  });
});

// @desc : Delete course
// @route : DELETE api/v1/courses/:id
// @access : Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`course with param id ${req.params.id} not found`, 404)
    );
  }

  if (course.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update a course`,
        401
      )
    );
  }

  course.remove();

  res
    .status(200)
    .json({ success: true, msg: `Delete course ${req.params.id}` });
});
