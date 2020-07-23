import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import expressValidator from 'express-validator';

const router = express.Router();
const body = expressValidator.body;
const validationResult = expressValidator.validationResult;

router.post(
  '/',
  [
    body('*').trim(),
    body('*').escape(),
    body('username')
      .isLength({ min: 6 })
      .withMessage('Username must be at least 6 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('confirmpassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords does not match');
      }

      return true;
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      let newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });

      newUser.save((err, user) => {
        if (err) {
          return next(err);
        }

        res.json(user);
      });
    });
  }
);

export default router;
