const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const log = new mongoose.Schema({
    username: String,
    count: Number,
    _id: ObjectId,
    log: [new mongoose.Schema({
        description: String,
        duration: Number,
        date: String
    }, {versionKey: false, _id: false})]
}, {versionKey: false});

const Log = mongoose.model("Log", log);

module.exports = Log;