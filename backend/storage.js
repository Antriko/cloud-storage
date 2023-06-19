var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var authUser = require('./authUser.js');
var mime = require('mime-types')
var contentDisposition = require('content-disposition')

var fastFolderSize = require('fast-folder-size')
var { promisify } = require('util')
var fastFolderSizeAsync = promisify(fastFolderSize)

var crypto = require('crypto');

var multer  = require('multer');  // middleware for file uploading (multipart/form-data)
const fg = require('fast-glob');


const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', authUser, upload.array('files'), async(req, res) => {
    console.log(req.files, req.body)
    if(!req.files) {
        res.sendStatus(201);
        return;
    }
    fs.mkdirSync(path.join(__dirname, 'files', req.body.directory), {recursive: true})
    req.files.map(file => {
        filePath = path.join(__dirname, 'files', req.body.directory, file.originalname)
        fs.writeFileSync(filePath, encrypt(file.buffer))
        // Create entry log of uploaded time within database - Same for modifications
    })
    res.status(200).send({message: 'Files uploaded'});
})

router.post('/files', authUser, async(req, res) => {
    filePath = path.join(__dirname, 'files', req.body.directory)

    if (!fs.existsSync(filePath)) {
        res.sendStatus(201)
        return;
    }
    dirFiles = fs.readdirSync(filePath)

    var files = []
    var directory = []

    for (var file of dirFiles) {
        filePath = path.join(__dirname, 'files', req.body.directory, file)
        filePathInfo = path.join(req.body.directory, file)
        if (fs.lstatSync(filePath).isDirectory()) {
            size = await fastFolderSizeAsync(filePath)
            
            directory.push({
                name: file,
                size: size,
            })
        } else {
            files.push({
                name: file,
                size: fs.lstatSync(filePath).size,
                path: filePathInfo,
            })
        }
    }
    dirInfo = {
        currentDir: req.body.directory,
        files: files,
        directory: directory,
    }
    console.log(dirInfo)
    res.status(200).send(dirInfo)
})

var stream = require('stream');
router.get('/download', authUser, async(req, res) => {
    console.log('body', req.body)
    if (!req.body.filename) {
        res.sendStatus(201)
        return
    }
    var file = fs.readFileSync(path.join(__dirname, 'files', req.body.directory, req.body.filename))
    var decrypted = decrypt(file)

    var readStream = new stream.PassThrough();
    readStream.end(decrypted);
    res.setHeader('Content-Type', mime.lookup(req.body.filename));
    res.setHeader('Content-Disposition', contentDisposition(req.body.filename));
    readStream.pipe(res);
})

router.post('/fileInfo', authUser, async(req, res) => {
    console.log('body', req.body)
    if (!req.body.file) {
        res.sendStatus(201)
        return
    }
    filePath = path.join(__dirname, 'files', req.body.file)
    info = {
        description: null,
        lastModified: null,
        uploadedBy: null,
        size: fs.lstatSync(filePath).size,
        path: req.body.file,
    }
    res.status(200).send(info)
})

router.post('/search', authUser, async(req, res) => {
    if (!req.body.searchTerm) {
        res.sendStatus(201)
        return
    }
    fileDir = path.join(__dirname, 'files')
    var fileSearch = await fg(`${fileDir}/**/*${req.body.searchTerm}*`)
    files = []
    fileSearch.map(file => {
        filePath = file.replace(fileDir, '')
        files.push({
            name: filePath.split('/').at(-1),
            size: fs.lstatSync(file).size,
            path: filePath,
        })
    })
    res.status(200).send(files)
})

// https://nodejs.org/api/crypto.html
const algorithm = 'aes-256-cbc'
const key = crypto.scryptSync(process.env.ENC_PASS, 'salt', 32)
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