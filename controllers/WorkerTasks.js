const Worker = require('../models/Worker');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');

/**
 * A worker Can view All the PENDING tasks posted by all the Managers ( use pagination ) or a particular Task.
 * A worker May also be able to view the tasks he has completed ( use pagination ).
 */
const viewTasks = async(req,res) => {
    const pageLimit = 10;
    const page = req.body.page ? parseInt(req.body.page) : 0 ;
    try{
        let showAll = (req.body.show == "all" ) ? true : false;
        let showCompleted = (req.body.show == "completed" ) ? true : false;
        const result = [];
        if(showAll){
            
            let tasks = await Task.find({
                status : 'PENDING'
            }).populate('manager','firstName')
            .limit(pageLimit)
            .skip(page * pageLimit);

            tasks.forEach( (task) => {
                let obj = Object.assign({},{
                    id : task._id,
                    info : task.info,
                    topic : task.topic,
                    deadline : task.deadline,
                    rewards : task.rewards,
                    status : task.status,
                    manager : task.manager.firstName 
                });
                result.push(obj);
            });

        }
        else if(showCompleted){

            let tasks = await Task.find({
                worker : mongoose.Types.ObjectId(req.user._id),
                status : 'COMPLETED'
            }).populate('manager','firstName');

            return res.json({tasks});

        }else{
            
            let tasks = await Task.findById(req.body.taskId).populate('manager','firstName');

            let obj = Object.assign({},{
                id : tasks._id,
                info : tasks.info,
                topic : tasks.topic,
                status : tasks.status,
                deadline : tasks.deadline,
                rewards : tasks.rewards,
                manager : tasks.manager.firstName,
                approved : tasks.approved,
                docs : tasks.doc,
                text : tasks.text
            });

            result.push(obj);

        }
        
        return res.json({sucess : true , data : result});
    
    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : err });
    }
}

/**
 * A Worker can submit and update Multiple documents for their assigned Work.
 */
const submitTask = async(req,res) => {
    try{
        const files = req.files;
        // console.log(req.files);
        const task = await Task.findById(req.body.taskId);
        if(!task) return res.json({sucess : false , msg : "No such task exists "});
        
        files.forEach( (file) =>{
            const path = `localhost:3000/uploads/${file.originalname}`;
            task.doc.push({
                path : path
            });
        });

        if(req.body.text) task.text = req.body.text;

        await task.save();

        return res.json({sucess : true , msg : "Work submitted/updated "});
    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal Server Error "});
    }
}

/**
 *  Worker can remove Documents they have uploaded
 */
const removeDoc = async(req,res) =>{
    try{
        const worker = await Worker.findById(req.user._id);

        const task = await Task.findById(req.body.taskId);
        if(!task) return res.json({sucess : false , msg : "No such Tasks exists"});

        const newList = task.doc.filter( (document) => {
            return document._id != req.body.docId
        });

        task.doc = newList;

        await task.save();

        return res.json({sucess : true , data : task});

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal Server Error"});
    }
}

/**
 * A worker can search a tasks by topic Names (using pagination)
 */
const searchTask = async(req,res) => {
    try{
        
        const pageLimit = 10;
        const page = req.body.page ? parseInt(req.body.page) : 0 ;
        const result = [];

        let tasks = await Task.find({
            status : 'PENDING',
            '$text': {'$search': req.body.topic} 
        }).populate('manager','firstName')
        .limit(pageLimit)
        .skip(page * pageLimit);

        tasks.forEach( (task) => {
            let obj = Object.assign({},{
                id : task._id,
                info : task.info,
                topic : task.topic,
                deadline : task.deadline,
                rewards : task.rewards,
                status : task.status,
                manager : task.manager.firstName 
            });
            result.push(obj);
        });

        return res.json({sucess : true , data : result})

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal server Error "});
    }
}

/**
 * A worker chooses a task from the list of the tasks posted by the manager.
 */
const assignTask = async(req,res) => {
    try{
        
        const task = await Task.findById(req.body.taskId);
        if(!task) return res.json({sucess : false , msg : "No such task found"});
        
        const worker = await Worker.findById(req.user._id);
        // if(!worker) return res.json({sucess : false , msg : "NO such user found"});

        if(task.status == 'ASSIGNED') return res.json({sucess : false , msg : "Task is already Assigned"});

        worker.taskList.push(task._id);
        task.status = 'ASSIGNED';
        task.worker = worker._id; 

        await worker.save();
        await task.save();

        return res.json({sucess : true,  msg : "Task Assigned"});

    }catch(err){
        console.log(err);
        return res.json({sucess : false , msg : "Internal Server Error" });
    }
}

module.exports = {
    viewTasks,
    submitTask,
    searchTask,
    assignTask,
    removeDoc
}