/* eslint-disable no-unused-vars */
import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Picture from '../models/Picture.js';
import expressValidator from 'express-validator';

const router = express.Router();
const body = expressValidator.body;
const validationResult = expressValidator.validationResult;

router.get('/', (req, res, next) => {
  Item.find()
    .populate('seller')
    .populate('picture')
    .exec((err, pictures) => {
      if (err) {
        return next(err);
      }

      res.json(pictures);
    });
});

router.get('/:id');

router.post('/');

router.put('/:id');

router.delete('/:id');

export default router;
