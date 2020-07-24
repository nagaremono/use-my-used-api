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

router.get('/:id', (req, res) => {
  Picture.findById(req.params.id, (err, picture) => {
    if (err) {
      res.status(404);
      res.json({ message: 'Not Found' });
    }

    res.json(picture);
  });
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single('picture'),
  (req, res, next) => {
    let newPicture = new Picture({
      image: fs.readFileSync(req.file.path, { encoding: 'base64' }),
      user: mongoose.Types.ObjectId(req.user._id),
    });

    newPicture.save((err, picture) => {
      if (err) {
        return next(err);
      }

      fs.unlinkSync(req.file.path);

      res.json(picture);
    });
  }
);

router.put(
  '/:id',
  authorizePutAndDelete,
  upload.single('picture'),
  async function (req, res, next) {
    const picture = await Picture.findById(req.params.id);

    picture.image = fs.readFileSync(req.file.path, { encoding: 'base64' });

    picture.save((err, picture) => {
      if (err) {
        return next(err);
      }

      fs.unlinkSync(req.file.path);

      res.json(picture);
    });
  }
);

router.delete('/:id', authorizePutAndDelete, async function (req, res, next) {
  Picture.findByIdAndDelete(req.params.id, (err, user) => {
    if (err) {
      return next(err);
    }

    res.json(user);
  });
});

export default router;
