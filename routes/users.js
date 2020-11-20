/* eslint-disable no-unused-vars */
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Item from '../models/Item.js';
import expressValidator from 'express-validator';
import authorizePutAndDelete from '../auth/usersPutAndDelete.js';

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
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
        isAdmin: req.body.key === process.env.ADMIN_KEY,
      }).save();

      res.json(newUser);
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById().populate('items').exec();

    res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.put(
  '/:id',
  authorizePutAndDelete,
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
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          username: req.body.username,
          password: hashedPassword,
        },
        { new: true }
      ).exec();

      res.json(updatedUser);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:id', authorizePutAndDelete, async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id).exec();

    res.json({ user: deletedUser, message: 'Deleted' });
  } catch (error) {
    return next(error);
  }
});

export default router;
