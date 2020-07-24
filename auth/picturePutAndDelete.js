import passport from 'passport';
import Picture from '../models/Picture.js';

export default function (req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: info.message,
      });
    }

    Picture.findById(req.params.id, (err, picture) => {
      if (err) {
        return next(err);
      }

      if (user._id != picture.user.toString()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user = user;
      next();
    });
  })(req, res, next);
}
