const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  removeToolFromCategory
} = require('../controllers/categoryController');

// Create
router.post('/createCategory', createCategory);

// Read
router.get('/getCategories', getCategories);
router.get('/getCategory/:id', getCategoryById);

// Update
router.put('/updateCategory/:id', updateCategory);

// Delete
router.delete('/deleteCategory/:id', deleteCategory);

router.delete('/:categoryId/tool/:toolName', removeToolFromCategory);

module.exports = router;
