module.exports = (req, res, next) => {
    if(req.session.userInfo) {
        next();
    } else {
        res.sendStatus(401);
    }
}