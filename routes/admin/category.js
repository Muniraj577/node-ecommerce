let express = require('express');
let router = express.Router();
let fs = require('fs');
let multer = require('multer');
let path = require('path');
const {check, validationResult} = require('express-validator');
let Category = require('../../models/category');
let auth = require('../../config/auth');
let isAdmin = auth.isAdmin;
const storage = multer.diskStorage({
    destination: './public/category/images',
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName)
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 100000000},
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb('Error: Images only!');
        }
    }
});

// Get categories
router.get('/', isAdmin, function (req, res) {
    let count;
    Category.countDocuments(function (err, c) {
        count = c;
    });
    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories,
            count: count
        });
    });
});

router.get('/add-category', isAdmin, (req, res) => {
    let name = "";
    res.render('admin/add-category', {
        name: name,
    });
});

router.post('/add-category', isAdmin, upload.single('image'), [
    check('name', 'Name is required').not().isEmpty(),
], (req, res) => {
    let name = req.body.name;
    let slug = name.replace(/\s+/g, '-').toLowerCase();
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('admin/add-category', {
            errors: errors.array(),
            name: name,
        });
    } else {
        Category.findOne({slug: slug}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category slug exists.');
                res.render('admin/add-category', {
                    name: name
                });
            }
            if (req.file == undefined) {
                req.flash('danger', 'No file selected.');
                res.render('admin/add-category', {
                    name: name
                });
            } else {
                let category = new Category({
                    name: name,
                    slug: slug,
                    image: req.file.filename
                });
                category.save(function (err) {
                    if (err) return console.log(err);
                    req.flash('success', 'Category added successfully.');
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});

router.get('/edit-category/:id', isAdmin, (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.findById(req.params.id, (err, category) => {
        if (err) console.log(err);
        res.render('admin/edit-category', {
            name: category.name,
            image: category.image,
            id: category._id,
            errors: errors
        });
    });
});

router.post('/edit-category/:id', isAdmin, upload.single('image'), [
    check('name', 'Name is required').not().isEmpty(),
], (req, res) => {
    let name = req.body.name;
    let slug = name.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;
    let imageFile = req.file.filename;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/admin/categories/edit-category/' + id);
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, (err, cat) => {
            if (err) console.log(err);
            if (cat) {
                req.flash('danger', 'Category already exists.');
                res.redirect('admin/categories/edit-category' + id);
            }
            if (req.file == undefined) {
                req.flash('danger', 'No image selected.');
                res.redirect('/admin/categories/edit-category/' + id);
            } else {
                Category.findById(id, (err, cat) => {
                    let pimage = cat.image;
                    if (err) console.log(err);
                    cat.name = name;
                    cat.slug = slug;
                    if (imageFile != "") {
                        if (pimage != "") {
                            fs.unlinkSync('public/category/images/' + pimage, (err) => {
                                if (err) console.log(err);
                            });
                        }
                    }
                    if (imageFile != "") {
                        cat.image = imageFile;
                    }
                    cat.save(function (err) {
                        if (err) console.log(err);
                        req.flash('success', 'Category updated successfully.');
                        res.redirect('/admin/categories');
                    });
                });
            }
        });
    }
});

router.get('/delete-category/:id', isAdmin, (req, res) => {
    let id = req.params.id;
    Category.findByIdAndRemove(id, (err, cat) => {
        if (cat.image != "") {
            console.log(cat.image);
            fs.unlinkSync('public/category/images/' + cat.image);
        }
        if (err) console.log(err);
        req.flash('danger', 'Category deleted successfully.');
        res.redirect('/admin/categories');
    });
});
module.exports = router;
