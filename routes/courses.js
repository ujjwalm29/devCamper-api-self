const express = require('express');
const {
  getCourses,
  getCourse,
  updateCourses,
  deleteCourse,
  createCourse
} = require('../controllers/courses');
const router = express.Router({ mergeParams: true });
const Courses = require('../models/Courses');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Courses, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getCourses
  )
  .post(protect, authorize('admin', 'publisher'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .delete(protect, authorize('admin', 'publisher'), deleteCourse)
  .put(protect, authorize('admin', 'publisher'), updateCourses);

module.exports = router;
