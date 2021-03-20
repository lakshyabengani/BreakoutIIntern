const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var Ideadline = {
    days : String,
    hours : String,
    mins : String,
};

var Idate = {
    day : Number,
    month : Number,
    year : Number,
};

const taskSchema = new Schema({
    info : String,
    topic : String,
    deadline : Ideadline,
    rewards : {
        type : Number,
        min : [1,'The reward value is below the Limit'],
        max: [5000,'The reward value is above the Limit'],
        required : true
    },
    status:{
        type : String,
        enum : ['ASSIGNED','COMPLETED','PENDING'],
        default : 'PENDING',
        required : true
    },
    manager : {
        type : Schema.Types.ObjectId,
        ref : 'Manager',
        required : true
    },
    worker : {
        type : Schema.Types.ObjectId,
        ref : 'Worker'
    },
    approved : {
       type : Boolean 
    },
    rate : {
        type : Number,
        min : [1,'Rating is below the Limit'],
        max : [10,'Rating is above the Limit']
    },
    doc : [{
        path : String,
    }],
    text: String,
    creationDate : Idate
});

// taskSchema.index({
//     topic : 'text'
// });

// taskSchema.index({
//     info : 'text'
// });

taskSchema.index({ "$**": "text" })

module.exports = mongoose.model('Task',taskSchema);  