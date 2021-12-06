const { response } = require('express');
var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var adminHelper = require('../helpers/admin-helpers')
const { parse } = require('dotenv');
const client = require('twilio')(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTH_TOKEN);
const { v4: uuidv4 } = require('uuid');


var userToresetPass
var currentUser
let cartCount
let cartProductsTodisplay
let totalValue
var theUser

/* GET home page. */
router.get('/', async function (req, res, next) {
  adminHelper.checkOfferDate().then((offersToExpire) => {
    offersToExpire.map((category) => {
      adminHelper.deleteoffer(category._id, category.category, category.offerName).then((productsUnderCategory) => {
        productsUnderCategory.map((products) => {
          adminHelper.updateProductsWhenOfferDeleted(products)
        })
      })
    })
  })

  adminHelper.checkCouponExpiry().then((couponToExpire) => {
    couponToExpire.map((coupon) => {
      adminHelper.deleteCoupon(coupon._id).then((result) => {

      })
    })
  })

  adminHelper.checkProOfferExpiry().then((proOfferToExpire) => {
    console.log("the offer to expire : ", proOfferToExpire)
    proOfferToExpire.map((singleOffers) => {
      adminHelper.deleteProOffer(singleOffers._id, singleOffers.productName)
    })
  })

  var newArrivals = await userHelpers.getNewArrivals()
  var ads = await userHelpers.getAllAdsForOffer()

  if (req.session.LoggedIn && req.session.unblock) {

    currentUser = req.session.user
    logStatus = req.session.LoggedIn
    userId = req.session.userDetails
    currentUser.userId = userId
    req.session.block = false
    // Calling function to get the cart count
    cartCount = await userHelpers.getCartCount(req.session.userDetails)
    cartProductsTodisplay = await userHelpers.getCartProducts(req.session.userDetails)
    // Getting Cart products to display in modal of cart 
    let Cartproducts = await userHelpers.getCartProducts(req.session.userDetails)
    userHelpers.getAllProducts().then((products) => {
      adminHelper.fetchAllMainCategories().then((allCategories) => {
        adminHelper.findAllProductBrands().then((allProductBrands) => {
          adminHelper.getAllbikebrands().then((allBikeBrands) => {
            res.render('user/user-home', { title: 'Home', user: true, Cartproducts, currentUser, typeOfPersonUser: true, products, logStatus: req.session.LoggedIn, cartCount, items: cartProductsTodisplay, allCategories, allProductBrands, allBikeBrands, ads, newArrivals });
          })
        })
      })
    })

    // Checking block in login through OTP
  } else if (req.session.LoggedInThruOtp && req.session.unblock) {
    req.session.LoggedIn = true
    req.session.block = false
    userHelpers.getAllProducts().then((products) => {
      currentUser = req.session.resetUser
      adminHelper.fetchAllMainCategories().then((allCategories) => {
        adminHelper.findAllProductBrands().then((allProductBrands) => {
          adminHelper.getAllbikebrands().then((allBikeBrands) => {
            res.render('user/user-home', { title: 'Home', user: true, currentUser: req.session.user, typeOfPersonUser: true, products, cartCount, allCategories, allProductBrands, allBikeBrands, ads, newArrivals });
          })
        })
      })
    })
  }
  else {
    var currentUser = req.session.user
    userHelpers.getAllProducts().then((products) => {
      adminHelper.fetchAllMainCategories().then((allCategories) => {
        adminHelper.findAllProductBrands().then((allProductBrands) => {
          adminHelper.getAllbikebrands().then((allBikeBrands) => {
            res.render('user/user-home', { title: 'Home', user: true, currentUser: false, typeOfPersonUser: true, products, allCategories, allProductBrands, allBikeBrands, ads, newArrivals });
          })
        })
      })
    })
  }
});

// Getting login page
router.get('/login', (req, res) => {

  if (req.session.LoggedIn) {
    res.redirect('/')
  }
  else {
    if (req.query.id) {
      req.session.addToCart = { id: req.query.id, proPrice: req.query.price, proName: req.query.name }
    }
    if (req.query.wishId) {
      req.session.addToWishlist = { id: req.query.wishId }
    }
    res.render('user/user-login', { title: 'Login', loginAndSignup: true, loggedInErr: req.session.loggedInErr, typeOfPersonUser: true, emailError: req.session.emailError, passError: req.session.passError, block: req.session.block, reset: req.session.resetPassSuccess, newSignUpSuccess: req.session.newSignUpSuccess })
    req.session.newSignUpSuccess = false
    req.session.block = false
    req.session.emailError = false;
    req.session.passError = false;
    req.session.loggedInErr = false;
    req.session.resetPassSuccess = false;
  }

})

