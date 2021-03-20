const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const managerSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
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
    taskList : [{
        type : Schema.Types.ObjectId,
        ref : 'Task'
    }],
});

module.exports = mongoose.model('Manager',managerSchema);  