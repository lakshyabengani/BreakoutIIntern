const Manager = require('../models/Manager');
const Worker = require('../models/Worker');
const bycrypt = require('bcryptjs');
const auth = require('../middlewares/Authenticate');
/**
 * Converts the passed in Raw password to a hashed password
 * @param {*} password The Raw password whose Hash is to be generated
 * @returns a Hash of the passed password
 */
const convertToHash = (password) => bycrypt.hashSync(password,10);

/**
 * Compares if the Raw and Hashed Password are same or not
 * @param {*} password Raw password
 * @param {*} hash Hashed Password
 * @returns true if the passwords are same , otherwise false
 */
const comparePassword = (password,hash) => bycrypt.compareSync(password,hash); 

/**
 * controller for user registration/signup process. 
 */
const signup = async(req,res) =>{

    const hash = convertToHash(req.body.password);
    // console.log(hash);
    var user = null;

    if(req.body.type == "Manager"){
        let check = await Manager.findOne({email : req.body.email});
        if(check) return res.json({sucess : false , msg : "Email already registered with another user"});

        user = await Manager.create({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            password : hash, 
        });
    }
    else if(req.body.type == "Worker"){
        let check = await Worker.findOne({email : req.body.email});
        if(check) return res.json({sucess : false , msg : "Email already registered with another user"});

        user = await Worker.create({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            password : hash,
            reward: 0,         
        });
    }
    else{
        return res.json("Please give the correct type of user");
    }
    try{
        return res.json({user});
    }catch(err){
        return res.json({err});
    }
};


/**
 * Controller for User Login
 */
const login = async(req,res) =>{
    try{
        var user = null;
        if(req.body.type == "Manager"){
            user = await Manager.findOne({
                email : req.body.email
            });
        }
        else if(req.body.type == "Worker"){
            user = await Worker.findOne({
                email : req.body.email  
            });
        }
        else{
            return res.json("Please give the correct type of user");
        }
        if(!user) return res.json("No user with this email id is found");
        // console.log(user);
        if(!comparePassword(req.body.password,user.password)) return res.json("Incorrect Password");

        const token = auth.getToken({_id : user._id , type : req.body.type}); 

        return res.json({user,token});
        
    }catch(err){
        return res.json({err});
    }
}

module.exports = {
    signup,
    login
}