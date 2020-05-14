let mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Number,
        default: 0
    }
});

let User = module.exports = mongoose.model('User', UserSchema);
// let bcrypt = require('bcryptjs');
//
// let user = new User({
//     name: "Muniraj",
//     username: "Muniraj",
//     email: "admin@gmail.com",
//     password: "muniraj@123",
//     admin: 1
// });
//
// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(user.password, salt, (err, hash) => {
//         if (err) console.log(err);
//         user.password = hash;
//         user.save((err) => {
//             if (err) console.log(err);
//         });
//     });
// });