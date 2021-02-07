const mongoose = require('mongoose');
const Schema = mongoose.Schema; // shorthand for mongoose Schema useful but not required

require('mongoose-currency').loadType(mongoose); //this loadtype will load the currency data type in mongoose to be used in mongoose Schema
const Currency = mongoose.Types.Currency //shorthand for mongoose.Type.Currency

const commentSchema = new Schema({
    rating:{
    type: Number,
    min: 1,
    max: 5,
    required: true
    },
    text:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    }
},{
    timestamps: true
});

const campsiteSchema = new Schema({ // object that contains definition for the Schema
    name: {
        type: String,
        required:true,
        unique: true
    },
    description: {
        type: String,
        required:true
    },
    image: {
        type: String, // contain the path to the image
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema] /*adding the comments schema as a sub document this will
    cause every Campsite document to be able to contain multiple comment documents stored within an array */
}, {
    timestamps: true
});

// creating a model using the Schema above - model returns value is a constructor function

const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;