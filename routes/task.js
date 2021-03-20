var express = require('express');
var router = express.Router();
var managerTask = require('../controllers/ManageTasks');
var workerTask = require('../controllers/WorkerTasks');
var authenticate = require('../middlewares/Authenticate');
var FileUpload = require('../middlewares/upload');


//-------------------------------- Taks Done by Manager-------------------------------------------
router.post('/create',authenticate.verifyUser, (req, res, next) => managerTask.createTask(req,res));

router.patch('/edit' , authenticate.verifyUser,(req,res,next) => managerTask.editTask(req,res));

router.delete('/remove',authenticate.verifyUser,(req,res,next) => managerTask.deleteTask(req,res));

router.get('/filter',authenticate.verifyUser,(req,res,next) => managerTask.filterTask(req,res));

router.post('/review',authenticate.verifyUser,(req,res,next) => managerTask.reviewTask(req,res));


//-------------------------------------Tasks Done BY Worker----------------------------------------

router.get('/viewTask',authenticate.verifyUser,(req,res,next) => workerTask.viewTasks(req,res));

router.post('/assign',authenticate.verifyUser,(req,res,next) => workerTask.assignTask(req,res));

router.get('/search',authenticate.verifyUser,(req,res,next) => workerTask.searchTask(req,res));

/**
 * This route is used submit files (new as well as updated ) for a task
 */
router.post('/submit',authenticate.verifyUser,FileUpload.upload.any('files'),(req,res,next)=> workerTask.submitTask(req,res));

router.delete('/removeDoc',authenticate.verifyUser,(req,res,next) => workerTask.removeDoc(req,res));

module.exports = router;
