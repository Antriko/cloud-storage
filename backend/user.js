var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var authUser = require('./authUser.js');

// Encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;
const privateKey = 'privateKey'

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

router.post('/create', async(req, res) => {
    console.log(req.body)
    var user = mongoose.model('User', userSchema);  // Get database
    var doc = await user.findOne({username: req.body.username}) // Find if username exists
    console.log(doc)
    if(!doc) {     // Unique username, create user
        var id = new mongoose.Types.ObjectId();
        bcrypt.hash(req.body.password, saltRounds)  // Encrypt password
        .then(hashedPass => {
            user.create({
                _id: id,
                username: req.body.username,
                password: hashedPass,
                basket: {}
            })
        })
        req.session.userInfo = {id: id, username: req.body.username};
        res.status(200).send({text: "User created"})
    } else {    // Username already exists
        res.status(201).send({text: "Username already exists"})
    }
})

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
    res.status(200).send({username: doc.username, basket: doc.basket})
})

router.post('/forgot', async (req, res) => {
    console.log(req.body)
    var user = mongoose.model('User', userSchema);  // Get database
    var newPass = await bcrypt.hash(req.body.password, saltRounds)
    console.log(newPass)
    var doc = await user.findOneAndUpdate({username: req.body.username}, {
        password: newPass
    })
    if (!doc) {
        res.status(201).send({text: "No user found"});
        return;
    }
    res.status(200).send({text: "Password changed"});
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie("userInfo")
    res.sendStatus(200);
})


router.get('/verify', authUser, async(req, res) => {   // heartbeat
    let user = mongoose.model('User', userSchema)
    var doc = await user.findOne({_id: new mongoose.Types.ObjectId(req.session.userInfo.id)})
    console.log('verify')
    if (!doc.data){doc.data = {}};
    doc.save();
    res.status(200).send({
        username: req.session.userInfo.username, 
        data: doc.data
    }); // add more if needed - useEffect
})

console.log("User backend")
module.exports = router;