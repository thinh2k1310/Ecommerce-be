const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');   

const auth = passport.authenticate('jwt', { session: false, }) ;   

module.exports = auth;
