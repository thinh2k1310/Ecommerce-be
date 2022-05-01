
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

// Get all category
async function getAllCategories(req, res){
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
//Get all categories and subcategories
async function getCategories(req,res) {
  try{
  const categories = await  Category.find({});
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
    categories : data
  });
});
}catch(error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

module.exports = {
    createCategory,
    updateCategory,
    getCategories,
    getAllCategories,
};
