const Product = require('../models/product');

exports.disableProducts = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { isActive: false }
      }
    };
  });

  Product.bulkWrite(bulkOptions);
};

// calculate order tax amount
exports.caculateItemPrice = order => {
  
  if (order.products && order.products.length > 0) {
    order.products.map(item => {
      const price = item.purchasePrice || item.product.price;
      const quantity = item.quantity;
      item.totalPrice = price * quantity;
      item.purchasePrice = price;
    });
  }


  const currentTotal = this.caculateOrderTotal(order);

  if (currentTotal !== order.total) {
    order.total = this.caculateOrderTotal(order);
  }

  order.totalWithTax = order.total + order.totalTax;
  order.total = parseFloat(Number(order.total.toFixed(2)));
  order.totalTax = parseFloat(
    Number(order.totalTax && order.totalTax.toFixed(2))
  );
  order.totalWithTax = parseFloat(Number(order.totalWithTax.toFixed(2)));
  return order;
};

exports.caculateOrderTotal = order => {
  const total = order.products
    .filter(item => item.status !== 'Cancelled')
    .reduce((sum, current) => sum + current.totalPrice, 0);

  return total;
};

// calculate order tax amount
exports.caculateItemsPrice = items => {
  const products = items.map(item => {
   
    item.totalPrice = 0;
    item.purchasePrice = item.price;

    const price = item.purchasePrice;
    const quantity = item.quantity;
    item.totalPrice = parseFloat(Number((price * quantity).toFixed(2)));

    return item;
  });

  return products;
};


