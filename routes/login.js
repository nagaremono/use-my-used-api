import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import expressValidator from 'express-validator';

const router = express.Router();
const body = expressValidator.body;

router.post('/', [body('*').trim(), body('*').escape()], function (
  req,
  res,
  next
) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: info.message,
      });
    }
    req.logIn(user, { session: false }, function (err) {
      if (err) return next(err);

      const token = jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: '14d',
      });

      res.clearCookie('JWT', { path: '/login' });

      res.cookie('JWT', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 14 * 864e5), // 2 weeks
        path: '/login',
      });

      res.json({ user: token });
    });
  })(req, res, next);
});

router.get('/', function (req, res, next) {
  let decoded;
  try {
    decoded = jwt.verify(req.cookies.JWT, process.env.JWT_SECRET);
  } catch (error) {
    res.status(404);
    res.json({
      message: 'Invalid',
    });
  }

  console.log(decoded);

  User.findById(decoded.user._id, (err, user) => {
    if (err) {
      return next(err);
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({ user: token });
  });
});

export default router;
