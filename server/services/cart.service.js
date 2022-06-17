const Cart = require('../models/cart');
const Product = require('../models/product');
const store = require('../helpers/store');

class CartService {

    async getAllMyCarts(user) {
        const carts = await Cart.find(
            {
                user: user,
                isOrdered: false
            }
        ).populate('products.product')
            .populate('merchant', 'name');
        if (carts) {
            return FormatData(carts, message);
        } else {
            throw ({ status: 400, success: false, message: 'Your request could not be processed. Please try again.' });
        }
    }

    async addProductToCart(products) {
        const product = await Product.findById(products[0].product);


        if (product.quantity < products[0].quantity) {
            throw ({ status: 400, success: false, message: 'Only ${product.quantity} left in stock. Please take less!' });
        }
        const cart = await Cart.findOne(
            {
                $and: [
                    { user: req.user._id },
                    { merchant: products[0].merchant },
                    { isOrdered: false }
                ]
            }
        );
        if (cart != null) {
            const items = products;
            const firstProduct = items[0];

            let existProduct = -1;
            cart.products.forEach((item, index) => {
                if ((item.product._id.toString()) == (firstProduct.product)) {
                    existProduct = index;
                }
            });
            if (existProduct != -1) {
                decreaseInventory([firstProduct], null);
                firstProduct.quantity += cart.products[existProduct].quantity
                const updatedProducts = store.caculateItemsPrice([firstProduct]);
                const query = { _id: cart._id };
                await Cart.updateOne(query, { $pull: { products: cart.products[existProduct] } }).exec();
                await Cart.updateOne(query, { $push: { products: updatedProducts } }).exec();
                const cartt = await Cart.findOne(query);
                const total = store.caculateCartTotal(cartt.products);
                await Cart.updateOne(query, { $set: { total: total } });
                const message = 'Add product to cart successfully!';
                return FormatData(null, message);
            }
            else {
                const products = store.caculateItemsPrice(items);
                const total = store.caculateCartTotal(items);
                const query = { _id: cart._id };

                const cartDoc = await Cart.updateOne(query, {
                    $push: { products: products },
                    $inc: { total: total }
                }).exec();
                decreaseInventory(products, null);
                const message = 'Add product to cart successfully!';
                return FormatData(null, message);
            }

        }
        else {
            const user = req.user._id;
            const items = req.body.products;
            const products = store.caculateItemsPrice(items);
            const merchant = products[0].merchant;
            const total = store.caculateCartTotal(items);
            const cart = new Cart({
                user,
                products,
                merchant,
                total
            });

            const cartDoc = await cart.save();

            decreaseInventory(products, null);

            const message = 'Add product to cart successfully!';
            return FormatData(null, message);
        }
    }

    async modifyQuantity(productId,cartId,body){
    const previousQuantity = Number(body.previousQuantity);
    const nextQuantity = Number(body.nextQuantity);
    let cart = await Cart.findById(cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (productId)) {
        element = index;
      }
    });
    console.log(typeof(previousQuantity));
    const price = cart.products[element].purchasePrice;
    const check = await Product.findById(cart.products[element].product._id);
    if ((check.quantity+previousQuantity)-nextQuantity < 0){
        throw ({ status: 400, success: false, message: 'Only ${product.quantity} left in stock. Please take less!' });
    }
    await Cart.updateOne(
      query,
      { $set: { "products.$[element].quantity": nextQuantity } },
      { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    decreaseInventory([cart.products[element]],previousQuantity,nextQuantity);
    await Cart.updateOne(
      query,
      {$set : { "products.$[element].totalPrice": nextQuantity*price },
       $inc : { total : (nextQuantity-previousQuantity)*price }},
      { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    return FormatData(null, null);
    }

    async deleteCart(cartId) {
        
          let cart = await Cart.findById(cartId);
          increaseQuantity(cart.products);
          const deletedCart = await Cart.deleteOne({cartId });
          const message =  "Delete cart successfully!";
          if(deletedCart){
            return FormatData(null, message);    
          }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
          }
             
      }
      async  deleteProductFromCart(productId, cartId) {
          const query = { _id: cartId };
          let cart = await Cart.findById(cartId);
          let element = -1;
          cart.products.forEach((item, index) => {
            if ((item._id.toString()) == (productId)) {
              element = index;
            }
          });
         const deletedProduct = await Cart.updateOne(query, { $pull: { products: cart.products[element] } }).exec();
          increaseInventory([cart.products[element]]);
          const updatedCart = await Cart.findById(cartId);
          if(updatedCart.products.length == 0){
            const deletedCart = await Cart.deleteOne({ _id: cartId });
          }
          if(deletedCart){
            return FormatData(null);    
          }else if (deletedProduct){
            return FormatData(null);
          }
      }
    decreaseInventory = (products, previousQuantity, nextQuantity) => {
        let bulkOptions = products.map(item => {
            if (previousQuantity != null) {
                return {
                    updateOne: {
                        filter: { _id: item.product },
                        update: { $inc: { quantity: (previousQuantity - nextQuantity) } }
                    }
                };
            } else {
                return {
                    updateOne: {
                        filter: { _id: item.product },
                        update: { $inc: { quantity: -item.quantity } }
                    }
                }
            }
        });
        Product.bulkWrite(bulkOptions);
    };
    increaseInventory = (products) => {
        let bulkOptions = products.map(item => {
            return {
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { quantity: +item.quantity } }
                }
            }

        });
        Product.bulkWrite(bulkOptions);
    };

}
module.exports = CartService;