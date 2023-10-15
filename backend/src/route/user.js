const router = require('express').Router();
const middlewareController = require('../app/controller/middlewareController');
const userController = require('../app/controller/userController');

router.get('/', middlewareController.verifyToken ,userController.getAllUser);

router.delete('/:id', middlewareController.verifyTokenAndAdmin ,userController.deleteUser);

module.exports = router