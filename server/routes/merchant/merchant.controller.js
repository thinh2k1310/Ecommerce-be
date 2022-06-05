
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// Bring in Models & Helpers
const Merchant = require('../../models/merchant');
const User = require('../../models/user');
const Category = require('../../models/category');
const Subcategory = require('../../models/subcategory')
const Product = require('../../models/product');
const role = require('../../middleware/role');
const mailgun = require('../../services/mailgun');
const keys = require('../../config/keys');


const { secret, tokenLife } = keys.jwt;


async function requestNewMerchantApproval(req, res) {
  try {
    console.log(req.user);
    const name = req.user.firstName;
    const phoneNumber = req.user.phoneNumber;
    const email = req.user.email;
    const business = req.body.business;
    const categories = req.body.categories;

    if (!name || !email) {
      return res
        .status(400)
        .json({
          success : false,
          message: 'You must login/register first.' ,
          data : null
          });
    }

    if (!business) {
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'You must enter a business description.' 
        });
    }

    if (!categories) {
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'You must choose at least 1 category.' 
        });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'This user is already a merchant.' 
        });
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
      message: `We received your request! We will reach you on your phone number ${phoneNumber}!`,
      data : merchantDoc
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
      success: true,
      message : "",
      data : null
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
      success: true,
      message : "",
      data : null
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
        .json({ success : false,
          data : null,
          message : 'You must enter name and email.' });
    }

    if (!business) {
      return res
        .status(400)
        .json({ success : false,
          data : null,
          message : 'You must enter a business description.' });
    }

    if (!phoneNumber || !email) {
      return res
        .status(400)
        .json({ success : false,
          data : null,
          message : 'You must enter a phone number and an email.' });
    }

    const existingMerchant = await Merchant.findOne({ email });

    if (existingMerchant) {
      return res
        .status(400)
        .json({ success : false,
          data : null,
          message : 'That email user is already a merchant.' });
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

    await mailgun.sendEmail(email, 'merchant-signup',keys.app.clientURL);

    res.status(200).json({
      success: true,
      message: 'Create merchant successfully!',
      data : merchantDoc
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function getAllMerchantRequests(req, res) {
  try {
    const merchants = await Merchant.find({status : "Waiting Approval"}).sort('-created');

    res.status(200).json({
      success : true,
      message : "",
      data : merchants
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

async function getAllMerchants(req, res) {
  try {
    const merchants = await Merchant.find({status : { $ne : "Waiting Approval"}}).sort('-created').populate({
      path: 'categories',
      select : 'name'
    });

    res.status(200).json({
      success : true,
      message : "",
      data : merchants
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

async function getMerchantById(req, res) {
  try {
    const merchantId = req.params.id;

    const merchantDoc = await Merchant.findOne({ _id: merchantId });

    if (!merchantDoc) {
      res.status(404).json({
        success : false,
        data : null,
        message: `No such merchant with the id: ${merchantId}.`
      });
    }

    res.status(200).json({
      success : true,
      data : merchantDoc
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
async function updateMerchant(req, res) {
  try {
    const merchantId = req.params.id;
    const update = req.body;
    const query = { _id: merchantId };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    if (!merchantDoc) {
      res.status(404).json({
        success : false,
        data : null,
        message: `No such merchant with the id: ${merchantId}.`
      });
    }
    res.status(200).json({
      success: true,
      message: 'Merchant has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

async function softDeleteMerchant(req, res) {
  try {
    const merchantId = req.params.id;
    const update = { isActive: false };
    const query = { _id: merchantId };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    if (!merchantDoc) {
      res.status(404).json({
        success : false,
        data : null,
        message: `Can not find merchant with the id: ${merchantId}.`
      });
    }
    await Product.updateMany({ merchant: merchantId }, { isActive: false });
    res.status(200).json({
      success: true,
      message: 'Merchant has been inactived!',
      data : null
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.',
    });
  }
}

async function restoreMerchant(req, res) {
  try {
    const merchantId = req.params.id;
    const update = { isActive: true };
    const query = { _id: merchantId };

    const merchantDoc = await Merchant.findOneAndUpdate(query, update, {
      new: true
    });
    if (!merchantDoc) {
      res.status(404).json({
        success : false,
        data : null,
        message: `Can not find merchant with the id: ${merchantId}.`
      });
    }
    await Product.updateMany({ merchant: merchantId }, { isActive: true });
    res.status(200).json({
      success: true,
      message: 'Merchant has been actived!',
      data : null
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
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
    const categories = await Category.find({ '_id': { $in: ids } }, {id : 1, name : 1});
    
    res.status(200).json({
        success : true,
        data : categories
      });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
//Get products of a category
async function getProductOfCategory(req, res) {
  try {
    const categoryId = req.params.id;
    const merchantUser = await User.findOne({_id : req.user._id});
    console.log(merchantUser);
    const category = await Category.findById(categoryId);
    const subcategory = await Subcategory.findById(categoryId);
    if(!category && !subcategory){
      res.status(404).json({
        success : false,
        data : null,
        message: `Can not find category with the id: ${categoryId}.`
      });
    }
    let products = [];
    if(category){
       products = await Product.find({
        $and: [
          { category: categoryId },
          { merchant: merchantUser.merchant }
        ]
      })
    } else if (subcategory){
       products = await Product.find({
        $and: [
          { subcategory: categoryId },
          { merchant: merchantUser.merchant }
        ]
      })
    }
    
    if (!products) {
      return res.status(200).json({
        success : true,
        message: 'No products found.',
        data : []
      });
    }
    res.status(200).json({
      success : true,
      data : products
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
//Get products of a subcategory
async function getProductOfSubcategory(req, res) {
  try {
    const subcategoryId = req.params.id;
    const subcategory = await Subcategory.findById(subcategoryId);
    if(!subcategory){
      res.status(404).json({
        success : false,
        data : null,
        message: `Can not find subcategory with the id: ${subcategoryId}.`
      });
    }
    const merchantUser = await User.findOne({_id : req.user._id})
    const products = await Product.find({
      $and: [
        { subcategory: subcategoryId },
        { merchant: merchantUser.merchant}
      ]
    })
    if (!products) {
      return res.status(200).json({
        success : true,
        message: 'No products found.',
        data : []
      });
    }
    res.status(200).json({
      success : true,
      data : products
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}


module.exports = {
  getAllMerchants,
  getAllMerchantRequests,
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