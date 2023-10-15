const router = require('express').Router();
const authController = require('../app/controller/authController')
const middlewareController = require("../app/controller/middlewareController")

router.post('/register', authController.registerUser)

router.post('/login', authController.loginUser)

router.post('/refresh', authController.requestRefreshToken)

router.post('/logout' , middlewareController.verifyToken ,authController.logoutUser) 

module.exports = router