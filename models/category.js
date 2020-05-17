let mongoose = require('mongoose');
let categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    image: {
        type: String
    }
});

let Category = module.exports= mongoose.model('Category', categorySchema);