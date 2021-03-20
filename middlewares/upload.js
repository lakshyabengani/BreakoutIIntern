let multer = require('multer');

const DIR = './public/uploads';

const supportedMimeTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/msword",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase();
      cb(null, fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        let valid = false;
        supportedMimeTypes.forEach( (type) => {
            if(type == file.mimetype) valid = true;
        })
      if(valid){
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg , .jpeg, .doc, .docx, .pdf format allowed!'));
      }
    }
});

module.exports =  {
    upload
};