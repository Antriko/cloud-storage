module.exports = (req, res, next) => {
    if(req.session.userInfo) {
        next();
    } else {
        res.status(201).send({});
    }
}