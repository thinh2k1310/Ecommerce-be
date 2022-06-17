const OrderService = require('../../services/order.service');


const service = new OrderService();


async function proceedToCheckout(req, res, next){
  try {
    const cart = req.body.cart;
    const merchant = req.body.merchant;
    const user = req.user._id;

    const data  = await service.proceedToCheckout(cart,merchant,user);
  return res.status(200).json(data);
  }catch(error){
    next(error);
  }
}
async function cancelOrder(req, res, next){
  try {
    const orderId = req.params.orderId;
    const user = req.user;
    const data = service.cancelOrder(orderId,user);
    return res.status(200).json(data);
  }catch(error){
    next(error);
  }
}
async function getOrderById(req, res, next){
    try {
      const orderId = req.params.orderId;
      const data = service.getOrderById(orderId);
      return res.status(200).json(data);
    }catch(error){
      next(error);
    }
}
async function completeOrder(req,res, next){
  try{
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const payment = req.body.payment;
   
    const data = service.completeOrder(address,phoneNumber,payment);
    return res.status(200).json(data);
    }catch(error){
      next(error);
    }
    
}
async function makePayment(req,res, next){
  try{
    const orderId = req.params.orderId;
    const user = req.user;
    
    const data = await service.makePayment(orderId,user)
    return res.status(200).json(data);
    }catch(error){
      next(error);
    }
}
async function changeStatus(req,res, next){
  try{
    const update = req.body;
    const orderId = req.params.orderId;
    const data = await service.changeStatus(orderId,update);
    return res.status(200).json(data);
    }catch(error){
      next(error);
    }
}

async function getAllUserOrder(req, res, next){
  try {
    const user = req.user;
  
    const data = await service.getAllUserOrder(user)
    return res.status(200).json(data);
  }catch(error){
    next(error);
  }
}

async function getAllMerchantOrder(req, res, next){
  try {
    const merchantId = req.user.merchant;

    const data = await service.getAllMerchantOrder(merchantId);
    return res.status(200).json(data);
  }catch(error){
    next(error);
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
