const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');

// Bring in Models & Helpers
const Merchant = require('../../models/merchant');
const User = require('../../models/user');
const Category = require('../../models/category');
const Subcategory = require('../../models/subcategory')
const Product = require('../../models/product');
const role = require('../../middleware/role');
const mailgun = require('../../services/mailgun');
const keys = require('../../config/keys');
const merchant = require('../../models/merchant');

const { secret, tokenLife } = keys.jwt;


async function requestNewMerchantApproval(req, res) {
  try {
    const name = req.body.name;
    const business = req.body.business;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const categories = req.body.categories;

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
        .json({ error: 'You must enter a phone number and an email address.' });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ error: 'That email address is already in use.' });
    }

    const merchant = new Merchant({
      name,
      email,
      business,
      phoneNumber,
      categories
    });

    const merchantDoc = await merchant.save();

    await mailgun.sendEmail(email, 'merchant-application');

    res.status(200).json({
      success: true,
      message: `We received your request! we will reach you on your phone number ${phoneNumber}!`,
      merchant: merchantDoc
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function approveMerchantApplication(req, res) {
  try {
    const merchantId = req.params.merchantId;

    const query = { _id: merchantId };
    const update = {
      status: 'Approved',
      isActive: true
    };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });

    await createMerchantUser(
      merchantDoc.email,
      merchantDoc.name,
      merchantId,
      req.headers.host
    );

    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function rejectMerchantApplication(req, res) {
  try {
    const merchantId = req.params.merchantId;

    const query = { _id: merchantId };
    const update = {
      status: 'Rejected'
    };

    await Merchant.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}


async function createMerchant(req, res) {
  try {
    const name = req.body.name;
    const business = req.body.business;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const categories = req.body.categories;
    //Default value
    const status = 'Approved';
    const isActive = true;

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
        .json({ error: 'You must enter a phone number and an email.' });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ error: 'That email is already in use.' });
    }
    const merchant = new Merchant({
      name,
      email,
      business,
      phoneNumber,
      categories,
      status,
      isActive
    });

    const merchantDoc = await merchant.save();

    const merchantId = merchantDoc._id;

    await createMerchantUser(
      merchantDoc.email,
      merchantDoc.name,
      merchantId,
      req.headers.host
    );

    await mailgun.sendEmail(email, 'merchant-signup');

    res.status(200).json({
      success: true,
      message: 'Create merchant successfully!',
      merchant: merchantDoc
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getAllMerchants(req, res) {
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

async function getMerchantById(req, res) {
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
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
async function updateMerchant(req, res) {
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

async function softDeleteMerchant(req, res) {
  try {
    const merchantId = req.params.id;
    const update = { isActive: false };
    const query = { _id: merchantId };

    await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    await Product.updateMany({ merchant: merchantId }, { isActive: false });
    res.status(200).json({
      success: true,
      message: 'Merchant has been moved to trash!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getTrashMerchant(req, res) {
  try {
    const trashes = await Merchant.find({ isActive: false });
    res.status(200).json({
      trashes
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.',
    });
  }
}

async function restoreMerchant(req, res) {
  try {
    const merchantId = req.params.id;
    const update = { isActive: true };
    const query = { _id: merchantId };

    await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    await Product.updateMany({ merchant: merchantId }, { isActive: true });
    res.status(200).json({
      success: true,
      message: 'Merchant has been restore!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function deleteMerchant(req, res) {
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


const createMerchantUser = async (email, name, merchant, host) => {
  const firstName = name;
  const lastName = '';
  const password = '123456';

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const query = { _id: existingUser._id };
    const update = {
      merchant,
      role: role.ROLES.Merchant
    };

    const merchantDoc = await Merchant.findOne({
      email
    });


    await mailgun.sendEmail(email, 'merchant-welcome', null, name);

    return await User.findOneAndUpdate(query, update, {
      new: true
    });
  } else {
    const buffer = await crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');
    const resetPasswordToken = resetToken;

    const user = new User({
      email,
      firstName,
      lastName,
      password,
      resetPasswordToken,
      merchant,
      role: role.ROLES.Merchant
    });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    await mailgun.sendEmail(email, 'merchant-signup', host, {
      resetToken,
      email
    });
    const registeredUser = await user.save();
    const payload = {
      id: registeredUser.id
    };
    jwt.sign(payload, secret, { expiresIn: tokenLife });
    return registeredUser
  }
};
//get categories and subcategories of merchant
async function getCategoriesOfMerchant(req, res) {
  try {
    const merchantUser = await User.findOne({_id : req.user._id});
    const merchant = await Merchant.findOne({_id : merchantUser.merchant});
    const ids = merchant.categories;
    const categories = await Category.find({ '_id': { $in: ids } });
    const data = [];
    var getData = new Promise((resolve, reject) => {
      categories.forEach(async (category, index, array) => {
        const subcategories = await Subcategory.find({ category: category._id });
        data.push({
          category_id: category._id,
          category_name: category.name,
          subcategories: subcategories
        });
        if (index === array.length - 1) resolve();

        // data.menu.categories.forEach(_category => {
        //     _category.items = items.filter(item => item.cat_id === _category.id_category)
        //         .map(item => ({
        //             id_item: item.id_item,
        //             title: item.title,
        //         }));

        //     _category.subcategories = categories.filter(__category => __category.parent_id === _category.id);

        //     _category.subcategories.forEach(subcategory => {
        //         subcategory.items = items.filter(item => item.cat_id === subcategory.id_category)
        //             .map(item => ({
        //                 id_item: item.id_item,
        //                 title: item.title,
        //             }));

        //     });
        // });
      });
    });
    getData.then(() => {
      res.status(200).json({
        categories: data
      });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
//Get products of a category
async function getProductOfCategory(req, res) {
  try {
    const categoryId = req.params.id;
    const merchantUser = await User.findOne({_id : req.user._id});
    console.log(merchantUser);
    const products = await Product.find({
      $and: [
        { category: categoryId },
        { merchant: merchantUser.merchant }
      ]
    })
    if (!products) {
      return res.status(404).json({
        message: 'No products found.'
      });
    }
    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
//Get products of a subcategory
async function getProductOfSubcategory(req, res) {
  try {
    const subcategoryId = req.params.id;
    const merchantUser = await User.findOne({_id : req.user._id})
    const products = await Product.find({
      $and: [
        { subcategory: subcategoryId },
        { merchant: merchantUser.merchant}
      ]
    })
    if (!products) {
      return res.status(404).json({
        message: 'No products found.'
      });
    }
    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}


module.exports = {
  getAllMerchants,
  requestNewMerchantApproval,
  approveMerchantApplication,
  rejectMerchantApplication,
  getMerchantById,
  createMerchant,
  updateMerchant,
  softDeleteMerchant,
  getTrashMerchant,
  restoreMerchant,
  deleteMerchant,
  getCategoriesOfMerchant,
  getProductOfCategory,
  getProductOfSubcategory
}