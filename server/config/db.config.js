const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');


const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });  


        console.log("Connected to the database")
    } catch (error) {
        console.log(`Could not connect to the database with error : ${error}`);
        process.exit(1);
    }
}

data = {
    users :[
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        },
        {
            email : '',
            firstName : '',
            lastName : '',
            password : '',
            provider : '',
            role : ''
        }

    ],
    categories : [

    ],
    subcategories : [

    ]
}

module.exports = connectDatabase;