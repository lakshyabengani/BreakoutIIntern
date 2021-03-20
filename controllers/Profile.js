const Manager = require('../models/Manager');
const Worker = require('../models/Worker');

/**
 * Gets the profile of User
 */
const getProfile = async(req,res) => {
    try{
        let user = null;
        if(req.body.type == "Manager"){
            user = await Manager.findById(req.user._id);
        }else if(req.body.type == "Worker"){
            user = await Worker.findById(req.user._id);
        }else{
            return res.json("Please specify a valid type of User");
        }
        
        if(!user) return res.json("No such user exists");
        
        return res.json({user});

    }catch(err){
        return res.json({err});
    }
}

/**
 * Controller to edit the profile details of a user
 */
const patchProfile = async(req,res) => {
    try{

        let user = null;
        let check = null;

        if(req.body.type == "Manager"){
            user = await Manager.findById(req.user._id);
            if(req.body.email) check = await Manager.findOne({email : req.body.email});
        }else if(req.body.type == "Worker"){
            user = await Worker.findById(req.user._id);
            if(req.body.email) check = await Worker.findById({email : req.body.email});
        }else{
            return res.json("Please specify a valid type of User");
        }

        if(!user) return res.json("No such user exists");
        if(check && check._id != req.user._id) return res.json("User with this email_id exists");

        let updatedUser = null;

        if(req.body.type == "Manager"){
            await Manager.updateOne({
                _id : user._id
            },{
                firstName : req.body.firstName ? req.body.firstName : user.firstName,
                lastName : req.body.lastName ? req.body.lastName :  user.lastName,
                email : req.body.email ? req.body.email : user.email
            });
            updatedUser = await Manager.findById(user._id);
        }else{
            await Worker.updateOne({
                _id : user._id
            },{
                firstName : req.body.firstName ? req.body.firstName : user.firstName,
                lastName : req.body.lastName ? req.body.lastName :  user.lastName,
                email : req.body.email ? req.body.email : user.email
            });
            updatedUser = await Worker.findById(user._id);
        }

        return res.json({sucess : true,user : updatedUser});

    }catch(err){
        console.log(err);
        return res.json({sucess : false});
    }
}

module.exports = {
    getProfile,
    patchProfile
}