import express from 'express';
import passport from 'passport';
import Picture from '../models/Picture.js';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import authorizePutAndDelete from '../auth/picturePutAndDelete.js';

const router = express.Router();
const upload = multer({
  dest: './uploads',
  limits: { fileSize: 2e6, files: 1 },
});

router.get('/:id', async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);

    res.json(picture);
  } catch (error) {
    res.status(404);
    res.json({ messsage: 'Not Found' });
  }
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single('picture'),
  async (req, res, next) => {
    let newPicture = new Picture({
      image: fs.readFileSync(req.file.path, { encoding: 'base64' }),
      user: mongoose.Types.ObjectId(req.user._id),
    });

    try {
      const picture = await newPicture.save();

      fs.unlinkSync(req.file.path);

      res.json(picture);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:id',
  authorizePutAndDelete,
  upload.single('picture'),
  async function (req, res, next) {
    try {
      const picture = await Picture.findById(req.params.id);

      picture.image = fs.readFileSync(req.file.path, { encoding: 'base64' });

      const updatedPicture = await picture.save();

      fs.unlinkSync(req.file.path);

      res.json(updatedPicture);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:id', authorizePutAndDelete, async function (req, res, next) {
  try {
    const picture = await Picture.findByIdAndDelete().exec();

    res.json(picture);
  } catch (error) {
    return next(error);
  }
});

export default router;
