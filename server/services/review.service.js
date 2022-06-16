const Review = require('../models/review')
const Product = require('../models/product');
const { FormatData } = require("../utils");


//All business logic will be here
class ReviewService {
    async addReview({ product, rating, review, user }) {
        const review1 = new Review(Object.assign({ product, rating, review }, { user: user._id }));
        const reviewResult = await review1.save();
        const message = 'Your review has been added successfully!';
        if (reviewResult){
            return FormatData(reviewResult, message);
        }else {
            throw ({ status: 400 , success : false, message: 'Your request could not be processed. Please try again.' });
        }

    }

    async getMyReviews(user) {

        const reviews = await Review.find({ user: user._id })
            .populate({
                path: 'product',
                select: 'name slug imageUrl'
            })
            .sort('-created');
            if (reviews){
                return FormatData(reviews);
            }else {
                throw ({ status: 400 ,success : false, message: 'Your request could not be processed. Please try again.' });
            }

    }

    async getReviewsOfProduct(slug) {

        const productDoc = await Product.findOne({ slug: req.params.slug });
        const reviews = await Review.find({
            product: productDoc._id
        })
            .populate({
                path: 'user',
                select: 'firstName'
            })
            .sort('-created');
            if (reviews){
                return FormatData(reviews);
            }else {
                throw ({ status: 400 ,success : false, message: 'Your request could not be processed. Please try again.' });
            }

    }

    async updateReview(update, reviewId) {

        const query = { _id: reviewId };

        const review = await Review.findOneAndUpdate(query, update, {
            new: true
        });
        const message = 'Your review has been updated successfully!';
        if (review){
            return FormatData(review, message);
        }else {
            throw ({ status: 400 ,success : false, message: 'Your request could not be processed. Please try again.' });
        }

    }

    async deleteReview(id, user) {

        const review = await Review.findOne({ _id: id })
        var deletedReview = null;
        if (req.user.role == "ROLE_ADMIN" || String(review.user) == String(user._id)) {
            deletedReview = await Review.deleteOne({ _id: id });
        }
        const message = 'Your review has been deleted successfully!';
        if (deletedReview){
            return FormatData(review, message);
        }else {
            throw ({ status: 400 ,success : false, message: 'Your request could not be processed. Please try again.' });
        }
    }
}
module.exports = ReviewService;