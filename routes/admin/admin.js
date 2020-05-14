let express = require('express');
let router = express.Router();
let auth = require('../../config/auth');
let isAdmin = auth.isAdmin;
let passport = require('passport');
let bcrypt = require('bcryptjs');
let User = require('../../models/user');
router.get('/login', (req, res) => {
   res.render('admin/admin-login');
});
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/login',
        failureFlash: true
    }) (req, res, next);
});
router.get('/', isAdmin, (req, res) => {
    res.send('This is admin page');
});
module.exports = router;
