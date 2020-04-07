const fs = require('fs');
const mongoose = require('mongoose');
const color = require('colors');
const dotenv = require('dotenv');

//Load env variable
dotenv.config({ path: './config/config.env' });

//Load Model
const Bootcamps = require('./models/Bootcamps');
const Courses = require('./models/Courses');
const User = require('./models/User');
const Reviews = require('./models/Reviews');

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

//Read json
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamps.create(bootcamps);
    await Courses.create(courses);
    await User.create(users);
    await Reviews.create(reviews);
    console.log('Data imported'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//Delete data
const deleteData = async () => {
  try {
    await Bootcamps.deleteMany();
    await Courses.deleteMany();
    await User.deleteMany();
    await Reviews.deleteMany();
    console.log('Data destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
