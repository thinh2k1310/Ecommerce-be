// Bring in Models & Helpers
const Wishlist = require('../models/wishlist');
const { FormatData } = require('../utils');

//All business goes here
class WishlistService {
    async addProductToWishlist(product, isLiked,user){
        const update = {
            product,
            isLiked,
            updated: Date.now()
          };
          const query = { product: update.product, user: user._id };
      
          const updatedWishlist = await Wishlist.findOneAndUpdate(query, update, {
            new: true
          });

          if (updatedWishlist !== null) {
            const message = 'Your Wishlist has been updated successfully!';
            return FormatData(updatedWishlist, message);
          } else {
            const wishlist = new Wishlist({
              product,
              isLiked,
              user: user._id
            });
      
            const wishlistDoc = await wishlist.save();
            if (wishlistDoc){
                const message = 'Added to your Wishlist successfully!';
            return FormatData(wishlistDoc, message);
            }else {
                throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
            }
          }
    }

    async getProductInWishlist(user){
        const wishlist = await Wishlist.find({ user, isLiked: true })
      .populate({
        path: 'product',
        select: 'name slug price imageUrl'
      })
      .sort('-updated');
      if (wishlist){
        return FormatData(wishlist);
    }else {
        throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
    }

    }
}

module.exports = WishlistService;