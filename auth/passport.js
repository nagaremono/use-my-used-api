import passport from 'passport';
import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import passportJWT from 'passport-jwt';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    });
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (payload, done) {
      User.findById(payload.user._id, function (err, user) {
        if (err) {
          return done(err, false);
        }

        if (user) {
          return done(null, user);
        }
      });
    }
  )
);
