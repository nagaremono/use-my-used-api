import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import Message from '../models/Message.js';
import expressValidator from 'express-validator';

const router = express.Router();
const body = expressValidator.body;

router.get(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  async function (req, res, next) {
    try {
      const messages = await Message.find({ sender: req.user._id })
        .populate('sender')
        .populate('receiver')
        .exec();

      res.json(messages);
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    console.log(req.user);
    next();
  },
  body('*').trim().escape(),
  async function (req, res, next) {
    try {
      const receiver = await User.findById(req.body.receiver).exec();
      const sender = await User.findById(req.user._id).exec();
      let newMessage = await new Message({
        sender: req.user._id,
        receiver: receiver.id,
        text: req.body.text,
      }).save();

      receiver.messages = [...receiver.messages, newMessage];
      sender.messages = [...sender.messages, newMessage];

      await receiver.save();
      await sender.save();

      res.json(newMessage);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
