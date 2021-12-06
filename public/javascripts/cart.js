const { response } = require("express")
const { DeactivationsList } = require("twilio/lib/rest/messaging/v1/deactivation")

async function addToCart(proId, proPrice, proName) {
   $.ajax({
        url: ' /add-to-cart/' + proId + '/' + proPrice + '/' + proName,
        method: 'get',
        success: async (response) => {
            if (response.status) {
                let count = $('#cartCount').html()
                count = parseInt(count) + 1
                $('#cartCount').html(count)
                reloadP()
            }
            
        }
    })
}

function reloadP() {
    sessionStorage.setItem("reloading", "true");
    document.location.reload();
}



function reloadingfunction() {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": function () {
            location.href = '/cart'
        },
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    toastr.success('Item Successfully added to cart')
}



function updateDiv() {
    $("#total").load(window.location.href + " #total");
}

function changeQuantity(proQty, cart_id, pro_id, count, price, totalprice, userId) {

    let quantity = parseInt(document.getElementById(pro_id).value)
    if (count == 1 && quantity == 8) {
        limitReachedInCart(quantity)
    } else {

        if (count == 1) {
            if (proQty - 1 >= quantity) {
                price = parseInt(price)
                totalprice = parseInt(totalprice)

                id = pro_id + '1'
                $.ajax({
                    url: '/change-product-quantity',
                    data: {
                        cart: cart_id,
                        product_id: pro_id,
                        count: count,
                        quantity: quantity,
                        price: price,
                        totalprice: price
                    },

                    method: 'POST',
                    success: (response) => {

                        if (response.removeProduct) {
                            location.reload()
                        }
                        else {
                            // Response. total
                            response.quantity = parseInt(response.quantity)
                            response.count = parseInt(response.count)
                            quantity = document.getElementById(pro_id).value = quantity + count;
                            document.getElementById(id).innerHTML = quantity * price;
                            document.getElementById('total').innerHTML = response.total
                            updateDiv()
                        }
                    }
                })
            } else {
                limitReachedInCart(quantity)
            }
        } else {
            if (quantity != 1) {

                price = parseInt(price)
                totalprice = parseInt(totalprice)

                id = pro_id + '1'
                $.ajax({
                    url: '/change-product-quantity',
                    data: {
                        cart: cart_id,
                        product_id: pro_id,
                        count: count,
                        quantity: quantity,
                        price: price,
                        totalprice: price
                    },

                    method: 'POST',
                    success: (response) => {

                        if (response.removeProduct) {
                            location.reload()
                        }
                        else {
                            response.quantity = parseInt(response.quantity)
                            response.count = parseInt(response.count)
                            quantity = document.getElementById(pro_id).value = quantity + count;
                            document.getElementById(id).innerHTML = quantity * price;
                            document.getElementById('total').innerHTML = response.total
                            updateDiv()
                        }
                    }
                })
            } else {
                limitOneInCart()
            }

        }
    }

}

function deleteCartItem(cart_id, pro_id) {
    $.ajax({
        url: '/delete-cart-product',
        data: {
            cart: cart_id,
            product_id: pro_id,
        },
        method: 'POST',
        success: (response) => {
            if (response) {
                sessionStorage.setItem("deletecartreloading", "true");
                document.location.reload();
            }
        }
    })
}

function showToastInDeletecart(){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr.success('Item successfully removed from cart')
}

function addToWishList(proId) {

    $.ajax({
        url: '/addtowishlist/' + proId,
        method: 'get',
        success: async (response) => {
            wishReload()
        }
    })
}

function wishReload(){
    sessionStorage.setItem("wishreloading", "true");
    document.location.reload();
}

function showToastInWishlist(){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": function (){
            location.href = '/wishlist'
        },
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr.success('Item successfully added to wishlist')
}

function showToastWhenRemoveWishlist(){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr.error('Item successfully removed from wishlist')
}


function removeFromWish(proId) {
    $.ajax({
        url: '/removefromwish/' + proId,
        method: 'get',
        success: (response) => {
            sessionStorage.setItem("wishremovereloading", "true");
            document.location.reload();
        }
    })
}

function showToastInDelteAddress(){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr.error('Address succesfully removed')
}