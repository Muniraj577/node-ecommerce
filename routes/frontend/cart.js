let express = require('express');
let router = express.Router();
let app = express();
let fs = require('fs');
let Category = require('../../models/category');
let Product = require('../../models/product');


router.get('/add-to-cart/:product', (req, res) => {
    let slug = req.params.product;
    Product.findOne({slug: slug}, (err, product) => {
        if (err) console.log(err);
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                name: slug,
                qty: 1,
                price: parseFloat(product.price).toFixed(2),
                image: '/product/images/' + product.image
            });
        } else {
            let cart = req.session.cart;
            let newItem = true;
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].name == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {
                cart.push({
                    name: slug,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/product/images/' + product.image
                });
            }
        }
        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });
});

router.get('/checkout', (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout')
    } else {
        res.render('frontend/checkout', {
            title: 'Checkout Page',
            cart: req.session.cart
        });
    }
});

router.get('/update/:product', (req, res) => {
    let slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        break;
                default:
                    console.log('Update problem');
                    break;
            }
            break;
        }
    }
    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

router.get('/clear', (req, res) => {
    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});

router.get('/buynow', (req, res) => {
    delete req.session.cart;
    res.sendStatus(200);
});
module.exports = router;