// Posting Logged in user's data
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      //  Assigning block to the session
      theUser = response.user
      req.session.block = response.user.block


      if (req.session.block == 'true') {
        req.session.block = true
      } else {
        req.session.block = false
      }

      // Redirecting To login 
      if (req.session.block) {
        res.redirect('/login')
      }
      else {
        req.session.unblock = true
        req.session.block = response.user.block
        req.session.userDetails = response.user._id;
        req.session.user = req.body;
        var userSession = req.session.user;
        req.session.LoggedIn = true
        logStatus = req.session.LoggedIn;
        if (req.session.shop) {
          res.redirect('/shop')
        } else if (req.session.addToWishlist) {
          res.redirect('/addtowishlist/' + req.session.addToWishlist.id)
        } else if (req.session.viewwishlist) {
          res.redirect('/wishlist')
        } else if (req.session.addToCart) {
          res.redirect('/add-to-cart/' + req.session.addToCart.id + '/' + req.session.addToCart.proPrice + '/' + req.session.addToCart.proName)
        } else if (req.session.buyNowCheck) {
          res.redirect('/checkoutbuynow/' + req.session.buyNowCheck)
        } else if (req.session.redirectToCart) {
          res.redirect('/cart')
        }
        else {
          res.redirect('/')
        }
      }
    }
    else if (response.passError) {
      req.session.loggedInErr = true
      req.session.passError = response.passError
      res.redirect('/login');
    } else if (response.emailError) {
      req.session.loggedInErr = true
      req.session.emailError = response.emailError

      res.redirect('/login');
    }
  })
})


// Gettting sign up page
router.get('/signup', (req, res) => {
  req.session.newSignUpSuccess = false
  if (req.session.LoggedIn) {
    res.redirect('/')
  }
  else {
    userNameAlreadyExist = req.session.userNameAlreadyExist
    res.render('user/user-signup', { title: 'Signup', loginAndSignup: true, userNameAlreadyExist, typeOfPersonUser: true })
    userNameAlreadyExist = false;
    req.session.userNameAlreadyExist = false;
  }

})


// posting Signed up data
router.post('/signup', (req, res) => {
  userHelpers.userSignup(req.body).then((response) => {
    if (response) {
      req.session.newUser = req.body
      var mobile = req.body.countryCode + req.body.mobile;
      mobile = parseInt(mobile);
      client.verify.services(process.env.TWILIO_SERVICE_ID)
        .verifications
        .create({ to: '+' + mobile, channel: 'sms' }).then((data) => {
          // Data will  be recieved with The send status adn all
          res.render('user/user-mobileconfirmation', { title: 'Mobile Confirmation', loginAndSignup: true, typeOfPersonUser: true, mobile, countryCode: req.body.countryCode, mobile: req.body.mobile })

        }).catch((err) => {
          console.log(err);
          // If there is any error THe actch block will catch it
          res.redirect('/404')
        })


    } else {
      req.session.userNameAlreadyExist = true;
      res.redirect('/signup')
    }

  })

})

// Verifying the OTP send when entering the OTP
router.post('/mobileConfirmation', (req, res) => {

  req.session.mobileDetails = req.body.countryCode + req.body.phone
  req.session.code = req.body.otp

  client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({ to: '+' + req.session.mobileDetails, code: req.session.code })
    .then((verification_check) => {

      // If the OTP is wright It will give status as Approved else it will give status as Pending
      if (verification_check.status == 'approved') {
        userHelpers.insertNewUserToDB(req.session.newUser).then((data) => {
          if (data) {
            req.session.newSignUpSuccess = true
            res.redirect('/login');
          }
        })
      } else {
        mobile = req.body.phone
        otpError = true

        res.render('user/user-mobileconfirmation', { title: 'Mobile Confirmation', loginAndSignup: true, typeOfPersonUser: true, mobile: req.session.mobileDetails, otpError })
        otpError = false
      }
    })
})

// Sign in using OTP
router.get('/signinotp', (req, res) => {
  res.render('user/user-signinotp', { title: 'Signin Using OTP', loginAndSignup: true, typeOfPersonUser: true })
})

