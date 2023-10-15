const jwt = require('jsonwebtoken');

const middlewareController = {
    // verify Token / xác thực người dùng
    verifyToken: (req, res, next) => {
        // tạo token ở phần req header
        const Token = req.headers.token;
        if (Token) {
            const accessToken = Token.split(" ")[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json('Token is not valid');
                }
                req.user = user;
                next()
            })
        }
        else{
            return res.status(401).json("you're not autheticated")
        }
    },
    
    verifyTokenAndAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, ()=> {
            if(req.user.id == req.params.id || req.user.admin) {
                next()
            }
            else {
                return res.status(403).json("you're not allowed to delete orther")
            }
        })
    }
}

module.exports = middlewareController