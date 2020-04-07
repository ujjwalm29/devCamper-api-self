const express = require('express');
const {
  updateBootcamps,
  createBootcamps,
  getBootcamps,
  getBootcamp,
  deleteBootcamps,
  getBootcampsInRadius,
  bootcampUploadPhoto
} = require('../controllers/bootcamp');
const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

//Re route
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('admin', 'publisher'), createBootcamps);

router
  .route('/:id')
  .get(getBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamps)
  .put(protect, authorize('admin', 'publisher'), updateBootcamps);

router
  .route('/:id/photo')
  .put(protect, authorize('admin', 'publisher'), bootcampUploadPhoto);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

module.exports = router;
