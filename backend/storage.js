var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var authUser = require('./authUser.js');
var mime = require('mime-types')
var contentDisposition = require('content-disposition')
var crypto = require('crypto');
var multer  = require('multer');  // middleware for file uploading (multipart/form-data)

var fileSchema = new mongoose.Schema({
    filename: String,
    directory: mongoose.ObjectId,
    description: String,
    lastModified: {type: Date, default: Date.now},
    uploadedBy: mongoose.ObjectId,
})

var dirSchema = new mongoose.Schema({
    dirname: String,
    parentDirectory: mongoose.ObjectId,
});

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

(async () => {
    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.findOne({
        dirname: '/'
    })
    if(doc) return // Ensure root folder is created
    dir.create({
        dirname: '/',
        parentDirectory: null,
    })
})()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', authUser, upload.array('files'), async(req, res) => {
    if(!req.files) {
        res.sendStatus(201);
        return;
    }

    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.findOne({
        parentDirectory: null,
    })
    var directory = req.body.directory ? req.body.directory : doc._id
    console.log(directory)

    var log = mongoose.model('files', fileSchema)
    req.files.map(async file => {
        id = new mongoose.Types.ObjectId()
        filePath = path.join(__dirname, 'files', id.toString())
        fs.writeFileSync(filePath, encrypt(file.buffer))


        var name = file.originalname
        var fileDuplicate = await log.findOne({
            filename: name,
            directory: new mongoose.Types.ObjectId(directory)
        })
        console.log(fileDuplicate)
        // Avoid duplication of names
        let itt = 0
        while (fileDuplicate) {
            itt++
            var ext = `.${file.originalname.split('.').at(-1)}`
            name = file.originalname.replace(ext, `-${itt}`).concat(ext)
            var fileDuplicate = await log.findOne({
                filename: name,
                directory: new mongoose.Types.ObjectId(directory)
            })
        }

        log.create({
            _id: id,
            filename: name,
            directory: new mongoose.Types.ObjectId(directory),
            description: '',
            uploadedBy: new mongoose.Types.ObjectId(req.session.userInfo.id),
        })
    })
    res.status(200).send({message: 'Files uploaded'});
})

router.post('/setDescription', authUser, async(req, res) => {
    if(!req.body.id) {
        res.sendStatus(201);
        return;
    }
    var log = mongoose.model('files', fileSchema)
    var doc = await log.findOne({
        _id: req.body.id
    })

    if (!doc) {
        res.sendStatus(201)
        return
    }
    await doc.set({
        description: req.body.description
    }).save()

    res.sendStatus(200)

})

const getDirectoryPath = async(parentDirectory, data = {path: '', joint: []}) => {
    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.findOne({
        _id: new mongoose.Types.ObjectId(parentDirectory),
    })
    data.path = doc.dirname == '/' ? doc.dirname.concat(`${data.path}`) : doc.dirname.concat(`/${data.path}`)
    data.joint.push({
        dirname: doc.dirname,
        id: doc._id,
    })
    if(doc.parentDirectory) {
        data = await getDirectoryPath(doc.parentDirectory, data)
    }
    return(data)
}

router.post('/createDirectory', authUser, async(req, res) => {
    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.findOne({
        parentDirectory: null,
    })
    console.log(req.body.parentDirectory, doc._id)
    var directory = req.body.parentDirectory ? req.body.parentDirectory : doc._id

    // Check if dirname exists in directory
    var duplicate = await dir.findOne({
        dirname: req.body.dirname,
        parentDirectory: new mongoose.Types.ObjectId(directory)
    })
    if(duplicate) {
        res.sendStatus(201)
        return
    };

    dir.create({
        dirname: req.body.dirname,
        parentDirectory: new mongoose.Types.ObjectId(directory)
    })
    res.sendStatus(200)
})

