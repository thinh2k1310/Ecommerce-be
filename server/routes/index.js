const express = require('express');

const router = express.Router();

//Router
const authRouter = require('./auth/auth.route');
const userRouter = require('./user/user.route');

router.use('/auth',authRouter);
router.use('/user',userRouter);

module.exports = router;