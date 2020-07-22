import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', function (req, res, next) {
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

      res.cookie('JWT', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 14 * 864e5), // 2 weeks
        path: '/login',
      });

      res.json({ user: token });
    });
  })(req, res, next);
});

export default router;
