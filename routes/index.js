var router = require('express').Router();

router.use('/students', require('./students'));
router.use('/admin', require('./admin'));
router.use('/eventleader', require('./eventleader'));

module.exports = router;
