/* eslint-disable no-unused-vars */
import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Picture from '../models/Picture.js';
import expressValidator from 'express-validator';
import passport from 'passport';
import authorizePutAndDelete from '../auth/itemsPutAndDelete.js';

const router = express.Router();
const body = expressValidator.body;
const validationResult = expressValidator.validationResult;

router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find().exec();

    res.json(items);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).exec();

    res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  [
    body(['name', 'description', 'price', 'category', 'quantity'])
      .trim()
      .escape(),
    body(['name', 'description', 'price', 'category', 'quantity']).isLength({
      min: 1,
    }),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let newItem = new Item({
      name: req.body.name,
      description: req.body.name,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      picture: req.body.pictureid,
      seller: req.user._id,
    });

    try {
      const savedItem = await newItem.save();
      const user = await User.findById(req.user._id).exec();
      user.items = [...user.items, savedItem.id];

      await user.save();

      res.json(savedItem);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:id',
  authorizePutAndDelete,
  [
    body(['name', 'description', 'price', 'category', 'quantity'])
      .trim()
      .escape(),
    body(['name', 'description', 'price', 'category', 'quantity']).isLength({
      min: 1,
    }),
  ],
  async function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const savedItem = await Item.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.name,
        price: req.body.price,
        category: req.body.category,
        quantity: req.body.quantity,
        picture: req.body.pictureid,
        seller: req.user._id,
        isAvailable: req.body.isavailable,
      }).exec();

      res.json(savedItem);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:id', authorizePutAndDelete, async function (req, res, next) {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id).exec();
    const User = await User.findById(req.user._id);
    User.items = User.items.filter((item) => item !== deletedItem.id);
    await User.save();

    res.json(deletedItem);
  } catch (error) {
    return next(error);
  }
});

export default router;
