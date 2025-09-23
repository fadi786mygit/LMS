const Category = require('../models/Category');

// CREATE a new category
const createCategory = async (req, res) => {
  const { name, tools } = req.body;

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, tools }); // tools must be array of { name, link }
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a category by ID
const updateCategory = async (req, res) => {
  const { name, tools } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, tools }, // tools must be array of { name, link }
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a category by ID
const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE a tool (by name) from a category
const removeToolFromCategory = async (req, res) => {
  const { categoryId, toolName } = req.params;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find tool index by name
    const toolIndex = category.tools.findIndex(tool => tool.name === toolName);
    if (toolIndex === -1) {
      return res.status(404).json({ message: "Tool not found in category" });
    }

    category.tools.splice(toolIndex, 1); // remove tool object
    await category.save();

    res.json({ message: "Tool removed successfully", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  removeToolFromCategory
};
