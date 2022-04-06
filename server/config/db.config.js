const mongoose = require ('mongoose');
const User = require('../models/user');
//const data = require('./testData').default;


const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });  
        // await User.deleteMany();
        // await User.insertMany(data.users);
        
        console.log("Connected to the database")
    } catch (error) {
        console.log(`Could not connect to the database with error : ${error}`);
        process.exit(1);
    }
}
//Test data
const bcrypt = require('bcryptjs');
const data = {
    users:[
        {
            email: 'admin@gmail.com',
            password : bcrypt.hashSync('123456', 8),
            role : 'ROLE_ADMIN',
        },
        {
            email: 'merchant@gmail.com',
            password : bcrypt.hashSync('123456', 8),
            role : 'ROLE_MERCHANT',
        },
        {
            email: 'thinh2k1310@gmail.com',
            password : bcrypt.hashSync('123456', 8),
            role : 'ROLE_MEMBER',
        }
    ]
}
module.exports = connectDatabase;