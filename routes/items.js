/* eslint-disable no-unused-vars */
import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Picture from '../models/Picture.js';
import expressValidator from 'express-validator';
import passport from 'passport';

const router = express.Router();
const body = expressValidator.body;
const validationResult = expressValidator.validationResult;

router.get('/', (req, res, next) => {
  Item.find().exec((err, pictures) => {
    if (err) {
      return next(err);
    }

    res.json(pictures);
  });
});

router.get('/:id', (req, res, next) => {
  Item.findById(req.params.id).exec((err, pictures) => {
    if (err) {
      return next(err);
    }

    res.json(pictures);
  });
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

    if (!errors.isEmpty) {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
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

router.put('/:id');

router.delete('/:id');

export default router;
