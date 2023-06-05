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
    if(!doc) {     // First time user creation
        var id = new mongoose.Types.ObjectId();
        bcrypt.hash(process.env.APP_PASS, saltRounds)  // Encrypt password
        .then(hashedPass => {
            user.create({
                _id: id,
                username: process.env.APP_USER,
                password: hashedPass,
            })
        })
    }
})()

router.post('/login', async(req, res) => {
    console.log('Login')
    console.log(req.body, req.session)

    let user = mongoose.model('User', userSchema);  // Get database
    var doc = await user.findOne({username: req.body.username});

    if (!doc) { // No user found
        res.status(201).send({text: "No user found"})
        return;
    }

    console.log(doc)
    var compare = bcrypt.compare(req.body.password, doc.password)
    if (!compare) res.status(201).send({text: "Incorrect password"}) // Incorrect password

    // Success, send session
    req.session.userInfo = {
        id: doc.id, 
        username: req.body.username
    };
    res.status(200).send({username: doc.username})
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
    }); // add more if needed - useEffect
})

console.log("User backend")
module.exports = router;