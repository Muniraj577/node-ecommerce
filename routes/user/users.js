let express = require('express');
let router = express.Router();
let auth = require('../../config/auth');
let isUser = auth.isUser;
let passport = require('passport');
let bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
let User = require('../../models/user');

router.get('/register', (req, res) => {
    res.render('users/register.ejs', {
        title: 'Register'
    });
});
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
], (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.array(),
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err) console.log(err);
            if (user) {
                req.flash('danger', 'Username already exists.');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(err);
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered.');
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

router.get('/login', function (req, res) {
    if (res.locals.user) res.redirect('/');
    res.render('users/login', {
        title: 'Login'
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

router.get('/change-user-password/:id', isUser, (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    User.findById(req.params.id, (err, user) => {
        if (err) console.log(err);
        res.render('frontend/change-password', {
            title: 'Change Password',
            id: user._id,
            errors: errors
        });
    });
});

router.post('/change-user-password/:id', [
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
], (req, res, next) => {
    let id = req.params.id;
    let password = req.body.password;
    let password2 = req.body.password2;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('back');
    } else {
        User.findById(id, (err, user) => {
            if (err) console.log(err);
            user.password = password;
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) console.log(err);
                    user.password = hash;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'Password changed.');
                            res.redirect('/shop');
                        }
                    });
                });
            });
        });
    }
});
module.exports = router;
