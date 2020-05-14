let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let bcrypt = require('bcryptjs');

module.exports = (passport) => {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { console.log(err); }
                if (!user) {
                    return done(null, false, { message: 'No user found.' });
                }
                bcrypt.compare(password, user.password, (err, isMatch) => {
                   if (err) console.log(err);

                   if (isMatch){
                       return done(null, user);
                   } else {
                       return done(null, false, {message: 'Wrong password'});
                   }
                });
            });
        }
    ));
    passport.serializeUser((user, done) => {
       done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
       User.findById(id, (err, user) => {
          done(err, user);
       });
    });
};