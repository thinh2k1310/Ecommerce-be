const paypal = require('paypal-rest-sdk');
const keys = require('../config/keys');

const {clientId, secret} = keys.paypal;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': clientId,
    'client_secret': secret
});
function createPayment(total){
    var finalToTal = parseFloat(Number((total / 23150).toFixed(2)));
    return {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/api/order/6285aeb9c997148a76a1eb69",
        "cancel_url": "http://cancel.url"
    },
    "transactions": [{

        "amount": {
            "currency": "USD",
            "total": finalToTal.toString()
        },
        "description": "This is the payment description."
    }]
    }
};


module.exports = {
    paypal,
    createPayment
}