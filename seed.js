let User = require('./models/user');
let bcrypt = require('bcryptjs');

let user = new User({
   name: "Muniraj",
   username: "Muniraj",
   email: "admin@gmail.com",
   password: "muniraj@123",
   admin: 1
});

bcrypt.genSalt(10, (err, salt) => {
   bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) console.log(err);
      user.password = hash;
      User.countDocuments({}, function (err, count) {
         console.log(count);
         if (count == 0){
            user.save((err) => {
                 if (err) console.log(err);
             });
         }
      });
   });
});