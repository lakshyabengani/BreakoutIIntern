const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workerSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true
    },
    firstName: {
        type : String,
        required : true
    },
    lastName : String,
    reward: {
        type : Number,
        required : true,
        default : 0
    },
    taskList : [{
        type : Schema.Types.ObjectId,
        ref : 'Task'
    }]
});

module.exports = mongoose.model('Worker',workerSchema);  