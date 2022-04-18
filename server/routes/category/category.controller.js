
// Bring in Models & Helpers
const Category = require('../../models/category');
const Subcategory =  require('../../models/subcategory');
const Product = require('../../models/product');


// Create category
function createCategory(req, res) {
    const name = req.body.name;
    const description = req.body.description;
  
    if (!description || !name) {
      return res
        .status(400)
        .json({ error: 'You must enter name & description.' });
    }
  
    const category = new Category({
      name,
      description
    });
  
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Your request could not be processed. Please try again.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Category has been added successfully!`,
        category: data
      });
    });
  }
// Get all category
async function getAllCategory(req, res){
  try {
    const categories = await Category.find({});
    res.status(200).json({
      categories
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

// Update category
async function updateCategory(req, res){
  try {
    const categoryId = req.params.id;
    const update = req.body.category;
    const query = { _id: categoryId };

    await Category.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Category has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
// Delete category
async function deleteCategory(req, res){
  try {
    const product = await Category.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Category has been deleted successfully!`,
      product
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function getSubcategories(req, res){
  try {
    const subcategories = await Subcategory.find({category : req.params.id});
    res.status(200).json({
      subcategories
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

module.exports = {
    createCategory,
    getAllCategory,
    updateCategory,
    deleteCategory,
    getSubcategories
};
