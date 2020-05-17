let express = require('express');
let router = express.Router();
let app = express();
let fs = require('fs');
let Category = require('../../models/category');
let Product = require('../../models/product');

module.exports = router;