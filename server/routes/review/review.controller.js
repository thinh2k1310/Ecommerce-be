// Bring in Models & Helpers
const Review = require('../../models/review');
const Product = require('../../models/product');
const ReviewService = require('../../services/review.service');
const review = require('../../models/review');

const service = new ReviewService();

async function addReview(req, res, next){
  try{
  const user = req.user;
  const {product ,rating , review} = req.body;
  const data  = await service.addReview({product,rating,review,user});
  return res.status(200).json(data);
  }catch(error){
    next(error);
  }
}

async function getMyReviews(req, res, next){
  try {
    const user = req.user;
    const data = await service.getMyReviews(user);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function getReviewsOfProduct(req, res, next){
  try {
    const slug = req.params.slug;
    const data = service.getReviewsOfProduct(slug)
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function updateReview(req, res, next){
  try {
    const reviewId = req.params.id;
    const update = req.body;
    const {data} = service.updateReview(update,reviewId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next){
  try {
    const id = req.params.id;
    const {data} = service.deleteReview(id,req.user);
    res.status(200).json(data);
  } catch (error) {
    next(error)
  }
 
}

module.exports = {
    addReview,
    updateReview,
    getMyReviews,
    getReviewsOfProduct,
    deleteReview
};
