const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamps');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Static method to getAverageRating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  try {
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating
    });
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Reviews', ReviewSchema);
