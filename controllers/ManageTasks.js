const Task = require('../models/Task');
const Manager = require('../models/Manager');
const Worker = require('../models/Worker');
const mongoose = require('mongoose');

/**
 * Manager will be able to create a task 
 */
const createTask = async(req,res) => {
    try{
        
        let user = await Manager.findById(req.user._id);
        
        const deadline = {
            days : req.body.deadline.days,
            hours : req.body.deadline.hours,
            mins : req.body.deadline.mins,
        };
        
        var d = new Date();
        const uploadDate = {
            day : d.getDate(),
            month : d.getMonth(),
            year : d.getFullYear()
        };

        let newTask = await Task.create({
            info : req.body.info,
            deadline : deadline,
            topic : req.body.topic,
            rewards : parseInt(req.body.rewards),
            manager : req.user._id,
            creationDate : uploadDate
        });
        
        user.taskList.push(newTask._id);
        await user.save();

        return res.json({sucess : true , task : newTask });

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Task could not be created"});
    }
}

/**
 * Manager will be able to edit a task he had already created
 */
const editTask = async(req,res) => {
    try{
        
        let user = await Manager.findById(req.user._id);
        let task = await Task.findById(req.body.taskId);
        
        if(!task) return res.json({sucess : false , msg : "No such Task exists "});

        if(String(task.manager) !== String(user._id) ) return res.json({sucess : false , msg : "Manager is not authorised to edit this task"});

        const deadline = {
            days : req.body.deadline.days ? req.body.deadline.days : task.deadline.days ,
            hours : req.body.deadline.hours ? req.body.deadline.hours : task.deadline.hours,
            mins : req.body.deadline.mins ? req.body.deadline.mins : task.deadline.mins,
        };
        
        await Task.updateOne({
                _id : task
            },{
                info : req.body.info,
                deadline : deadline,
                topic : req.body.topic ? req.body.topic : task.topic ,
                rewards : req.body.rewards ? parseInt(req.body.rewards) :  task.rewards ,
        },{ runValidators: true });
        
        const updatedTask = await Task.findById(task._id);

        return res.json({sucess : true , task : updatedTask });

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Task could not be updated"});
    }   
}

/**
 * Manager Can delete the Task that he has posted.
 */
const deleteTask = async(req,res) =>{
    try{
        const task = await Task.findById(req.body.taskId);
        if(!task) return res.json({sucess : false , msg : "Tried to delete an already deleted task"});

        const manager = await Manager.findById(req.user._id);
    
        if(String(task.manager) != String(manager._id)) return res.json({sucess : false, msg : "Manager not authorized "});

        var worker = null;
        if(task.worker){
            worker = await Worker.findById(task.worker);
            if(!worker) return res.json({sucess : false , msg : "No such worker is assigned to this task"});
        }

        await Task.deleteOne({
            _id : task._id
        });

        const newList = manager.taskList.filter( (taskId) =>{
            return String(taskId) != String(task._id)
        });

        await manager.save();

        if(worker){
            const newList = worker.taskList.filter( (taskId) =>{
                return String(taskId) != String(task._id);
            });
            await worker.save();                
        }

        return res.json({sucess : true , msg : "Task Deleted"});
    
    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal Server Error "});
    }
}

/**
 * Manager will review the Task given by the Worker and Rate the task , as well as can approve/reject the task.
 */
const reviewTask = async(req,res) => {
    try{

        const task = await Task.findById(req.body.taskId);
        if(!task) return res.json({sucess : false , msg : "Task does not exists"});

        let query = {};

        if(req.body.rate){
            query.rate = parseInt(req.body.rate);
        }

        if(req.body.approved){
            query.approved = (req.body.approved == "yes") ? true : false ;
        }

        if(query.approved){
            query.status = 'COMPLETED';

            const worker = await Worker.findById(task.worker);
            worker.reward += task.rewards;
            await worker.save();
        }

        await Task.updateOne({
            _id : task._id
        },query,{runValidators : true});

        return res.json({sucess : true , msg : "Work reviewed"});

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal Server Error"});
    }
}


/**
 * Manager will be able to view the tasks filtered by their status as well as the Date on which he wants to 
 * see the necessary tasks
 */
const filterTask = async(req,res) => {
    try{
        //const manager = await Manager.findById(req.user._id);

        const dt = new Date(req.body.filterDate);

        const d = {
            day : dt.getDate(),
            month : dt.getMonth(),
            year : dt.getFullYear()
        };

        const tasks = await Task.find({
            manager : mongoose.Types.ObjectId(req.user._id),
            status : req.body.status,
            creationDate : d
        });

        let results = [];

        tasks.forEach((task) => {
            let obj = Object.assign({},{
                id : task._id,
                info : task.info,
                topic : task.topic,
                deadline : task.deadline,
                rewards : task.rewards,
                status : task.status,
                manager : req.user.firstName
            });

            results.push(obj);

        });

        return res.json({sucess : true , data : results})

    }catch(err){
        console.log(err);
        return res.json({sucess : false,msg : "Internal Server Error"});
    }
}

module.exports = {
    createTask,
    editTask,
    reviewTask,
    filterTask,
    deleteTask
}