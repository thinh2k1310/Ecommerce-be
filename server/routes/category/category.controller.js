
// Bring in Models & Helpers
const Category = require('../../models/category');
const Subcategory =  require('../../models/subcategory');
//const Product = require('../../models/product');


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
          success : false,
          message : 'Your request could not be processed. Please try again.',
          data : null
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Category has been added successfully!`,
        category: data
      });
    });
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
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

// Get all category
async function getAllCategories(req, res){
  try {
    const categories = await Category.find({});
    res.status(200).json({
      success : true,
      message : "",
      data : categories
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}
//Get all categories and subcategories
async function getCategories(req,res) {
  try{
  const categories = await  Category.find({});
  console.log(categories);
  const data = [];
  var getData = new Promise((resolve,reject) => {
    categories.forEach(async (category, index, array) => {
      const subcategories = await Subcategory.find({category : category._id});
      data.push({
          category_id: category._id,
          category_name: category.name,
          subcategories : subcategories
        });
        if (index === array.length -1) resolve();
  });
});
getData.then(() => {
  res.status(200).json({
    success : true,
    message : "",
    data : data
  });
});
}catch(error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

module.exports = {
    createCategory,
    updateCategory,
    getCategories,
    getAllCategories,
};
