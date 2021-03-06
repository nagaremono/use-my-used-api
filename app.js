import dotenv from 'dotenv';
import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import login from './routes/login.js';
import './auth/passport.js';
import userRoute from './routes/users.js';
import pictureRoute from './routes/pictures.js';
import messageRoute from './routes/messages.js';
import itemRoute from './routes/items.js';
import passport from 'passport';

dotenv.config();

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.error(error);
  });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.use('/login', login);
app.use('/users', userRoute);
app.use('/pictures', pictureRoute);
app.use('/items', itemRoute);
app.use('/messages/', messageRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json();
});

app.listen(4000, () => {
  console.log('Now listening on port 4000');
});
