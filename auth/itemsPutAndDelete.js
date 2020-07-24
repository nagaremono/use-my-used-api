import passport from 'passport';
import Item from '../models/Item.js';

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

    Item.findById(req.params.id, (err, item) => {
      if (err) {
        return next(err);
      }

      if (user._id != item.seller.toString()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user = user;
      next();
    });
  })(req, res, next);
}