// Sign in using OTP
router.post('/signinotp', async (req, res) => {

  var mobile = req.body.countryCode + req.body.mobileno;

  mobile = parseInt(mobile);
  userHelpers.checkMobNo(req.body).then((user) => {
    userToresetPass = user;
    if (user) {

      // If response is true sending the OTP Message
      client.verify.services(process.env.TWILIO_SERVICE_ID)
        .verifications
        .create({ to: '+' + mobile, channel: 'sms' }).then((data) => {
          // Data will  be recieved with The send status adn all
          res.render('user/user-signinconfirmation', { title: 'Enter OTP', loginAndSignup: true, typeOfPersonUser: true, mobile, countryCode: req.body.countryCode })
        }).catch((err) => {
          console.log("the sign in otp error : ", err)
          // If there is any error THe actch block will catch it
          res.redirect('/404')
        })
    } else {
      // Mobile number entered is wrong
      mobileError = true
      res.render('user/user-signinotp', { title: 'Forgot Password', loginAndSignup: true, typeOfPersonUser: true, mobileError })
      mobileError = false
    }
  })
})

// Post sign in using OTP
router.post('/signinconfirmation', (req, res) => {
  otpError = false
  client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({ to: '+' + req.body.phone[0], code: req.body.otp })
    .then((verification_check) => {

      if (verification_check.status == 'approved') {
        phoneNo = req.body.phone[0].slice(2)

        userHelpers.findUser(phoneNo).then((user) => {
          if (user) {
            if (user.block == 'true') {
              req.session.block = true
              res.redirect('/login')
            } else {
              req.session.block = false
              req.session.unblock = true
            }
            req.session.block = user.block
            req.session.userDetails = user._id;
            req.session.user = user
            var userSession = req.session.user;
            req.session.LoggedIn = true
            res.redirect('/')
          } else {
            userNotExist = true
            res.render('user/user-signinconfirmation', { title: 'OTP', loginAndSignup: true, typeOfPersonUser: true, userNotExist })
            userNotExist = false
          }
        })
      } else {
        mobile = req.body.phone[0]
        countryCode = req.body.phone[1]
        otpError = true
        res.render('user/user-signinconfirmation', { title: 'Mobile Confirmation', loginAndSignup: true, typeOfPersonUser: true, mobile, otpError, countryCode })

      }
    }).catch((err) => {
      console.log("The Error :", err);
      res.redirect('/404')
    })
})


// Getting Forgot password PAge
router.get('/forgotpassword', (req, res) => {
  res.render('user/user-forgotpassword', { title: 'Forgot Password', loginAndSignup: true, typeOfPersonUser: true })
})

// Posting Forgot password PAge and checking the user exist or not 
router.post('/forgotpassword', (req, res) => {


  mobileError = false
  mobile = parseInt(req.body.countryCode + req.body.mobileno)

  userHelpers.checkMobNo(req.body).then((user) => {
    userToresetPass = user;
    if (user) {
      // If response is true sending the OTP Message
      client.verify.services(process.env.TWILIO_SERVICE_ID)
        .verifications
        .create({ to: '+' + mobile, channel: 'sms' }).then((data) => {
          // Data will  be recieved with The send status adn all
          res.render('user/user-otp', { title: 'Forgot Password', loginAndSignup: true, typeOfPersonUser: true, countryCode: req.body.countryCode, mobileno: req.body.mobileno })

        }).catch((err) => {
          // If there is any error THe actch block will catch it
          res.redirect('/404')
          console.log("The error in sending message : ", err);
        })
    } else {
      // Mobile number entered is wrong
      mobileError = true
      res.render('user/user-forgotpassword', { title: 'Forgot Password', loginAndSignup: true, typeOfPersonUser: true, mobileError })
      mobileError = false
    }
  })
})


// Posting The verified OTP adn redirecting to home page
router.post('/otpverify', (req, res) => {

  var user = req.body
  var phone = req.body.countryCode + req.body.phone
  phone = parseInt(phone)
  otpError = false
  // userHelpers.checkMobNo(req.body)
  // Checking whether the Entered OTP Is wrong
  client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({ to: '+' + phone, code: req.body.otp })
    .then((verification_check) => {
      // If the OTP is wright It will give status as Approved else it will give status as Pending
      if (verification_check.status == 'approved') {
        res.render('user/user-resetpassword', { title: 'Verify OTP', loginAndSignup: true, typeOfPersonUser: true })
      } else {
        mobile = req.body.phone
        otpError = true
        res.render('user/user-otp', { title: 'Forgot Password', loginAndSignup: true, typeOfPersonUser: true, mobile, otpError, countryCode: req.body.countryCode, mobileno: req.body.phone })
      }
    }).catch((err) => {
      console.log(err);
    })
})

