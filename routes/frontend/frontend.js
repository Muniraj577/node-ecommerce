let express = require('express');
let router = express.Router();
let app = express();
let fs = require('fs');
let Category = require('../../models/category');
let Product = require('../../models/product');
let auth = require('../../config/auth');
let isUser = auth.isUser;
router.get('/', (req, res) => {
    res.render('frontend/index', {
        title: 'Home Page'
    });
});

router.get('/shop', isUser, (req, res) => {
    Category.find((err, categories) => {
        if (err) {
            console.log(err);
        } else {
            app.locals.categories = categories;
        }
        res.render('frontend/shop', {
            title: 'Shop',
            categories: categories
        });
    });
});

router.get('/products', (req, res) => {
    Product.find((err, products) => {
        if (err) console.log(err);
        Category.find((err, categories) => {
            if (err) {
                console.log(err);
            } else {
                app.locals.categories = categories;
            }
            res.render('frontend/all_products', {
                title: 'All Products',
                products: products,
                categories: categories
            });
        });
    });
});

router.get('/products/:category', (req, res) => {
    let categorySlug = req.params.category;
    Category.findOne({slug: categorySlug}, (err, c) => {
        Product.find({category: categorySlug}, (err, products) => {
            if (err) console.log(err);
            Category.find((err, categories) => {
                if (err) {
                    console.log(err);
                } else {
                    app.locals.categories = categories;
                }
                res.render('frontend/category_products', {
                    title: c.name,
                    products: products,
                    categories: categories
                });
            });
        });
    });
});

//Get product details

router.get('/products/:category/:product', (req, res) => {
    // let image = null;
    let loggedIn = (req.isAuthenticated()) ? true : false;
    Product.findOne({slug: req.params.product}, (err, product) => {
        if (err) {
            console.log(err);
        } else {
            res.render('frontend/single_product', {
                title: product.name,
                product: product,
                loggedIn: loggedIn
            });
        }
    });
});

module.exports = router;