
let express = require('express');
let path = require('path');
// let engine = require('ejs-locals');
let mongoose = require('mongoose');
let config = require('./config/database');
let bodyParser = require('body-parser');
let session = require('express-session');


let passport = require('passport');

// Init app
let app = express();

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
//Passport config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
//Connect to db
mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB")
});

//View engine setup
app.set('views', path.join(__dirname, 'views'));
// app.engine('ejs', engine);
app.set('view engine', 'ejs');
require('./seed');
//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

//Set global errors variables
app.locals.errors = null;



app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

//Set Routes
app.get('/', (req, res) => {
   res.send('dfdbfdbbd');
});
let admin = require('./routes/admin/admin');
app.use('/admin', admin);
//Start the server
let hostname = '127.0.0.1';
let port = 3000;
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});