// Posting reseting password that user entered
router.post('/resetpassword', (req, res) => {

  userHelpers.updatePassword(req.body, userToresetPass).then((result) => {
    if (result) {
      currentUser = userToresetPass
      resetSuccess = true
      req.session.LoggedIn = false
      // req.session.LoggedInThruOtp = true
      req.session.resetUser = currentUser
      req.session.resetPassSuccess = 'Password Successfully Reset,Please Login to continue'
      res.redirect('/login')

    } else {
      newPassError = true
      res.render('user/user-user-resetpassword', { title: 'Reset password', loginAndSignup: true, typeOfPersonUser: true, newPassError })
      newPassError = false
    }
  })
})

// Getting product single view page
router.get('/productview/:id', async (req, res) => {
  var proId = req.params.id
  var review = await userHelpers.getAllReviews(req.params.id)
  var reviewCount
  if (review === false) {
    reviewCount = 0
  } else {
    reviewCount = review.proReview.length
  }
  if (req.session.LoggedIn) {
    logStatus = req.session.LoggedIn
    let cartProductsTodisplay = await userHelpers.getCartProducts(req.session.userDetails)
    let cartCount = await userHelpers.getCartCount(req.session.userDetails)
    let wishlist = await userHelpers.getUserWish(req.session.userDetails)
    let checkUserPurchasedItem = await userHelpers.checkUserPurchasedItem(req.session.userDetails, req.params.id)
    // Buy Now


    var userComment = await userHelpers.findUserComment(proId, req.session.userDetails)
    userHelpers.singleProduct(proId).then(([singleProduct, relatedProduct]) => {
      res.render('user/user-singleproduct', { title: 'Product', user: true, typeOfPersonUser: true, singleProduct, relatedProduct, currentUser: req.session.user, cartCount, theUser, logStatus, items: cartProductsTodisplay, wishlist, review, reviewCount, checkUserPurchasedItem, userComment })
    })
  } else {
    userHelpers.singleProduct(proId).then(([singleProduct, relatedProduct]) => {
      res.render('user/user-singleproduct', { title: 'Product', user: true, typeOfPersonUser: true, singleProduct, relatedProduct, logStatus: false, review, reviewCount })
    })
  }
})


// Gettign the cart page
router.get('/cart', async (req, res) => {
  user = req.session.userDetails
  logStatus = req.session.LoggedIn
  currentUser = req.session.user

  if (req.session.LoggedIn) {
    req.session.redirectToCart = false
    req.session.addToCart = false
    let products = await userHelpers.getCartProducts(req.session.userDetails)
    let allProducts = await userHelpers.fetchProducts()
    if (products) {
      totalValue = await userHelpers.getTotalAmount(req.session.userDetails)
      let UserId = req.session.userDetails

      res.render('user/user-cart', { title: 'Cart', products, user: true, typeOfPersonUser: true, currentUser: req.session.user, UserId, totalValue, allProducts })
    }
    else {
      res.render('user/user-cart', { title: 'Cart', currentUser, user: true, typeOfPersonUser: true, logStatus })
    }

  } else {
    req.session.redirectToCart = true
    res.redirect('/login')
  }



})

// Adding items to the cart
router.get('/add-to-cart/:id/:proPrice/:proName', (req, res) => {

  if (req.session.LoggedIn) {
    user = req.session.userDetails
    if (req.session.addToCart) {
      res.redirect('/cart')
    }
    userHelpers.addToCart(req.params.id, req.session.userDetails, req.params.proPrice, req.params.proName).then(() => {
      res.json({ status: true })
    })
  } else {
    res.redirect('/login');
  }
})

// Change pproduct quantity when clicking + & -
router.post('/change-product-quantity', async (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.session.userDetails)

    res.json(response)
  })
})

// Delete from cart
router.post('/delete-cart-product', (req, res) => {
  userHelpers.deleteProduct(req.body).then((response) => {
    res.json(response)
  })
})

// Getting the checkout page for cart
router.get('/checkout', async (req, res) => {
  if (req.session.LoggedIn) {
    let addresses = await userHelpers.findUserAddress(req.session.userDetails)
    let products = await userHelpers.getCartProducts(req.session.userDetails)
    let total = await userHelpers.getTotalAmount(req.session.userDetails)
    let user = req.session.userDetails
    res.render('user/user-checkout', { title: 'Checkout', user: true, theUser, cartCount, currentUser: req.session.user, typeOfPersonUser: true, logStatus, products, total, user, addresses })
  } else {
    res.redirect('/login')
  }
})

