const { Router } = require('express');
const productController = require('../controllers/productController');

const router = Router();

router.get('/', productController.list);
router.get('/:id', productController.getOne);

module.exports = router;