var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('dotenv').config()
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var db = require('./config/connection');
var session = require('express-session');
var fileUpload = require('express-fileupload');
const collection = require('./config/collection');  
var helper = require('handlebars-helpers')();
// var otpkeys = require('./config/otpkeys.js')
var twilio = require('twilio')(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTH_TOKEN)
var Handlebars = require("handlebars");
var userHelpers = require('./helpers/user-helpers')


// Creating an helper for HBS
var hbs = exphbs.create({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/',
  // Custom HBS helpers
  helpers: helper
})             


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine)

app.use(fileUpload())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "Secret",
  cookie: {
    maxAge: 86400000,
  },
  resave: false,
  saveUninitialized: false,
}))

db.connect((err) => {
  if (err) {
    console.error("Something went wrong with database :", err);
  } else {
    console.log("Database Connected Successfully");
  }
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

Handlebars.registerHelper('hello', function (context, options, price, name) {
  for (key in context) {
    if (options.toString() === context[key].item.toString()) {
      var inp = true
      break;
    } else {
      var inp = false
    }
  }
  if (inp === true) {
    var data = '<a href="/cart" class="btn btn-primary add-to-cart"> View Cart</a>'
  } else {
    var data = `<a class="btn btn-primary add-to-cart" onclick="addToCart('${options}','${price}','${name}')">Add To Cart</a>`
  }
  return data
});
Handlebars.registerHelper('checkItemExistInCart', function (items, proId, price) {
  for (key in items) {

    if (proId.toString() === items[key].item.toString()) {
      var inp = true
      break;
    } else {
      var inp = false
    }
  }
  if (inp === true) {
    var data = '<a href="/cart" class="btn btn-primary add-to-cart"> View Cart</a>'
  } else {
    var data = `<a class="btn btn-primary add-to-cart" onclick="addToCart('${proId}','${price}')">Add to Cart</a>`
  }
  return data
});

Handlebars.registerHelper('quantityCheckInCart', (allProducts, cartProId, cartProQuantity, cartId, price, userId) => {
  for (index in allProducts) {
    var inp
    if (allProducts[index]._id.toString() === cartProId.toString()) {
      if (allProducts[index].productquantity - 1 >= cartProQuantity){
        inp = true
      } else {
        inp = false
        break;
      }
    }
  }
  if (inp === true) {
    // Display plus button
    btnToReturn = `<button onclick="changeQuantity('${cartId}','${cartProId}',1,'${price}','${userId}')"><i class="fa fa-plus"></i></button>`
  } else {
    // Hide plus button
    btnToReturn = `<button onclick="limitReachedInCart('${cartProQuantity}')"><i class="fa fa-plus"></i></button>`
  }
  return btnToReturn
})

// Function to display all wishlist items
Handlebars.registerHelper('checkItemExistOnWishlist', (wishlistItems, proId) => {
  var inp
  for (key in wishlistItems) {
    if (wishlistItems[key].item.toString() == proId.toString()) {
      inp = true
      break;
    } else {
      inp = false;
    }
  }
  if (inp === true) {
    btnToReturn = `<a class="wishOn" style="width: 20px; border: white " onclick=" removeFromWish('${proId}')"><i style="color: #ff4343;" class="bi bi-heart-fill"></i></a>`
  } else {
    btnToReturn = `<a class="wishOn " style=" width: 20px; border: white " onclick="addToWishList('${proId}')"><i class="bi bi-heart"></i></a>`
  }

  return btnToReturn;
})

Handlebars.registerHelper('printStar', (starCount) => {
  starCount = parseInt(starCount)
  var star = []
  for (i = 0; i < starCount; i++) {
    star[i] = '<i class="fa fa-star"></i>'
   
  }
  return star;
})



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.log("There is some error : ", res.locals.message)
  console.log("There is some error : ", err.status)
});

module.exports = app;
