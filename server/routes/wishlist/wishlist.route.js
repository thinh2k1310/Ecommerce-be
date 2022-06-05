const express = require('express');

const wishlistController = require('./wishlish.controller');

// Bring in Models & Helpers
const auth = require('../../middleware/auth');

const wishlistRouter = express.Router();

wishlistRouter.post('/', auth, wishlistController.addProductToWishlist);

wishlistRouter.get('/', auth, wishlistController.getProductInWishlist);

module.exports = wishlistRouter;
