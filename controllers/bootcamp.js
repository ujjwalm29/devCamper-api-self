const path = require('path');
const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

// @desc : Get all bootcamps
// @route : GET api/v1/bootcamps
// @access : Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc : Get SINGLE bootcamp
// @route : GET api/v1/bootcamps/:id
// @access : Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);

  if (!bootcamps) {
    return next(
      new ErrorResponse(
        `Bootcamp with param id ${req.params.id} not found`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    body: bootcamps
  });
});

// @desc : Creat new bootcamp
// @route : POST api/v1/bootcamps
// @access : Private
exports.createBootcamps = asyncHandler(async (req, res, next) => {
  //console.log(req.body);
  //ADd user to req body

  req.body.user = req.user.id;

  //Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //if user is not an admin then they can add only one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Current user with id ${req.user.id} has already published a bootcamp `,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    body: bootcamp
  });
});

// @desc : Update bootcamp
// @route : PUT api/v1/bootcamps/:id
// @access : Private
exports.updateBootcamps = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with param id ${req.params.id} not found`,
        404
      )
    );
  }

  //if(bootcamp.user)
  if (bootcamp.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    body: bootcamp
  });
});

// @desc : Delete bootcamp
// @route : DELETE api/v1/bootcamps/:id
// @access : Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);

  if (!bootcamps) {
    return next(
      new ErrorResponse(
        `Bootcamp with param id ${req.params.id} not found`,
        404
      )
    );
  }

  if (bootcamp.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to update`,
        401
      )
    );
  }

  bootcamps.remove();

  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

// @desc : Get bootcamps within a radius
// @route : PUT api/v1/bootcamps/radius/:zipcode/:distance
// @access : Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;

  //Calc radius using radians
  //Divide dist by radius of earth
  // Earth radius = 3,953 mil / 6,378 km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc : Upload photo for bootcamp
// @route : PUT api/v1/bootcamps/:id/photo
// @access : Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.findById(req.params.id);

  if (!bootcamps) {
    return next(
      new ErrorResponse(
        `Bootcamp with param id ${req.params.id} not found`,
        404
      )
    );
  }

  if (bootcamp.user != req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User user id ${req.user.id} not authorized to upload photo`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photo_${bootcamps.id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findById(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
