var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types')
var authUser = require('./authUser.js');

var crypto = require('crypto');

var multer  = require('multer');  // middleware for file uploading (multipart/form-data)
// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         fs.mkdirSync(path.join(__dirname, 'files', 'tmp'), {recursive: true})   // create tmp file if not there
//         imgPath = path.join(__dirname, 'files', 'tmp').toString()
//         cb(null, imgPath)
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// })
// var upload = multer({ storage: storage });  // where files will be held

const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', authUser, upload.array('files'), async(req, res) => {
    // console.log(req.body, req.files, req.session)
    fs.mkdirSync(path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory), {recursive: true})

    req.files.map(file => {


        filePath = path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory, file.originalname)
        fs.writeFileSync(filePath, encrypt(file.buffer))

        // fs.renameSync(file.path, path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory, file.originalname))
        // Remove old file

        // Create entry log of uploaded time within database - Same for modifications
    })
    console.log('Uploaded', req.session.userInfo.id)
    res.sendStatus(200);

})

router.get('/files', authUser, async(req, res) => {
    // {
    //     currentDir: 'currentDir',
    //     files: [{
    //         name: 'name',
    //         size: 'size',
    //         lastModified: 'last modified'
    //     }],
    //     directory: [{
    //         dirName: 'dirName',
    //         size: 'size',
    //         lastModified: 'last modified'
    //     }]
    // }
})

var stream = require('stream');
router.get('/download', authUser, async(req, res) => {
    console.log('body', req.body)
    var file = fs.readFileSync(path.join(__dirname, 'files', req.session.userInfo.id, req.body.directory, req.body.filename))
    var decrypted = decrypt(file)

    var readStream = new stream.PassThrough();
    readStream.end(decrypted);
    res.set('Content-disposition', 'attachment; filename=' + req.body.filename);
    res.set('Content-Type', mime.lookup(req.body.filename));
    readStream.pipe(res);
})

// https://nodejs.org/api/crypto.html
const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync(process.env.ENC_PASS, 'salt', 32) // MOVE TO .ENV
const iv = Buffer.alloc(16, 0)

const encrypt = (buffer) => {
    // buffer to base64
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('base64')
};

const decrypt = (encrypted) => {
    // base64 back to buffer
    var buf = Buffer.from(encrypted.toString(), 'base64')
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    return Buffer.concat([decipher.update(buf), decipher.final()])
};

module.exports = router;