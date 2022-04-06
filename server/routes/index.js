const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const userRouter = require('./user/user.route');
const addressRouter = require('./address/address.route');

router.use('/auth',authRouter);
router.use('/user',userRouter);
router.use('/address',addressRouter);

module.exports = router;