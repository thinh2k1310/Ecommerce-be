const CartService = require('../../services/cart.service');

const service = new CartService();


async function getAllMyCarts(req, res, next) {
  try {
    const user = req.user;
    const data = await service.getAllMyCarts(user);
    return res.status(200).json(data);
  }catch(error){
    next(error);
  }

}

async function addProductToCart(req, res, next) {
  try {
    const products = req.body.products;
    const data = await service.addProductToCart(products);
  } catch (error) {
    next(error);
  }
}
async function modifyQuantity(req, res) {
  try {
    const productId =  req.params.productId;
    const cartId = req.params.cartId ;
    const data =  await service.modifyQuantity(productId,cartId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function deleteCart(req, res) {
  try {
    const cartId = req.params.cartId;
    const data =  await service.deleteCart(cartId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}


async function deleteProductFromCart(req, res) {
  try {
    const productId = { product: req.params.productId };
    const cartId = req.params.cartId;
    const data =  await service.deleteProductFromCart(productId,cartId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}





module.exports = {
  getAllMyCarts,
  deleteCart,
  addProductToCart,
  deleteProductFromCart,
  modifyQuantity
};