// Getting Checkout for buy now
router.get('/checkoutbuynow/:id', async (req, res) => {
  if (req.session.LoggedIn) {
    req.session.buyNowCheck = false
    let userId = req.session.userDetails
    userHelpers.getProductForBuyNow(req.params.id).then(async (productToBuy) => {
      let addresses = await userHelpers.findUserAddress(req.session.userDetails)
      res.render('user/user-buynowcheckout', { title: 'Checkout', theUser, user: true, userId, cartCount, currentUser: req.session.user, typeOfPersonUser: true, logStatus, productToBuy, addresses })
    })
  } else {
    req.session.buyNowCheck = req.params.id
    res.redirect('/login')
  }
})

// Posting Checkout form fro buy now
router.post('/checkoutbuynow', async (req, res) => {

  if (req.session.LoggedIn) {

    if (req.body.saveaddress == 'on') {
      userHelpers.AddNewAddress(req.body, req.session.userDetails)
    }
    let product = await userHelpers.getProductForBuyNow(req.body.proId)
    if (req.body.totalAmount) {
      productprice = req.body.totalAmount
    } else {
      productprice = product.productprice
    }

    req.session.deliveryAddress = req.body
    // Decreasing Product stock when buying product        
    // Checking Whether the payement method is COD or online
    if (req.body.payment_method == 'COD') {
      userHelpers.placeOrder(req.body, product, productprice).then((orderId) => {
        req.session.currentOrderId = orderId
        userHelpers.decreaseProductQuantity(req.body.proId).then((result) => {
          res.json({ codSuccess: true })
        })
      })
    }
    else {
      // Razor Pay
      if (req.body.payment_method == 'razorpay') {
        var orderId = uuidv4()
        req.session.buyNowrazor = true
        req.session.buynowCheckOut = req.body
        userHelpers.generateRazorpay(orderId, productprice).then((response) => {
          res.json({ response: response, user: req.body })
        }).catch((err) => {
          res.redirect('/404')
        })
      }
      // Paypal
      else {
        userHelpers.generatePaypal(orderId, req.body.usdtoinr).then((paySuccess) => {
          userHelpers.placeOrder(req.body, product, productprice).then((orderIdReturned) => {
            req.session.currentOrderId = orderIdReturned
            userHelpers.changePaymentStatus(req.session.currentOrderId).then(() => {
              userHelpers.decreaseProductQuantity(req.body.proId).then((rslt) => {
                console.log("the result after dermetning : ",rslt)
                res.json(paySuccess)
              })
            })
          })
        }).catch((err) => {
          res.redirect('/404')
        })
      }

    }
  } else {
    res.redirect('/login')
  }
})

// Posting Checkout form for Cart
router.post('/checkout', async (req, res) => {
  if (req.session.LoggedIn) {

    if (req.body.saveaddress == 'on') {
      userHelpers.AddNewAddress(req.body, req.session.userDetails)
    }

    let products = await userHelpers.getCartProductList(req.session.userDetails)
    let totalPrice = await userHelpers.getTotalAmount(req.session.userDetails)


    if (req.body.totalAmount) {
      productprice = req.body.totalAmount
    } else {
      productprice = totalPrice
    }

    req.session.deliveryAddress = req.body
    req.session.razPayOnCart = req.body
    req.session.razPayCoupon = req.body.coupon

    // Checking Whether the payement method is COD or online
    if (req.body.payment_method == 'COD') {
      userHelpers.placeOrderOnCart(req.body, products, parseInt(productprice), req.body.coupon).then((orderId) => {
        req.session.currentOrderId = orderId
        userHelpers.decreseQuantityOncartOrder(products).then(() => {
          userHelpers.deleteCartProductsAfterOrder(req.session.userDetails)
          res.json({ codSuccess: true })
        })
      })
    } else {
      if (req.body.payment_method == 'razorpay') {

        var orderId = uuidv4()
        userHelpers.generateRazorpay(orderId, parseInt(productprice)).then((response) => {
          res.json({ response: response, user: req.body })
        }).catch((err) => {
          res.redirect('/404')
        })
      }
      // Pay pal 
      else {
        userHelpers.generatePaypal(uuidv4(), productprice).then((paySuccess) => {
          userHelpers.placeOrderOnCart(req.body, products, parseInt(productprice), req.body.coupon).then((orderId) => {
            req.session.currentOrderId = orderId
            userHelpers.decreseQuantityOncartOrder(products).then(() => {
              userHelpers.deleteCartProductsAfterOrder(req.session.userDetails)
              res.json(paySuccess)
            })
          })
        }).catch((err) => {
          res.redirect('/404')
        })
      }
    }
  }
  else {
    res.redirect('/login')
  }
})



