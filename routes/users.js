import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import expressValidator from 'express-validator';
import passport from 'passport';

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
        isAdmin: req.body.key === process.env.ADMIN_KEY,
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

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
    .populate('items')
    .exec((err, user) => {
      if (err) {
        return next(err);
      }

      res.json(user);
    });
});

router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
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

    // Current user can only update their own account
    if (req.user._id != req.params.id && req.user.isAdmin === false) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    bcrypt
      .hash(req.body.password, 10)
      .then((hashedPassword) => {
        User.findByIdAndUpdate(
          req.params.id,
          {
            username: req.body.username,
            password: hashedPassword,
          },
          {
            new: true,
          },
          (err, updatedUser) => {
            if (err) {
              return next(err);
            }

            res.json(updatedUser);
          }
        );
      })
      .catch((err) => {
        return next(err);
      });
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    // Current user can only delete their own account
    if (req.user._id != req.params.id && req.user.isAdmin === false) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    User.findByIdAndDelete(req.params.id, (err, user) => {
      if (err) {
        return next(err);
      }

      return res.json({ user, message: 'Deleted' });
    });
  }
);

export default router;