router.get('/baseDirectory', authUser, async(req, res) => {
    var dir = mongoose.model('directories', dirSchema)
    var baseDir = await dir.findOne({
        parentDirectory: null
    })
    res.status(200).send({
        id: baseDir._id,
        name: baseDir.dirname,
        path: await getDirectoryPath(baseDir._id).path,
    })
})

router.post('/files', authUser, async(req, res) => {
    if (!req.body.directory) {
        res.sendStatus(201)
        return;
    }

    
    var files = []
    var directory = []
    
    var log = mongoose.model('files', fileSchema)
    dirFiles = await log.find({
        directory: req.body.directory
    })
    for (var file of dirFiles) {
        filePath = path.join(__dirname, 'files', file._id.toString())
        files.push({
            name: file.filename,
            id: file._id.toString(),
            size: fs.lstatSync(filePath).size,
            path: file.directory,
        })
    }

    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.find({
        parentDirectory: new mongoose.Types.ObjectId(req.body.directory),
    })
    
    for (var dir of doc) {
        directory.push({
            dirname: dir.dirname,
            id: dir._id.toString(),
        })
    }

    dirInfo = {
        currentDir: await getDirectoryPath(req.body.directory).path,
        files: files,
        directory: directory,
    }
    res.status(200).send(dirInfo)
})

var stream = require('stream');
router.get('/download/:id', authUser, async(req, res) => {
    var log = mongoose.model('files', fileSchema)
    var doc = await log.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id)
    })
    if (!doc) {
        res.sendStatus(201)
        return
    }
    var file = fs.readFileSync(path.join(__dirname, 'files', req.params.id))
    var decrypted = decrypt(file)

    var readStream = new stream.PassThrough();
    readStream.end(decrypted);
    res.setHeader('Content-Type', mime.lookup(doc.filename));
    res.setHeader('Content-Disposition', contentDisposition(doc.filename));
    readStream.pipe(res);
})

router.post('/fileInfo', authUser, async(req, res) => {
    if (!req.body.file) {
        res.sendStatus(201)
        return
    }
    var log = mongoose.model('files', fileSchema)
    var doc = await log.findOne({
        _id: new mongoose.Types.ObjectId(req.body.file)
    })
    if (!doc) {
        res.sendStatus(201)
        return
    }

    filePath = path.join(__dirname, 'files', req.body.file)
    var user = mongoose.model('Users', userSchema)
    var userInfo = await user.findOne({
        _id: doc.uploadedBy
    })
    dirInfo = await getDirectoryPath(doc.directory)
    info = {
        filename: doc.filename,
        description: doc.description,
        lastModified: doc.lastModified,
        uploadedBy: userInfo ? userInfo.username : 'Unknown',
        size: fs.lstatSync(filePath).size,
        path: dirInfo.path,
    }
    res.status(200).send(info)
})

router.post('/directoryInfo', authUser, async(req, res) => {
    if (!req.body.directory) {
        res.sendStatus(201)
        return
    }
    var dir = mongoose.model('directories', dirSchema)
    var doc = await dir.findOne({
        _id: new mongoose.Types.ObjectId(req.body.directory),
    })
    if (!doc) {
        res.sendStatus(201)
        return
    }
    var path = await getDirectoryPath(req.body.directory)
    res.status(200).send({
        id: doc.id,
        name: doc.dirname,
        path: path.path,
        joint: path.joint,
    })
})

router.post('/search', authUser, async(req, res) => {
    if (!req.body.searchTerm) {
        res.sendStatus(201)
        return
    }
    var log = mongoose.model('files', fileSchema)
    var doc = await log.find({filename: {$regex: `${req.body.searchTerm}*`, $options: 'i'}})

    var files = []
    for (var file of doc) {
        filePath = path.join(__dirname, 'files', file._id.toString())
        files.push({
            name: file.filename,
            id: file._id.toString(),
            size: fs.lstatSync(filePath).size,
            path: file.directory,
        })
    }
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