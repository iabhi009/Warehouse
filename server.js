var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 8080;
const path = require('path');
var passport = require('passport');
var flash = require('connect-flash');
var img = require('./app/imgs');
app.use(bodyParser.urlencoded({extended: true}));



require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
 extended: true
}));
//app.use(express.bodyParser());
// set path for static assets
app.use(express.static('public'))

app.set('view engine', 'ejs');

app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);
app.use('/save', img);

app.listen(port);
console.log("Port: " + port);