// Getting order confirmed page
router.get('/orderconfirmed', (req, res) => {
  if (req.session.LoggedIn) {
    res.render('user/user-orderconfirmed', { title: 'Order Confirmed', currentUser: req.session.user, typeOfPersonUser: true, loginAndSignup: true, delivery: req.session.deliveryAddress })
  } else {
    res.redirect('/login')
  }
})


// Function to view the orders made by the user at view orders page
router.get('/vieworders', async (req, res) => {
  if (req.session.LoggedIn) {
    userHelpers.getUserOrders(req.session.userDetails).then(async (orders) => {
      singleProducts = await userHelpers.getSingleOrderedProducts(req.session.currentOrderId)
      console.log("the current order id is : ", req.session.currentOrderId)
      req.session.deleteCartProducts = true
      res.render('user/user-vieworders', { title: 'View Orders', user: true, currentUser: req.session.user, orders, typeOfPersonUser: true, logStatus, cartCount, singleProducts })
    })

  }
})


// Funtion to verify the payement done
router.post('/verify-payment', async (req, res) => {
  // Buy now
  if (req.session.buyNowrazor) {
    req.session.buyNowrazor = false
    var product = await userHelpers.getProductForBuyNow(req.session.buynowCheckOut.proId)
    if (req.session.buynowCheckOut.totalAmount) {
      productprice = req.session.buynowCheckOut.totalAmount
    } else {
      productprice = product.productprice
    }

    userHelpers.verifyPayment(req.body).then(() => {
      // place order
      userHelpers.placeOrder(req.session.buynowCheckOut, product, productprice).then((orderId) => {
        req.session.currentOrderId = orderId
        userHelpers.changePaymentStatus(req.session.currentOrderId).then(() => {
          userHelpers.decreaseProductQuantity(req.session.buynowCheckOut.proId).then((result) => {
            res.json({ status: true })
          })
        })
      })
    }).catch((err) => {
      res.json({ status: false })
    })
  }
  // Checkout Cart
  else {
    let products = await userHelpers.getCartProductList(req.session.userDetails)
    let totalPrice = await userHelpers.getTotalAmount(req.session.userDetails)

    if (req.session.razPayOnCart.totalAmount) {
      productprice = req.session.razPayOnCart.totalAmount
    } else {
      productprice = totalPrice
    }

    userHelpers.verifyPayment(req.body).then(() => {
      // Place order on cart
      userHelpers.placeOrderOnCart(req.session.razPayOnCart, products, parseInt(productprice), req.session.razPayCoupon).then((orderId) => {
        req.session.currentOrderId = orderId
        userHelpers.decreseQuantityOncartOrder(products).then(() => {
          userHelpers.deleteCartProductsAfterOrder(req.session.userDetails)
          res.json({ status: true })
        })
      })
    }).catch((err) => {
      res.json({ status: false })
    })
  }
})

// Funtion to get the user proffile page 
// The page will be loaded with the users details
router.get('/userprofile', async (req, res) => {
  if (req.session.LoggedIn) {
    userHelpers.getUser(req.session.userDetails).then((user) => {
      res.render('user/user-userprofile', { title: 'View Orders', user: true, currentUser: req.session.user, typeOfPersonUser: true, cartCount, user, logStatus })
    })
  } else {
    res.redirect('/login')
  }
})

// posting the user data if any changes done
router.post('/edituserprofile/:id', (req, res) => {
  var id = req.params.id
  userHelpers.editUserProfile(id, req.body).then((response) => {
    let profileImage = req.files.profileImage
    profileImage.mv('./public/profileImages/' + req.params.id + '1.jpg')
    res.redirect('/userprofile')
  })
})

// Funtion to get the your orders page
router.get('/yourorders', (req, res) => {
  if (req.session.LoggedIn) {
    userHelpers.getAllOrders(req.session.userDetails).then((orders) => {
      res.render('user/user-yourorders', { title: 'Your Orders', user: true, currentUser: req.session.user, typeOfPersonUser: true, cartCount, orders })
    })
  } else {
    res.redirect('/login')
  }
})

