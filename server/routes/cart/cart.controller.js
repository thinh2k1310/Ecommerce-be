const Cart = require('../../models/cart');
const Product = require('../../models/product');
const store = require('../../helpers/store');


async function getAllMyCarts(req, res) {
  try {
    const carts = await Cart.find(
      {
        user: req.user
      }
    );

    res.status(200).json({
      carts
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }

}

async function addProductToCart(req, res) {
  try {
    const products = req.body.products;
    const product = await Product.findById(products[0].product._id);
    
    
    if (product.quantity < products[0].quantity){
      res.status(400).json({
        error: `Only ${product.quantity} left in stock. Please take less!`
      });
      return;
    }
    const cart = await Cart.findOne(
      {
        $and: [
          { user: req.user._id },
          { merchant: products[0].merchant }
        ]
      }
    );
    if (cart != null) {
      const items = req.body.products;
      const firstProduct = items[0];
      
      let existProduct = -1;
      cart.products.forEach((item, index) => {
        if ((item.product._id.toString()) == (firstProduct.product._id)) {
          existProduct = index;
        }
      });
      if (existProduct != -1) {
        decreaseInventory([firstProduct]);
        firstProduct.quantity += cart.products[existProduct].quantity
        const updatedProducts = store.caculateItemsPrice([firstProduct]);
        const query = { _id: cart._id };
        await Cart.updateOne(query, { $pull: { products: cart.products[existProduct] } }).exec();
        await Cart.updateOne(query, { $push: { products: updatedProducts } }).exec();
        res.status(200).json({
          success: true
        });
      }
      else {
        const products = store.caculateItemsPrice(items);
        const query = { _id: cart._id };

        const cartDoc = await Cart.updateOne(query, { $push: { products: products } }).exec();
        decreaseInventory(products);
        res.status(200).json({
          success: true,
          cartDoc
        });
      }

    }
    else {
      const user = req.user._id;
      const items = req.body.products;
      const products = store.caculateItemsPrice(items);
      const merchant = products[0].merchant;
      const cart = new Cart({
        user,
        products,
        merchant
      });

      const cartDoc = await cart.save();

      decreaseInventory(products);

      res.status(200).json({
        success: true,
        cart: cartDoc
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
async function increaseQuantityOne(req, res) {
  try {
    const productId =  req.params.productId;
    const query = { _id: req.params.cartId };
    let cart = await Cart.findById(req.params.cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (productId)) {
        element = index;
      }
    });
    decreaseInventoryOne([cart.products[element]]);
    const price = cart.products[element].purchasePrice;
    await Cart.updateOne(
      query,
      { $inc: { "products.$[element].quantity": + 1 } },
      { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    await Cart.updateOne(
      query,
      {$inc : { "products.$[element].totalPrice": + price } },
     { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
async function decreaseQuantityOne(req, res) {
  try {
    const query = { _id: req.params.cartId };
    const productId =  req.params.productId;
    let cart = await Cart.findById(req.params.cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (productId)) {
        element = index;
      }
    });
    increaseInventoryOne([cart.products[element]]);
    const price = cart.products[element].purchasePrice;
    
    await Cart.updateOne(
      query,
     {$inc : { "products.$[element].quantity": - 1 } },
     { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    await Cart.updateOne(
      query,
      {$inc : { "products.$[element].totalPrice": - price } },
     { arrayFilters: [{ "element._id": { $eq: productId } }] }
    );
    cart = await Cart.findById(req.params.cartId);
    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function deleteCart(req, res) {
  try {
    let cart = await Cart.findById(req.params.cartId);
    increaseQuantity(cart.products);
    await Cart.deleteOne({ _id: req.params.cartId });
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}


async function deleteProductFromCart(req, res) {
  try {
    const product = { product: req.params.productId };
    const query = { _id: req.params.cartId };
    let cart = await Cart.findById(req.params.cartId);
    let element = -1;
    cart.products.forEach((item, index) => {
      if ((item._id.toString()) == (req.params.productId)) {
        element = index;
      }
    });
    const updated = await Cart.updateOne(query, { $pull: { products: cart.products[element] } }).exec();
    increaseInventory([cart.products[element]]);
    const updatedCart = await Cart.findById(req.params.cartId);
    if(updatedCart.products.length == 0){
      await Cart.deleteOne({ _id: req.params.cartId });
    }
    res.status(200).json({
      success: true,
      updated
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}


const decreaseInventory = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity } }
      }
    };
  });
  Product.bulkWrite(bulkOptions);
};
const increaseInventory = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: +item.quantity } }
      }
    };
  });
  Product.bulkWrite(bulkOptions);
};
const decreaseInventoryOne = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity } }
      }
    };
  });
  Product.bulkWrite(bulkOptions);
};
const increaseInventoryOne = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: +item.quantity } }
      }
    };
  });
  Product.bulkWrite(bulkOptions);
};


module.exports = {
  getAllMyCarts,
  deleteCart,
  addProductToCart,
  deleteProductFromCart,
  increaseQuantityOne,
  decreaseQuantityOne
};
