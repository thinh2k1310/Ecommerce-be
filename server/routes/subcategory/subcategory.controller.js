
// Bring in Models & Helpers
const Subcategory = require('../../models/subcategory');


// Create subcategory
function createSubcategory(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const category = req.body.category
  
    if (!description || !name) {
      return res
        .status(400)
        .json({ error: 'You must enter name & description.' });
    }
  
    const subcategory = new Subcategory({
      name,
      description,
      category
    });
  
    subcategory.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Your request could not be processed. Please try again.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Subcategory has been added successfully!`,
        subcategory: data
      });
    });
  }

// Get all subcategory
async function getAllSubcategory(req, res){
  try {
    const subcategories = await Subcategory.find({});
    res.status(200).json({
      subcategories
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
// Get one category detail
async function getOneSubcategoryById(req, res){
  try {
    const subcategoryId = req.params.id;

    const subcategoryDoc = await Subcategory.findOne({ _id: subcategoryId })

    if (!subcategoryDoc) {
      return res.status(404).json({
        message: 'No Subcategory found.'
      });
    }

    res.status(200).json({
      subcategory: subcategoryDoc
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

// Update subcategory
async function updateSubcategory(req, res){
  try {
    const subcategoryId = req.params.id;
    const update = req.body.subcategory;
    const query = { _id: subcategoryId };

    await Subcategory.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Subcategory has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}
// Delete subcategory
async function deleteSubcategory(req, res){
  try {
    const subcategory = await Subcategory.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Subcategory has been deleted successfully!`,
      subcategory
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

module.exports = {
    createSubcategory,
    getAllSubcategory,
    getOneSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
};
