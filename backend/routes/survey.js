var express = require('express');
var router = express.Router();

var surveys_controller = require('../controllers/surveysController');

router.post('/', surveys_controller.create);
router.put('/', surveys_controller.create);
router.get('/', surveys_controller.list);
router.get('/:id', surveys_controller.get);
router.post('/:id', surveys_controller.modify);
router.delete('/:id', surveys_controller.delete);

module.exports = router;
