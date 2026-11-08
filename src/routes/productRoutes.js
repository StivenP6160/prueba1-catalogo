const { Router } = require('express');
const productController = require('../controllers/productController');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema } = require('../schemas/productSchemas');

const router = Router();

router.get('/', productController.list);
router.get('/:id', productController.getOne);
router.post('/', validate(createProductSchema), productController.create);
router.patch('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', productController.remove);

module.exports = router;