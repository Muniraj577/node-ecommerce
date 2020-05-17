let express = require('express');
let router = express.Router();
let fs = require('fs');
let mkdirp = require('mkdirp');
let multer = require('multer');
let path = require('path');
const {check, validationResult} = require('express-validator');
let Product = require('../../models/product');
let Category = require('../../models/category');
let auth = require('../../config/auth');
let isAdmin = auth.isAdmin;
const storage = multer.diskStorage({
    destination: './public/product/images',
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

// Get products
router.get('/', function (req, res) {
    let count;
    Product.countDocuments(function (err, c) {
        count = c;
    });
    Product.find(function (err, products) {
        if (err) return console.log(err);
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

router.get('/add-product', (req, res) => {
    let name = "";
    let desc = "";
    let price = "";
    Category.find((err, categories) => {
        res.render('admin/add-product', {
            name: name,
            desc: desc,
            categories: categories,
            price: price,
        });
    });
});

router.post('/add-product', upload.single('image'), [
    check('name', 'Name is required').not().isEmpty(),
    check('desc', 'Description is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty()
], (req, res) => {
    let name = req.body.name;
    let slug = name.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        Category.find((err, categories) => {
            res.render('admin/add-product', {
                errors: errors.array(),
                name: name,
                desc: desc,
                categories: categories,
                price: price,
            });
        });
    } else {
        Product.findOne({slug: slug}, (err, product) => {
            if (product) {
                req.flash('danger', 'Product already exists.');
                Category.find((err, categories) => {
                    res.render('admin/add-product', {
                        name: name,
                        desc: desc,
                        categories: categories,
                        price: price,
                    });
                });
            }
            if (req.file == undefined) {
                req.flash('danger', 'No file selected.');
                Category.find((err, categories) => {
                    res.render('admin/add-product', {
                        name: name,
                        desc: desc,
                        categories: categories,
                        price: price,
                    });
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);
                let product = new Product({
                    name: name,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: req.file.filename
                });
                product.save(function (err) {
                    if (err) return console.log(err);
                    req.flash('success', 'Product added successfully.');
                    res.redirect('/admin/products');
                });
            }
        });
    }
});

router.get('/edit-product/:id', (req, res) => {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.find((err, categories) => {
        Product.findById(req.params.id, (err, product) => {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                res.render('admin/edit-product', {
                    errors: errors,
                    name: product.name,
                    desc: product.desc,
                    categories: categories,
                    category: product.category.replace(/\s+/g, '-').toLowerCase(),
                    price: product.price,
                    image: product.image,
                    id: product._id
                });
            }
        });
    });
});

router.post('/edit-product/:id', upload.single('image'), [
    check('name', 'Name is required').not().isEmpty(),
    check('desc', 'Description is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty()
], (req, res) => {
    let name = req.body.name;
    let slug = name.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let imageFile = req.file.filename;
    let id = req.params.id;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, (err, product) => {
            if (err) console.log(err);
            if (product) {
                req.flash('danger', 'Product already exists.');
                res.redirect('admin/products/edit-product' + id);
            }
            if (req.file == undefined) {
                req.flash('danger', 'No image selected.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, product) => {
                    let pimage = product.image;
                    if (err) console.log(err);
                    product.name = name;
                    product.slug = slug;
                    product.desc = desc;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;
                    if (imageFile != "") {
                        if (pimage != "") {
                            fs.unlinkSync('public/product/images/' + pimage, (err) => {
                                if (err) console.log(err);
                            });
                        }
                    }
                    if (imageFile != "") {
                        product.image = imageFile;
                    }
                    product.save(function (err) {
                        if (err) console.log(err);
                        req.flash('success', 'Product updated successfully.');
                        res.redirect('/admin/products');
                    });
                });
            }
        });
    }
});

router.get('/delete-product/:id', (req, res) => {
    let id = req.params.id;
    Product.findByIdAndRemove(id, (err, product) => {
        if (product.image != "") {
            fs.unlinkSync('public/product/images/' + product.image);
        }
        if (err) console.log(err);
        req.flash('danger', 'Product deleted successfully.');
        res.redirect('/admin/products');
    });
});
module.exports = router;
