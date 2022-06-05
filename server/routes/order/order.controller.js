const express = require('express');
const Mongoose = require('mongoose');

// Bring in Models & Helpers
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const {paypal,createPayment} = require('../../services/paypal');


async function proceedToCheckout(req, res){
  try {
    const cart = req.body.cart;
    const merchant = req.body.merchant;
    const user = req.user._id;

    const order = new Order({
      cart,
      user,
      merchant
    });

    const orderDoc = await order.save();
    await Cart.findByIdAndUpdate(cart, {isOrdered : true})

    res.status(200).json({
      success: true,
      message: `Your order has been placed successfully!`,
      order: orderDoc
    });
  } catch (error) {
      console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function cancelOrder(req, res){
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ _id: orderId, user : req.user._id })
    await Order.deleteOne({_id: orderId});
    console.log(order);
    await Cart.findByIdAndUpdate(order.cart._id, {isOrdered : false})

    res.status(200).json({
      success: true,
      message: `Your order process has been canceled!`,
      order
    });
  } catch (error) {
      console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function getOrderById(req, res){
    try {
      const orderId = req.params.orderId;
      
  
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
    
      if (!orderDoc) {
        return res.status(404).json({
          message: `Cannot find order with the id: ${orderId}.`
        });
      }
  
      // let order = {
      //   _id: orderDoc._id,
      //   products: orderDoc?.cart?.products,
      //   created: orderDoc.created,
      //   cartId: orderDoc.cart._id
      // };
      res.status(200).json({
        success : true,
        data : orderDoc
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success : false,
        message: 'Your request could not be processed. Please try again.'
      });
    }
}
async function completeOrder(req,res){
  try{
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const payment = req.body.payment;
   

    const update = {
      address : address,
      phoneNumber : phoneNumber,
      payment : payment,
    }

    if (!address) {
      return res
        .status(400)
        .json({ error: 'You must enter an address.' });
    }

    if (!phoneNumber) {
      return res.status(400).json({ error: 'You must enter a phone number.' });
    }

    if (!payment) {
      return res.status(400).json({ error: 'You must choose a payment.' });
    }

    const orderDoc = await Order.findOneAndUpdate({_id : req.params.orderId}, update);
    res.status(200).json({
      success: true,
      message: 'Order has been completed!',
      data : orderDoc
    });
  } catch (error){
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function makePayment(req,res){
  try{
    const orderId = req.params.orderId;
    const userId = req.user._id;
  

    const order = await Order.findOne({ _id: orderId, user : userId }).populate({
      path: 'cart',
      select : 'total',
    });
    const createPaymentJson = createPayment(order.cart.total);
    paypal.payment.create(createPaymentJson, function (error, payment) {
      if (error) {
        res.status(400).json({
          error: error
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'Continue making payment with paypal...',
          data : payment
        });
      }
  });
  }catch (error){
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function changeStatus(req,res){
  try{
    const update = req.body;

    const order = await Order.findOneAndUpdate({_id : req.params.orderId}, update);
    res.status(200).json({
      success: true,
      message: 'Order\'s status has been modified!',
    });
  } catch (error){
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

async function getAllUserOrder(req, res){
  try {
    const userId = req.user._id;
  
    const orders = await Order.find({user : userId});
    res.status(200).json({
      success : true,
      data : orders
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

async function getAllMerchantOrder(req, res){
  try {
    const merchantId = req.user.merchant;

    const orders = await Order.find({merchant : merchantId}).populate({
      path: 'cart',
      select : 'total products',
      populate: {
        path: 'products.product',
        select : 'name imageUrl'
      }
    });
    res.status(200).json({
      success : true,
      data : orders
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message: 'Your request could not be processed. Please try again.'
    });
  }
}


module.exports = {
    proceedToCheckout,
    getOrderById,
    completeOrder,
    makePayment,
    cancelOrder,
    changeStatus,
    getAllUserOrder,
    getAllMerchantOrder
}
