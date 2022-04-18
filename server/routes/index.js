const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const userRouter = require('./user/user.route');
const addressRouter = require('./address/address.route');
const categoryRouter = require('./category/category.route');
const subcategoryRouter = require('./subcategory/subcategory.route');

router.use('/auth',authRouter);
router.use('/user',userRouter);
router.use('/address',addressRouter);
router.use('/category', categoryRouter);
router.use('/subcategory', subcategoryRouter);

module.exports = router;