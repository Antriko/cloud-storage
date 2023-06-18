var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

(async () => {
    connectionString = `mongodb://${process.env.DB_SERVICE_NAME}:27017/${process.env.DB_DATABASE}`
    await mongoose.connect(connectionString, {
        authSource: "admin",
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD
    })
    .then(() => console.log("Connected to database"))
    .catch(e => console.log("ERROR", e))

    // parse and session
    const session = require('express-session');
    const MongoStore = require('connect-mongo');
    
    app.use(session({
        secret: 'foo',
        store: MongoStore.create({
            mongoUrl: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SERVICE_NAME}:27017/`, 
            dbName: process.env.DB_DATABASE
        }),
        resave: false,
        saveUninitialized: true
    }));
    
    // user rest api
    var user = require('./user.js');
    app.use('/api/user', user)

    // storage rest api
    var storage = require('./storage.js');
    app.use('/api/storage', storage)
})()

const PORT = 3010;
app.listen(PORT);
console.log("Backend started")