const WishlistService = require('../../services/wishlist.service');

const service = new WishlistService();

async function addProductToWishlist(req, res, next){
  try {
    const { product, isLiked } = req.body;
    const user = req.user;
    const data = await service.addProductToWishlist(product,isLiked,user);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

// fetch wishlist api
async function getProductInWishlist(req, res , next){
  try {
    const user = req.user._id;
    const data = await service.getProductInWishlist(user);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
    addProductToWishlist,
    getProductInWishlist
};