// Funtion to get the invoice of the specific order
router.get('/orderinvoice/:orderId/:proId/:proname', (req, res) => {

  userHelpers.getTheCurrentOrder(req.params.orderId, req.params.proId).then((order) => {
    console.log("REQ : ", order)
    res.render('user/user-invoice', { title: 'Invoice', loginAndSignup: true, typeOfPersonUser: true, cartCount, order, proName: req.params.proname })
  })
})



router.get('/useraddress', (req, res) => {
  if (req.session.LoggedIn) {
    userHelpers.getUserAddresses(req.session.userDetails).then((address) => {
      res.render('user/user-useraddress', { title: 'Address', user: true, currentUser: req.session.user, cartCount, typeOfPersonUser: true, address })
    })
  } else {
    res.redirect('/login')
  }
})

router.get('/addaddress', (req, res) => {
  if (req.session.LoggedIn) {
    res.render('user/user-addaddress', { title: 'Your Orders', user: true, currentUser: req.session.user, typeOfPersonUser: true })
  } else {
    res.redirect('/login')
  }
})

router.post('/addaddress', (req, res) => {
  userHelpers.AddNewAddress(req.body, req.session.userDetails).then((result) => {
    if (req.body.viaAjax) {
      res.json(result)
    } else {
      res.redirect('/useraddress')
    }
  })
})

router.get('/editaddress/:id', (req, res) => {
  userHelpers.getUserAddressesToEdit(req.session.userDetails, req.params.id).then((address) => {
    res.render('user/user-editaddress', { title: 'Your Orders', user: true, currentUser: req.session.user, typeOfPersonUser: true, address })
  })
})

router.post('/editaddress', (req, res) => {
  userHelpers.editUserAddress(req.body, req.session.userDetails, req.body.addressId).then((response) => {
    res.redirect('/useraddress')
  })
})

router.get('/deleteaddress/:id', (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.userDetails).then((response) => {
    res.redirect('/useraddress')
  })
})
// Function to cancel buynow orders
router.get('/cancelbuynoworder/:orderId/:proId', (req, res) => {
  userHelpers.cancelBuynowOrder(req.params.orderId, req.params.proId).then((response) => {
    res.redirect('/yourorders')
  })
})

router.get('/cancelcartorder/:proId/:orderId/:quantity', (req, res) => {
  userHelpers.cancelCartOrders(req.params.orderId, req.params.proId, parseInt(req.params.quantity)).then((response) => {
    res.redirect('/yourorders')
  })
})

router.get('/checkcoupon/:couponcode/:proPrice', (req, res) => {

  userHelpers.checkCouponCode(req.params.couponcode, req.params.proPrice, req.session.userDetails).then((coupon) => {
    res.json({ coupon })
  })
})

// Add to wishlist
router.get('/addtowishlist/:proId', (req, res) => {
  if (req.session.LoggedIn) {
    if (req.session.addToWishlist) {
      res.redirect('/wishlist')
    }
    userHelpers.addToWishlist(req.params.proId, req.session.userDetails).then((response) => {
      res.json(response)
    })
  } else {
    res.redirect('/login')
  }

})

router.get('/wishlist', (req, res) => {
  if (req.session.LoggedIn) {
    req.session.viewwishlist = false
    userHelpers.getUserWish(req.session.userDetails).then(async (wishProducts) => {
      let cartProductsTodisplay = await userHelpers.getCartProducts(req.session.userDetails)
      res.render('user/user-wishlist', { title: 'Wishlist', user: true, currentUser: req.session.user, typeOfPersonUser: true, wishProducts, cartProductsTodisplay })
    })
  } else {
    req.session.viewwishlist = true
    res.redirect('/login')
  }
})

router.get('/removefromwish/:proId/', (req, res) => {
  userHelpers.removeFromWish(req.params.proId, req.session.userDetails).then((response) => {
    res.json(response)
  })
})

// Posting review 
router.post('/postreviewform', (req, res) => {
  userHelpers.postUserReview(req.body).then((response) => {
    res.json(response)
  })
})

router.post('/search', async (req, res) => {
  var searchResult = await userHelpers.findSearch(req.body.key)
  res.json(searchResult)
})

router.get('/searchresult/:id', (req, res) => {
  console.log(req.body)
})

router.get('/test', (req, res) => {
  res.render('user/test', { title: 'Wishlist', user: true, currentUser: req.session.user, typeOfPersonUser: true })
})

