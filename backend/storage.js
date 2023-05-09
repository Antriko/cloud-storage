var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var authUser = require('./authUser.js');

var multer  = require('multer');  // middleware for file uploading (multipart/form-data)
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(path.join(__dirname, 'files', 'tmp'), {recursive: true})   // create tmp file if not there
        imgPath = path.join(__dirname, 'files', 'tmp').toString()
        cb(null, imgPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage });  // where files will be held

router.post('/upload', authUser, upload.array('files'), async(req, res) => {
    // console.log(req.body, req.files, req.session)
    fs.mkdirSync(path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory), {recursive: true})

    req.files.map(file => {
        fs.renameSync(file.path, path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory, file.originalname))
        // Create entry log of uploaded time within database - Same for modifications
    })
    console.log('Uploaded', req.session.userInfo.id)
    res.sendStatus(200);

})

module.exports = router;