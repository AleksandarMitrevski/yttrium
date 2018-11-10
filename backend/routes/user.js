var express = require('express');
var router = express.Router();

var users_controller = require('../controllers/usersController');

router.post('/login', users_controller.login);
router.post('/register', users_controller.register);
router.post('/change-username', users_controller.changeUsername);
router.post('/change-password', users_controller.changePassword);

module.exports = router;

