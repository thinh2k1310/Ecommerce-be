
// Bring in Models & Helpers
const Address = require('../../models/address');


async function createAddress(req, res){
  try{
    const user = req.user;

    if (req.body.isDefault == true){
      const update = { isDefault: false};
      const query = { isDefault: true };
      
      await Address.findOneAndUpdate(query, update, {
        new: true
      });
    }
  
    const address = new Address(Object.assign(req.body, { user: user._id }));
  
    await address.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Your request could not be processed. Please try again.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Address has been added successfully!`,
        address: data
      });
    });
  }catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }

}

function getAllAddresses(req, res){
  Address.find({ user: req.user._id }, (err, data) => {
    if (err) {
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }

    res.status(200).json({
      addresses: data
    });
  });
}

async function getAdressById(req, res){
  try {
    const addressId = req.params.id;

    const addressDoc = await Address.findOne({ _id: addressId });

    if (!addressDoc) {
      res.status(404).json({
        message: `Cannot find Address with the id: ${addressId}.`
      });
    }

    res.status(200).json({
      address: addressDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function updateAddress(req, res){
  try {
    if (req.body.isDefault == true){
      const updated = { isDefault: false};
      const filter = { isDefault: true };
      
      await Address.findOneAndUpdate(filter, updated, {
        new: true
      });
    }
    const addressId = req.params.id;
    const update = req.body;
    const query = { _id: addressId };

    await Address.findOneAndUpdate(query, update, {
      new: true
    });
    console.log(query)
    console.log(update)
    res.status(200).json({
      success: true,
      message: 'Address has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
async function deleteAddress(req, res){
  try {
  const addressToDelete =  await Address.findOne({_id: req.params.id})
  if( addressToDelete.isDefault == true){
    res.status(400).json({
      error : 'You can not delete default address!'
    })
  }else {
    await Address.deleteOne({ _id: req.params.id }, (err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Your request could not be processed. Please try again.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Address has been deleted successfully!`,
        address: data
      });
    });
  }
 }catch (error) {
  res.status(400).json({
    error: 'Your request could not be processed. Please try again.'
  });
 }
}

module.exports = {
  getAllAddresses,
  getAdressById,
  createAddress,
  updateAddress,
  deleteAddress
}
