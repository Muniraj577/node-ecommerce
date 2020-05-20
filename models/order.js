let mongoose = require('mongoose');
let orderSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    city: {
        type: String
    },
    phone: {
        type: String
    },
    place: {
        type: String
    }
});

let Order = module.exports= mongoose.model('Order', orderSchema);