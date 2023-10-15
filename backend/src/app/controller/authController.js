const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// tạo mảng lưu trư refreshToken
let refreshTokens = [];

const authController = {

    // registerUser
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            
            // create new users
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            })

            // save user
            const saveUser = await newUser.save();
            res.status(200).json(saveUser);
        }
        catch (err) {
            res.status(500).json(err)
        }
    },

    // GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            admin: user.admin
        },
        process.env.JWT_ACCESS_KEY,
        {expiresIn: "30s" }
        )
    },

    // GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign({
            id: user.id,
            admin: user.admin
        },
        process.env.JWT_REFRESH_KEY,
        {expiresIn: "365d" }
        )
    },

    // login
    loginUser: async (req, res) => {
      try{
        const user = await User.findOne({username: req.body.username});

        if (!user) {
            res.status(404).json('Wrong username!')
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        ) 

        if (!validPassword){
            res.status(404).json('Wrong password!')
        }

        if(user && validPassword){
            // json web token
            // tạo accessToken
            const accessToken = authController.generateAccessToken(user);

            // tao refreshToken
            const refreshToken = authController.generateRefreshToken(user);

            // lưu refreshToken vào dataBase hay lưu vào mảng refreshToken
            refreshTokens.push(refreshToken);

            // lưu refreshtoken lên cookie 
            res.cookie("refreshToken", refreshToken, {
                httpOnly:true, 
                secure:false,
                path: "/",
                sameSite: "Strict"
            })

            // không hiển thị password cho người khác thấy
            const {password, ...orther} = user._doc
            res.status(200).json({...orther , accessToken})
        }
      }
      catch (err) {
        res.status(500).json(err)
      }  
    },

    requestRefreshToken: async (req, res) => {
        // lấy refresh token cho user
        const refresToken = req.cookies.refreshToken;
        if (!refresToken) return res.status(401).json("you're not authenticated")

        // kiểm tra xem refreshToken của mình có trong mảng đó không
        if (!refreshTokens.includes(refresToken)) {
            return res.status(403).json('Refresh token is not valid')
        }

        // xác minh refresh
        jwt.verify(refresToken, process.env.JWT_REFRESH_KEY, (err, user)=> {
            if (err) {
                console.log(err);
            }

            // lọc lấy token cũ ra
            refreshTokens = refreshTokens.filter(token => token !== refresToken);

            // tạo refreshToken và accessToken mới
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);

            // thêm Token mới vào mảng hay database tạo trước đó
            refreshTokens.push(newRefreshToken)

            // lưu refreshToken mới
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly:true, 
                secure:false,
                path: "/",
                sameSite: "Strict"
            })
            // lưu accessToken mới
            res.status(200).json({accessToken: newAccessToken});
        })
    },

    logoutUser : async(req,res) => {
        res.clearCookie("refreshToken");
        // xóa các refreshtoken đã tồn tại trong database
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refresToken);
        res.status(200).json('Logged out!')
    }
}

module.exports = authController