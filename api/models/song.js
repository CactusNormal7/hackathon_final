const mongoose = require('mongoose');

const song = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    author: {
        required: true,
        type: String
    },
    release: {
        required: true,
        type: Number
    },
    type : {
        required: true,
        type: Array
    },
    track :{
      require: true,
      type : String
    }
})

module.exports = mongoose.model('Song', song)