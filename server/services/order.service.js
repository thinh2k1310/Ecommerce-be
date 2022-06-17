const Order = require('../models/order');
const Cart = require('../models/cart');
const {paypal,createPayment} = require('./paypal');
const { FormatData } = require("../utils");

class OrderService{
    async proceedToCheckout(cart, merchant, user){
        const order = new Order({
            cart,
            user,
            merchant
          });
      
          const orderDoc = await order.save();
          await Cart.findByIdAndUpdate(cart, {isOrdered : true})
          if (orderDoc){
            const message = 'Your order has been placed successfully!';
            return FormatData(orderDoc, message);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }
    async cancelOrder(orderId,user){
        const order = await Order.findOne({ _id: orderId, user : user._id })
    await Order.deleteOne({_id: orderId});
    await Cart.findByIdAndUpdate(order.cart._id, {isOrdered : false})
          if (order){
            const message = 'Your order process has been canceled!';
            return FormatData(order, message);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }

    async getOrderById(orderId){
        let orderDoc = null;

      orderDoc = await Order.findOne({ _id: orderId }).populate({
        path: 'cart',
        select : 'total products',
        populate: {
          path: 'products.product',
          select : 'name imageUrl'
        },
      }).populate({
        path : 'user',
        select : 'firstName lastName'
      })
      if (orderDoc){
        return FormatData(orderDoc);
    }else {
        throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
    }

    }

    async completeOrder(address,phoneNumber,payment){
        const update = {
            address : address,
            phoneNumber : phoneNumber,
            payment : payment,
          }
          const orderDoc = await Order.findOneAndUpdate({_id : req.params.orderId}, update);
          if (orderDoc){
            const message = 'Order has been completed!';
            return FormatData(orderDoc,message);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }

    async makePayment(orderId,user){
        const order = await Order.findOne({ _id: orderId, user : user._id }).populate({
            path: 'cart',
            select : 'total',
          });
          const createPaymentJson = createPayment(order.cart.total);
          paypal.payment.create(createPaymentJson, function (error, payment) {
            if (error) {
                throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
            } else {
                const message = 'Continue making payment with paypal...';
                return FormatData(payment,message);
            }
        });
    }

    async changeStatus(orderId,update){
        const order = await Order.findOneAndUpdate({_id :orderId}, update);
        if (order){
            const message = 'Order status has been updated!';
            return FormatData(order,message);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }

    async getAllUserOrder(user){
        const orders = await Order.find({user : user._id});
        if (orders){
            return FormatData(orders);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }

    async getAllMerchantOrder(merchantId){
        const orders = await Order.find({merchant : merchantId}).populate({
            path: 'cart',
            select : 'total products',
            populate: {
              path: 'products.product',
              select : 'name imageUrl'
            }
          });
        if (orders){
            return FormatData(orders);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }

}
module.exports = OrderService;
