const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());

//File upload middleware
app.use(fileupload());

//Sanitize
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Preventing xss
app.use(xss());

//Enable cors
app.use(cors());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

//Prevent http pp
app.use(hpp());

app.use(cookieParser());

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// Dev loggin middleware
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on env ${process.env.NODE_ENV}`.yellow.bold);
});
process.on('unhandledRejection', (error, promise) => {
  console.log(`Error : ${error.message}`);

  server.close(() => process.exit(1));
});
