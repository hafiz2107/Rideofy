// To delete products from admin's product view
function deleteswal(proId) {
    swal({
        title: "Are you sure you want to delete the product?",
        text: "Once deleted, you will not be able to recover !",
        icon: "error",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            location.href = '/admin/remove-product/' + proId
        }
    });
}

function deleteCartProduct(cartId, proId) {
    swal({
        title: "Are you sure you want to delete the product?",
        icon: "error",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            deleteCartItem(cartId, proId)
        }
    });
}

function limitReachedInCart(quantity) {
    swal({
        title: "Limit Reached !",
        text: `You can only add ${quantity} units of this product in your cart`,
        icon: "error",
        button: "Ok",
    });
}

function limitOneInCart() {
    swal({
        title: "OOPS !",
        text: `You Cannot decrease anymore quantity of the item`,
        icon: "info",
        button: "Ok",
    });
}

function cancelOrderBuyNow(orderId, proId) {
    swal({
        title: "Are you sure you want to cancel the order?",
        text: "Once deleted, you will not be able to undo !",
        icon: "error",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            location.href = '/cancelbuynoworder/' + orderId + '/' + proId
        }
    });
}

function confirmCheckOut(totalAmount) {
    swal({
        title: "Are you sure?",
        text: "Are you sure to proceed to checkout for the amount of ₹ " + totalAmount,
        icon: "info",
        button: "Proceed",
        dangerMode: false,
    })
        .then((willDelete) => {
            if (willDelete) {
                location.reload(true)
                location.assign("/checkout")
            }
        });
}

function cancelCartOrder(proId, orderId, proQty) {

    swal({
        title: "Are you sure?",
        text: "Are You sure you want to cancel the order ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                location.href = '/cancelcartorder/' + proId + '/' + orderId + '/' + proQty
            }
        });
}

function deleteOffer(offerId, category,offername) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {

                $.ajax({
                    url: '/admin/deleteoffer/?offerId=' + offerId + '&category=' + category + '&offername=' + offername,
                    method: 'get',
                    success: (response) => {
                        location.reload()
                    }
                })
            }
        });
}

function deleteProOffer(offerId,proName){
    alert(proName)
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {

                $.ajax({
                    url: '/admin/deleteProoffer/?offerId=' + offerId  + '&proName=' + proName,
                    method: 'get',
                    success: (response) => {
                        location.reload()
                    }
                })
            }
        });
}

function deleteAdSwal(id) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: '/admin/deletead/' + id,
                    method: 'get',
                    success: () => {
                        location.reload()
                    }
                })

            }
        });
}


function deleteComment(userId, proId) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: '/deletereview/' + userId + '/' + proId,
                    method: 'get',
                    success: () => {
                        location.reload()
                    }
                })

            }
        });
}

function deleteAdd(adId) {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover !",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        console.log("the id is : ", adId)
        $.ajax({
            url: '/deleteaddress/' + adId,
            method: 'get',
            success: () => {
                sessionStorage.setItem('adressdeleteloading', 'true')
                document.location.reload()
            }
        })

    });
}