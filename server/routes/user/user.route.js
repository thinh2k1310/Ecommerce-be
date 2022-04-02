const express = require('express');

const userRouter = express.Router();

userRouter.get('/:userId', (req, res) => {
    const userId = req.params.userId;
  
    User.findById(userId, (err, user) => {
      res.status(200).json({
        user: user
      });
    });
  });
  
  userRouter.post('/:userId', (req, res) => {
    const profile = req.body.profile;
    let query = { _id: req.params.userId };
  
    User.updateOne(query, { profile: profile }, (err, user) => {
      res.status(200).json({
        success: 'updated',
        user: user
      });
    });
  });

module.exports = userRouter;