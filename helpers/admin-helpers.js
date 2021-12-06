var collection = require('../config/collection')
var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
const { v4: uuidv4 } = require('uuid');


module.exports = {

    findAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            var response = {}

            var allOrdersTotalCount = await db.get().collection(collection.orders).find().count()
            var allBuyNowPendingOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'pending' }).count()
            var allBuyNowplacedOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'placed' }).count()
            var allBuyNowshippedOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'shipped' }).count()
            var allBuyNowdeliveredOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'delivered' }).count()
            var allBuyNowcancelOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'cancel' }).count()
            var date = new Date().toISOString().slice(0, 10)
            var totalOrdersToday = await db.get().collection(collection.orders).find({ orderDate: date }).count()


            var allCartpendingOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'pending' }
                }, {
                    $project: {
                        quantity: '$products.quantity'
                    }
                }, {
                    $group: {
                        _id: null,
                        totalPendingOrders: { $sum: '$quantity' }
                    }
                }
            ]).toArray()

            var allCartplacedOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'placed' }
                }, {
                    $project: {
                        quantity: '$products.quantity'
                    }
                }, {
                    $group: {
                        _id: null,
                        totalPendingOrders: { $sum: '$quantity' }
                    }
                }
            ]).toArray()

            var allCartshippedOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'shipped' }
                }, {
                    $project: {
                        quantity: '$products.quantity'
                    }
                }, {
                    $group: {
                        _id: null,
                        totalPendingOrders: { $sum: '$quantity' }
                    }
                }
            ]).toArray()

            var allCartdeliveredOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'delivered' }
                }, {
                    $project: {
                        quantity: '$products.quantity'
                    }
                }, {
                    $group: {
                        _id: null,
                        totalPendingOrders: { $sum: '$quantity' }
                    }
                }
            ]).toArray()

            var allCartcancelledOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'cancel' }
                }, {
                    $project: {
                        quantity: '$products.quantity'
                    }
                }, {
                    $group: {
                        _id: null,
                        totalPendingOrders: { $sum: '$quantity' }
                    }
                }
            ]).toArray()

            if (allCartpendingOrders[0]) {
                allCartpendingOrders = allCartpendingOrders[0].totalPendingOrders
            } else {
                allCartpendingOrders = 0
            } if (allCartplacedOrders[0]) {
                allCartplacedOrders = allCartplacedOrders[0].totalPendingOrders
            } else {
                allCartplacedOrders = 0
            } if (allCartshippedOrders[0]) {
                allCartshippedOrders = allCartshippedOrders[0].totalPendingOrders
            } else {
                allCartshippedOrders = 0
            } if (allCartdeliveredOrders[0]) {
                allCartdeliveredOrders = allCartdeliveredOrders[0].totalPendingOrders
            } else {
                allCartdeliveredOrders = 0
            } if (allCartcancelledOrders[0]) {
                allCartcancelledOrders = allCartcancelledOrders[0].totalPendingOrders
            } else {
                allCartcancelledOrders = 0
            }

            allPendingOrders = parseInt(allBuyNowPendingOrders + allCartpendingOrders)
            allPlacedOrders = parseInt(allBuyNowplacedOrders + allCartplacedOrders)
            allShippedOrders = parseInt(allBuyNowshippedOrders + allCartshippedOrders)
            allDeliveredOrders = parseInt(allBuyNowdeliveredOrders + allCartdeliveredOrders)
            allCancelledOrders = parseInt(allCartcancelledOrders + allBuyNowcancelOrders)

            var allOrders = allPendingOrders + allPlacedOrders + allShippedOrders + allDeliveredOrders
            console.log("THE ORDERS : ", allOrders)
            resolve({ allPendingOrders, allPlacedOrders, allShippedOrders, allDeliveredOrders, allCancelledOrders, allOrders, totalOrdersToday, allOrdersTotalCount })
        })
    },
    fetchDeliveredProductsOfTodayBuyNow: () => {
        return new Promise(async (resolve, reject) => {
            var deliveredBuyNow = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'delivered', orderDate: new Date().toISOString().slice(0, 10) }).count()
            var ordersCart = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { orderDate: new Date().toISOString().slice(0, 10) }
                },
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'delivered' }
                }, {
                    $count: 'deliveredCount'
                }
            ]).toArray()
            // ordersCart[0].deliveredCount
            if (ordersCart.length <= 0) {
                ordersCart.push({ deliveredCount: 0 })
            }
            totalOrdersDeliveredToday = ordersCart[0].deliveredCount + deliveredBuyNow

            var placedBuynow = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'placed', orderDate: new Date().toISOString().slice(0, 10) }).count()
            var palacedCart = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { orderDate: new Date().toISOString().slice(0, 10) }
                },
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'placed' }
                }, {
                    $count: 'deliveredCount'
                }
            ]).toArray()
            if (palacedCart.length <= 0) {
                palacedCart.push({ deliveredCount: 0 })
            }
            totalOrdersPlacedToday = palacedCart[0].deliveredCount + placedBuynow

            var cancelBuynow = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'cancel', orderDate: new Date().toISOString().slice(0, 10) }).count()
            var cancelCart = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { orderDate: new Date().toISOString().slice(0, 10) }
                },
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'cancel' }
                }, {
                    $count: 'cancelCount'
                }
            ]).toArray()
            if (cancelCart.length <= 0) {
                cancelCart.push({ cancelCount: 0 })
            }

            var totalProducts = await db.get().collection(collection.newproducts).find({ productquantity: { $gte: 1 } }).count()
            var totalCancel = cancelBuynow + cancelCart[0].cancelCount
            var totalCod = await db.get().collection(collection.orders).find({ orderDate: new Date().toISOString().slice(0, 10), payment_method: 'COD' }).count()

            var activeUsers = await db.get().collection(collection.userDatabase).find({ block: 'false' }).count()

            var itemsLowOnStock = await db.get().collection(collection.newproducts).find({ $and: [{ productquantity: { $gte: 1 } }, { productquantity: { $lte: 5 } }] }).count()
            var productsOnOffer = await db.get().collection(collection.newproducts).find({ offer: { $exists: true } }).count()

            var stockOverProducts = await db.get().collection(collection.newproducts).find({ productquantity: { $lte: 0 } }).toArray()

            resolve([totalOrdersDeliveredToday, totalOrdersPlacedToday, totalCancel, totalCod, activeUsers, totalProducts, itemsLowOnStock, productsOnOffer, stockOverProducts])
        })
    },
    // TO add a product
    addProduct: (productData) => {
        let productData1 = {
            productname: productData.productname,
            productcode: productData.productcode,
            productcategory: productData.productcategory,
            productsubcategory: productData.productsubcategory,
            productbrand: productData.productbrand,
            suitablebikebrand: productData.suitablebikebrand,
            suitablebikemodel: productData.suitablebikemodel,
            productprice: parseInt(productData.productprice),
            productofferprice: parseInt(productData.productprice),
            productquantity: parseInt(productData.productquantity),
            productdate: new Date().getTime(),
            productdes: productData.productdes,
            status: productData.status,
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collection.newproducts).insertOne(productData1).then(async (data) => {
                resolve(data.insertedId);
            })
        })
    },
    //    To get all products in view products
    getAllproducts: () => {
        return new Promise(async (resolve, reject) => {
            var productData = await db.get().collection(collection.newproducts).find().toArray();
            resolve(productData);
        })
    },
    //    To get a product on edit product page
    getProductToEdit: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.newproducts).findOne({ _id: objectId(productId) }).then((response) => {
                resolve(response)
            })

        })
    },
    //    To make upload the changes made to the product
    updateProduct: (productId, data) => {

        return new Promise((resolve, reject,) => {
            db.get().collection(collection.newproducts).updateOne({ _id: objectId(productId) }, { $set: { productname: data.productname, productcode: data.productcode, productcategory: data.productcategory, productsubcategory: data.productsubcategory, productbrand: data.productbrand, suitablebikebrand: data.suitablebikebrand, suitablebikemodel: data.suitablebikemodel, productprice: parseInt(data.productprice), productofferprice: parseInt(data.productofferprice), productquantity: parseInt(data.productquantity), productdate: data.productdate, productdes: data.productdes, status: data.status } }).then((result) => {
                resolve();
            })
        })
    },
    
    // To delte a product
    deleteproduct: (productId) => {
        console.log("the erwer", productId )
        return new Promise((resolve, reject) => {
            db.get().collection(collection.cartItems).update({}, { $pull: { products: { item : objectId(productId) } } }).then((response) => {
                console.log("HHHHH : ",response)
                resolve(response)
            })

            // db.get().collection(collection.newproducts).deleteOne({ _id: objectId(productId) }).then((result) => {
               
            // })

        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUser = await db.get().collection(collection.userDatabase).find().toArray()
            resolve(allUser);
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.userDatabase).updateOne({ _id: objectId(userId) }, { $set: { block: 'true' } })
            resolve(user)
        })
    },
    unBlockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let unBlockuser = await db.get().collection(collection.userDatabase).update({ _id: objectId(userId) }, { $set: { block: 'false' } })
            resolve(unBlockuser)
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            var orders = await db.get().collection(collection.orders).find().toArray()
            resolve(orders)
        })
    },
    updateOrderStatus: (orderId, userId, orderStatus, proId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.orders).updateOne({ _id: objectId(orderId), products: { $elemMatch: { item: objectId(proId) } } }, { $set: { 'products.$.status': orderStatus } }).then((response) => {
                resolve(response);
            })
        })
    },
    updateOrderStatusofbuynow: (orderId, userId, orderStatus, proId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.orders).updateOne({ _id: objectId(orderId) }, { $set: { status: orderStatus } }).then((response) => {
                resolve(response);
            })
        })
    },
    getUserCartOrders: (orderId, userId) => {

        return new Promise(async (resolve, reject) => {
            var cartOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $unwind: '$delivery'
                },
                {
                    $project: {
                        proId: '$products.item',
                        // Want to add a proId field for item that have beign puchased via buy now
                        userId: '$userId',
                        proName: '$products.productname',
                        proPrice: '$products.price',
                        status: '$products.status',
                        date: '$orderDate',
                        total: '$totalAmount',
                        userName: '$delivery.firstname',
                        destination: '$delivery.pincode',
                        payement: '$payment_method',
                    }
                }
            ]).toArray()

            resolve(cartOrders)
        })

    },
    getBuyNowOrders: (userId, orderId) => {
        return new Promise(async (resolve, reject) => {
            var orders = await db.get().collection(collection.orders).find({ _id: objectId(orderId) }).toArray()
            resolve(orders[0])
        })
    },
    addNewMainCat: (catDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.productCat).insertOne(catDetails).then((response) => {
                resolve(catDetails)
            })
        })

    }, fetchAllMainCategories: () => {
        return new Promise(async (resolve, reject) => {
            var allCategories = await db.get().collection(collection.productCat).find().toArray()

            if (allCategories) {

                resolve(allCategories)
            }
            else {
                resolve(false)
            }
        })
    }, addSubCategory: (catData) => {

        return new Promise(async (resolve, reject) => {
            var newId = uuidv4()
            db.get().collection(collection.productCat).updateOne({ _id: objectId(catData.mainCatId) }, { $push: { SubCategory: { id: newId, subCat: catData.subCat } } }).then((id) => {
                resolve(newId);
            })
        })
    },
    deleteSubcat: (index, id, subName) => {
        return new Promise((resolve, reject) => {
            SubCategory = `SubCategory. ${index}`
            db.get().collection(collection.productCat).updateOne({ _id: objectId(id) }, { $pull: { SubCategory: { id: subName } } }).then((response) => {

                resolve()
            })
        })

    },
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.productCat).deleteOne({ _id: objectId(id) }).then(() => {
                resolve()
            })

        })
    },
    addProBrand: (brand) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.proBrands).insertOne({ ProBrand: brand }).then((result) => {
                resolve(result.insertedId)
            })
        })
    }, findAllProductBrands: () => {
        return new Promise(async (resolve, reject) => {
            var allBrands = await db.get().collection(collection.proBrands).find().toArray();
            resolve(allBrands);
        })
    }, deleteBrand: (brandId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.proBrands).deleteOne({ _id: objectId(brandId) }).then((result) => {
                resolve();
            })
        })
    },
    addBikeBrand: (bikeBrand) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.bikeBrands).insertOne({ bikeBrand: bikeBrand }).then((result) => {
                resolve(result.insertedId)
            })
        })
    },
    getAllbikebrands: () => {
        return new Promise(async (resolve, reject) => {
            var brands = await db.get().collection(collection.bikeBrands).find().toArray()
            resolve(brands)
        })
    }, addBikeModel: (models) => {
        return new Promise((resolve, reject) => {
            let newId = uuidv4();
            db.get().collection(collection.bikeBrands).updateOne({ _id: objectId(models.bikeBrandId) }, { $push: { models: { bikemodels: models.bikemodel, id: newId } } }, { multi: true }).then((result) => {
                resolve([result, newId])
            })
        })
    }, deleteBikeModel: (index, iD, name) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.bikeBrands).updateOne({ _id: objectId(iD) }, { $pull: { models: { id: name } } }).then((result) => {
                resolve()
            })
        })
    },
    deleteBikeBrand: (id) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.bikeBrands).deleteOne({ _id: objectId(id) }).then((result) => {

                resolve();
            })
        })

    },
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            var coupons = await db.get().collection(collection.coupon).find().toArray()
            resolve(coupons)
        })
    },
    addCoupon: (coupon) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.coupon).insertOne({ couponcode: coupon.couponcode, coupondiscount: parseInt(coupon.coupondiscount), coupondate: new Date().toISOString().slice(0, 10), couponexpiry: coupon.couponexpiry }).then((response) => {
                resolve(response)
            })
        })

    },
    checkCouponCode : (couponCode)=>{
        return new Promise(async(resolve,reject)=>{            
            var coupon = await db.get().collection(collection.coupon).findOne({ couponcode: couponCode})
            resolve(coupon)
        })
    },
    getCouponToEdit: (couponId) => {
        return new Promise(async (resolve, reject) => {
            coupon = await db.get().collection(collection.coupon).findOne({ _id: objectId(couponId) })
            resolve(coupon)
        })
    },
    editCoupon: (couponDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.coupon).updateOne({ _id: objectId(couponDetails.couponId) }, { $set: { couponcode: couponDetails.couponcode, coupondiscount: parseInt(couponDetails.coupondiscount), coupondate: new Date().toISOString().slice(0, 10), couponexpiry: couponDetails.couponexpiry} }).then((response) => {
                resolve()
            })
        })
    },
    deleteCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.coupon).deleteOne({ _id: objectId(couponId) }).then((response) => {
                resolve()
            })
        })
    },
    checkOffer: (catName) => {
        return new Promise(async (resolve, reject) => {
            var offer = await db.get().collection(collection.categoryoffer).findOne({ category: catName })
            if (offer) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    },
    addNewCatOffer: (offerDetails) => {
       
        return new Promise(async (resolve, reject) => {
            var d = new Date().toISOString().slice(0, 10)
            var day1 = new Date(d)
            var day2 = new Date(offerDetails.offerexpiry)
            var diff = day2.getTime() - day1.getTime()

            var offerdiscount = parseInt(offerDetails.offerdiscount)

            db.get().collection(collection.newproducts).updateMany({ productcategory: offerDetails.category, offer: { $exists: false } }, { $set: { offer: offerdiscount, offername: offerDetails.offername} })

            db.get().collection(collection.categoryoffer).insertOne({
                offerName: offerDetails.offername,
                category: offerDetails.category,
                offerexpiry: new Date(offerDetails.offerexpiry).getTime(),
                offercreatedAt: new Date(),
                offerdiscount: offerDetails.offerdiscount,
            }).then(async (result) => {
                var products = await db.get().collection(collection.newproducts).find({ productcategory: offerDetails.category, offername : { $exists: true }}).toArray()
                resolve(products)
            })
        })
    }, getAllCatOffers: () => {
        return new Promise(async (resolve, reject) => {
            var offers = await db.get().collection(collection.categoryoffer).find().toArray()
            resolve(offers)
        })
    }, updatePrice: (proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.newproducts).updateOne({ _id: objectId(proDetails._id) }, { $set: { productofferprice: proDetails.productprice, productprice: proDetails.productprice - (proDetails.productprice * proDetails.offer / 100).toFixed(2) } }).then((result) => {
                resolve(result)
            })
        })
    },    
    deleteoffer: (offerId, category,offername) => {
        
        return new Promise((resolve, reject) => {
            db.get().collection(collection.categoryoffer).deleteOne({ _id: objectId(offerId) }).then(async (rsponse) => {
                db.get().collection(collection.ads).deleteOne({ adForOfferCat: category }).then(async () => {
                    var products = await db.get().collection(collection.newproducts).find({ productcategory: category, offername :offername }).toArray()
                    resolve(products)
                })

            })
        })
    },
    deleteProOffer : (offerId , proName)=>{
    
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.productoffer).deleteOne({_id : objectId(offerId)}).then(async(response)=>{
                var proToUpdate = await db.get().collection(collection.newproducts).findOne({productname : proName})
                db.get().collection(collection.newproducts).updateOne({ productname: proName }, { $set: { productprice: proToUpdate.productofferprice }})
                db.get().collection(collection.newproducts).updateOne({ productname: proName }, { $unset: { offer : 1}})
                
                resolve(response)
            })
        })
    },
    updateProductsWhenOfferDeleted: (proToUpdate) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.newproducts).updateOne({ _id: objectId(proToUpdate._id) }, { $set: { productprice: proToUpdate.productofferprice } }, { $unset: { offer: proToUpdate.offer } }).then((result) => {
                db.get().collection(collection.newproducts).updateOne({ _id: objectId(proToUpdate._id) }, { $unset: { offer: proToUpdate.offer, offername: proToUpdate.offername} }).then((dltRslt) => {
                    resolve(dltRslt)
                })
            })
        })
    },

    checkOfferDate: () => {
        return new Promise(async (resolve, reject) => {
            var d = new Date().getTime()
            var offer = await db.get().collection(collection.categoryoffer).find({ offerexpiry: { $lte: d } }).toArray()
            resolve(offer)
        })
    },
    checkProOfferExpiry : ()=>{
        return new Promise(async(resolve,reject)=>{
            var today = new Date().getTime()
            var offer = await db.get().collection(collection.productoffer).find({ offerexpiry : {$lte : today}}).toArray()
            resolve(offer)
        })
    },
    checkCouponExpiry :()=>{
        return new Promise(async(resolve,reject)=>{
            var date = new Date().toISOString().slice(0,10)
            var coupon = await db.get().collection(collection.coupon).find({couponexpiry : {$lte:date}}).toArray()
            resolve(coupon)
        })
    },
    getCatPro: (category) => {
        return new Promise(async (resolve, reject) => {
            productsUnderCategory = await db.get().collection(collection.newproducts).find({ productcategory: category.category }).toArray()
            resolve(productsUnderCategory)
        })
    },

    checkProductHaveOffer: (proId) => {
        return new Promise(async (resolve, reject) => {
            var product = await db.get().collection(collection.newproducts).findOne({ _id: objectId(proId) })

            if ('offer' in product) {
                resolve(true)
            } else {
                resolve(false)
            }

        })
    },
    addProOffer: (offerDetails) => {
        return new Promise(async (resolve, reject) => {
            var theProduct = await db.get().collection(collection.newproducts).findOne({ _id: objectId(offerDetails.product) })

            db.get().collection(collection.productoffer).insertOne({
                offername: offerDetails.offername,
                product: offerDetails.product,
                productName: theProduct.productname,
                offerexpiry:new Date(offerDetails.offerexpiry).getTime(),
                offerdiscount: parseInt(offerDetails.offerdiscount),
                offercreatedAt: new Date()
            }).then((result) => {
                console.log("The inserted result : ", result)
            })
            var discount = parseInt(offerDetails.offerdiscount)

            db.get().collection(collection.newproducts).updateOne({ _id: objectId(offerDetails.product) }, { $set: { productofferprice: theProduct.productprice, productprice: theProduct.productofferprice - theProduct.productofferprice * (discount / 100), offer: discount } }).then((offerApplied) => {
                resolve(offerApplied)
            })
        })
    },
    getAllProductOffer: () => {
        return new Promise(async (resolve, reject) => {
            var offers = await db.get().collection(collection.productoffer).find().toArray()
            resolve(offers)
        })
    },
    getOrderReportOnDate: (from, to) => {
        return new Promise(async (resolve, reject) => {
            var orders = await db.get().collection(collection.orders).find({
                $and: [
                    { orderDate: { $gte: from } }, { orderDate: { $lte: to } }
                ]
            }).toArray()
            resolve(orders)

        })
    },
    getSpecificOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            var order = await db.get().collection(collection.orders).findOne({ _id: objectId(orderId) })
            resolve(order)
        })
    },
    getDeliveredOrders: () => {
        return new Promise(async (resolve, reject) => {
            var buyNowDelivered = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'delivered' }).toArray()
            var deliveredCArtOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'delivered' }
                }
            ]).toArray()

            resolve([buyNowDelivered, deliveredCArtOrders])
        })
    },
    getDeliveryOnDate: (from, to) => {
        return new Promise(async (resolve, reject) => {
            var buyNowOrders = await db.get().collection(collection.orders).find({ mode: 'buynow', status: 'delivered', $and: [{ orderDate: { $gte: from } }, { orderDate: { $lte: to } }] }).toArray()
            cartOrders = await db.get().collection(collection.orders).aggregate([
                {
                    $match: { mode: 'cartorder' }
                }, {
                    $match: {
                        $and: [
                            { orderDate: { $gte: from } }, { orderDate: { $lte: to } }
                        ]
                    }
                }, {
                    $unwind: '$products'
                }, {
                    $match: { 'products.status': 'delivered' }
                }
            ]).toArray()


            resolve([buyNowOrders, cartOrders])
        })
    },
    addAds: (adDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ads).insertOne({ adFor: 'category', adForOfferCat: adDetails.offerCat }).then((response) => {
                resolve(response.insertedId)
            })
        })
    },
    deleteAd: (adId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ads).deleteOne({ _id: objectId(adId) }).then((response) => {
                resolve(response)
            })
        })
    },
    addProAds: (proAdDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ads).insertOne({ adFor: 'product', adForProduct: proAdDetails.productAd }).then((response) => {
                resolve(response.insertedId)
            })
        })
    },
    getTheSubCatOfMainCat : (mainCat)=>{
        return new Promise(async(resolve,reject)=>{
            var subCats = await db.get().collection(collection.productCat).aggregate([
                {
                    $match: { mainCategory : mainCat}
                },{
                    $unwind: '$SubCategory'
                },{
                    $project : {
                        'SubCategory' : 1,
                    }
                }
            ]).toArray()

         
            resolve(subCats)
        })
    },
    getAllBikeModels : (brand)=>{
        return new Promise(async(resolve,reject)=>{
            var models = await db.get().collection(collection.bikeBrands).aggregate([
                {
                    $match: { bikeBrand : brand}
                },{
                    $unwind: '$models'
                },{
                    $project:{
                        'models' : 1
                    }
                }
            ]).toArray()

            console.log("The models are : ", models)
            resolve(models)
        })
    }

}   