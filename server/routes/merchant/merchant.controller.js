const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Bring in Models & Helpers
const Merchant = require('../../models/merchant');
const User = require('../../models/user');
const category = require('../../models/category');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const mailgun = require('../../services/mailgun');

async function createMerchant(req, res){
  try {
    const name = req.body.name;
    const business = req.body.business;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const category = req.body.category;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter your name and email.' });
    }

    if (!business) {
      return res
        .status(400)
        .json({ error: 'You must enter a business description.' });
    }

    if (!phoneNumber || !email) {
      return res
        .status(400)
        .json({ error: 'You must enter a phone number and an email Merchant.' });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ error: 'That email Merchant is already in use.' });
    }

    const merchant = new Merchant({
      name,
      email,
      business,
      phoneNumber,
      category
    });

    const merchantDoc = await merchant.save();

    await mailgun.sendEmail(email, 'merchant-application');

    res.status(200).json({
      success: true,
      message: 'created merchant: ' + merchant.name + ", id: " + merchant.id,
      merchant: merchantDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getAllMerchants(req, res){
    try {
      const merchants = await Merchant.find({}).sort('-created');

      res.status(200).json({
        merchants
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
}

async function getMerchantById(req, res){
  try {
    const merchantId = req.params.id;

    const merchantDoc = await Merchant.findOne({ _id: merchantId });

    if (!merchantDoc) {
      res.status(404).json({
        message: `No such merchant with the id: ${merchantId}.`
      });
    }

    res.status(200).json({
      merchantInfo: merchantDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.' + error
    });
  }
}
async function updateMerchant(req, res){
  try {
    const merchantId = req.params.id;
    const update = req.body;
    const query = { _id: merchantId };

    await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    res.status(200).json({
      success: true,
      message: 'Merchant has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function deleteMerchant(req, res){
    try {
      const merchant = await Merchant.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: `Merchant has been deleted successfully!`,
        merchant
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.' + error
      });
    }
}

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant
}
