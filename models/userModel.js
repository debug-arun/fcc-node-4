const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: String,
    _id: ObjectId
}, {versionKey: false})

const User = mongoose.model("User", user);

module.exports = User;