var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var authUser = require('./authUser.js');

// Encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

(async () => {
    var user = mongoose.model('User', userSchema);  // Get database
    var doc = await user.findOne({username: process.env.APP_USER}) // Find if username exists
    if(doc) return // User already created

    // First time user creation
    var id = new mongoose.Types.ObjectId();
    hashed = await bcrypt.hash(process.env.APP_PASS, saltRounds)  // Encrypt password
    user.create({
        _id: id,
        username: process.env.APP_USER,
        password: hashed,
    })
})()

router.post('/login', async(req, res) => {
    let user = mongoose.model('User', userSchema);  // Get database
    var doc = await user.findOne({username: req.body.username});
    if (!doc) { // No user found
        res.status(201).send({text: "No user found"})
        return;
    }

    var compare = await bcrypt.compare(req.body.password, doc.password)
    if (!compare) { // Incorrect password
        res.status(201).send({text: "Incorrect password"})
        return;
    } 

    // Success, send session
    req.session.userInfo = {
        id: doc.id, 
        username: req.body.username
    };
    res.sendStatus(200)
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie("userInfo")
    res.sendStatus(200);
})


router.get('/verify', authUser, async(req, res) => {   // heartbeat
    let user = mongoose.model('User', userSchema)
    var doc = await user.findOne({_id: new mongoose.Types.ObjectId(req.session.userInfo.id)})
    if (!doc.data){doc.data = {}};
    doc.save();
    res.status(200).send({
        username: req.session.userInfo.username, 
        data: doc.data
    });
})

module.exports = router;