router.get('/bikemodel/:brandId', (req, res) => {
  userHelpers.findBikeModels(req.params.brandId).then((models) => {
    res.render('user/user-bikemodel', { title: 'Wishlist', user: true, currentUser: req.session.user, typeOfPersonUser: true, models })
  })
})

router.post('/currencycoverter/:amount', (req, res) => {
  userHelpers.convertAmount(req.params.amount).then((total) => {
    res.json(total)
  })
})

router.get('/shop', async (req, res) => {


  if (req.session.LoggedIn) {
    req.session.shop = false

    allCategories = await adminHelper.fetchAllMainCategories()
    allBikeBrands = await adminHelper.getAllbikebrands()

    if (req.session.filters) {
      req.session.filters = false

      if (req.session.catPro) {
        products = req.session.catPro
        req.session.catPro = false
      }
      if (req.session.priceFilter) {
        products = req.session.priceFilter
        req.session.priceFilter = false
      }
      if (req.session.brandPro) {
        products = req.session.brandPro
        req.session.brandPro = false
      }

    } else {
      products = await userHelpers.getAllProducts()
    }

    res.render('user/user-shop', { title: 'Shop', user: true, logStatus: req.session.LoggedIn, theUser, currentUser: req.session.user, typeOfPersonUser: true, products, allCategories, allBikeBrands })
  } else {
    req.session.shop = true
    res.redirect('/login')
  }
})

router.get('/shopcat/', (req, res) => {
  if (req.session.LoggedIn) {

    if (req.query.catName) {
      userHelpers.applyCatFilter(req.query.catName).then((catProducts) => {
        req.session.catPro = catProducts
        req.session.filters = true
        res.redirect('/shop')
      })
    } else {
      req.session.filters = false
      res.redirect('/shop')
    }

  } else {
    res.redirect('/login')
  }
})

router.get('/shopprice/:min/:max', (req, res) => {

  userHelpers.getProductsByPriceFilter(req.params.min, req.params.max).then((products) => {
    req.session.priceFilter = products
    req.session.filters = true
    res.redirect('/shop')
  })
})

router.get('/shopbrand/:brandName', (req, res) => {
  userHelpers.findProductsInBrand(req.params.brandName).then((products) => {
    req.session.filters = true
    req.session.brandPro = products;
    res.redirect('/shop')
  })
})

router.get('/maincategoryproductsdisplay/:catName', (req, res) => {
  userHelpers.getProductOnMainCategory(req.params.catName).then((pro) => {
    res.render('user/user-categorydisplay', { title: 'Category', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true, pro })
  })
})

router.post('/editreview', (req, res) => {
  userHelpers.editReview(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/deletereview/:userId/:proId', (req, res) => {
  userHelpers.deleteReview(req.params.userId, req.params.proId).then((response) => {
    res.json(response)
  })
})

router.get('/getproductsonbikemodel/:bikeModel', (req, res) => {
  userHelpers.findProductsOnModels(req.params.bikeModel).then((pro) => {
    console.log("the pro : ", req.params.bikeModel)
    res.render('user/user-categorydisplay', { title: 'Category', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true, pro })
  })
})

router.get('/getallproductsofsubcategory/:subCat', (req, res) => {
  userHelpers.findProductsOnSubCategory(req.params.subCat).then((pro) => {
    res.render('user/user-categorydisplay', { title: 'Category', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true, pro })
  })
})

router.get('/getproductsonbikebrand/:bikeBrand', (req, res) => {
  userHelpers.findProductsOnBikeBrand(req.params.bikeBrand).then((pro) => {
    console.log("The pro are : ", pro);
    res.render('user/user-categorydisplay', { title: 'Category', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true, pro })
  })
})
router.get('/getproductsonprobrand/:proBrand', (req, res) => {
  userHelpers.findProductsInProBrand(req.params.proBrand).then((pro) => {
    res.render('user/user-categorydisplay', { title: 'Category', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true, pro })
  })
})

router.get('/about', (req, res) => {
  if (req.session.LoggedIn) {
    res.render('user/user-userAbout', { title: 'About', user: true, logStatus: req.session.LoggedIn, currentUser: req.session.user, typeOfPersonUser: true })
  } else {
    res.redirect('/login')
  }
})

// Logout
router.get('/logout', (req, res) => {
  req.session.LoggedIn = false
  req.session.LoggedInThruOtp = false
  req.session.loggedInErr = false
  res.redirect('/');
})

// The error page
router.get('/404', (req, res) => {
  res.render('404', { title: 'Error 404', loginAndSignup: true, typeOfPersonUser: true })
})
module.exports = router;