const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const Excercise = mongoose.model("Excercise", new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
    _id: ObjectId
}));

module.exports = Excercise;