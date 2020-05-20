let express = require('express');
let router = express.Router();
let auth = require('../../config/auth');
let isAdmin = auth.isAdmin;
let passport = require('passport');
let bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
let User = require('../../models/user');

router.get('/', isAdmin, (req, res) => {
    let count;
    User.countDocuments(function (err, c) {
        count = c;
    });
    User.find(function (err, users) {
        let loggedIn = (req.isAuthenticated()) ? true : false;
        if (err) return console.log(err);
        res.render('admin/users', {
            users: users,
            count: count,
            loggedIn: loggedIn
        });
    });
});
router.get('/add-user', isAdmin, (req, res) => {
    res.render('admin/create-user.ejs', {
        title: 'Create User'
    });
});
router.post('/add-user', [
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
    let admin = req.body.admin;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/create-user', {
            errors: errors.array(),
            user: null,
            title: 'Create User'
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err) console.log(err);
            if (user) {
                req.flash('danger', 'Username already exists.');
                res.redirect('/admin/add-user');
            } else {
                if (req.body.admin) {
                    admin = 1
                } else {
                    admin = 0
                }
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: admin
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(err);
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'User created.');
                                res.redirect('/admin/user');
                            }
                        });
                    });
                });
            }
        });
    }
});

router.get('/edit-user/:id', isAdmin, (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    User.findById(req.params.id, (err, user) => {
        if (err) console.log(err);
        res.render('admin/edit-user', {
            name: user.name,
            username: user.username,
            email: user.email,
            admin: user.admin,
            id: user._id,
            errors: errors
        });
    });
});

router.post('/mark-user-or-admin/:id', (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    User.findById(req.params.id, (err, user) => {
        if (err) console.log(err);
        if (user.admin === 0) {
            user.admin = 1;
        } else {
            user.admin = 0;
        }
        console.log(user.admin);
        user.save((err) => {
            if (err) console.log(err);
            if (user.admin === 0) {
                req.flash('success', 'User is marked as User.');
            } else {
                req.flash('success', 'User is marked as Admin.');
            }
            res.redirect('back');
        });
    });
});

router.post('/edit-user/:id', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('username', 'Username is required').not().isEmpty()
], (req, res, next) => {
    let name = req.body.name;
    let username = req.body.username;
    let email = req.body.email;
    let admin = req.body.admin;
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/admin/user/edit-user/' + id);
    } else {
        User.findOne({username: username, _id: {'$ne': id}}, (err, user) => {
            if (err) console.log(err);
            if (user) {
                req.flash('danger', 'Username already exists.');
                res.redirect('admin/user/edit-user' + id);
            } else {
                User.findById(id, (err, user) => {
                    if (err) console.log(err);
                    user.name = name;
                    user.username = username;
                    user.email = email;
                    if (req.body.admin) {
                        admin = 1;
                    } else {
                        admin = 0;
                    }
                    user.admin = admin;
                    user.save(function (err) {
                        if (err) console.log(err);
                        req.flash('success', 'User updated successfully.');
                        res.redirect('/admin/user');
                    });
                });
            }
        });
    }
});

router.get('/delete-user/:id', isAdmin, (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, user) => {
        if (err) console.log(err);
        req.flash('danger', 'User deleted successfully.');
        res.redirect('/admin/user');
    });
});

router.get('/change-user-password/:id', isAdmin, (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    User.findById(req.params.id, (err, user) => {
        if (err) console.log(err);
        res.render('admin/change-user-password', {
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
        res.redirect('/admin/user/change-user-password/' + id);
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
                            res.redirect('/admin/user');
                        }
                    });
                });
            });
        });
    }
});

module.exports = router;
