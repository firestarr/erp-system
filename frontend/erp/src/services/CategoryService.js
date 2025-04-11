// src/services/CategoryService.js
import api from './api';

/**
 * Service for item category operations
 */
const CategoryService = {
  /**
   * Get all item categories
   * @param {object} params Query parameters
   * @returns {Promise} Promise with categories response
   */
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/item-categories', { params });
      return response.data;
    } catch (error) {
      console.error('API Error getCategories:', error);
      throw error;
    }
  },
  
  /**
   * Get a category by ID
   * @param {number} id Category ID
   * @returns {Promise} Promise with category response
   */
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/item-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API Error getCategoryById(${id}):`, error);
      throw error;
    }
  },
  
  /**
   * Create a new category
   * @param {object} categoryData Category data
   * @returns {Promise} Promise with create category response
   */
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/item-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('API Error createCategory:', error);
      throw error;
    }
  },
  
  /**
   * Update a category
   * @param {number} id Category ID
   * @param {object} categoryData Category data to update
   * @returns {Promise} Promise with update category response
   */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/item-categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`API Error updateCategory(${id}):`, error);
      throw error;
    }
  },
  
  /**
   * Delete a category
   * @param {number} id Category ID
   * @returns {Promise} Promise with delete category response
   */
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/item-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`API Error deleteCategory(${id}):`, error);
      throw error;
    }
  },
  
  /**
   * Get a hierarchical tree view of categories
   * @returns {Promise} Promise with categories hierarchy
   */
  getCategoryHierarchy: async () => {
    try {
      // In a real implementation, you might have a specialized endpoint for this
      const response = await api.get('/item-categories');
      const categories = response.data.data || [];
      
      // Create a hierarchy from flat list
      const rootCategories = categories.filter(c => !c.parent_category_id);
      
      // Helper function to build the tree recursively
      const buildCategoryTree = (parentId) => {
        return categories
          .filter(c => c.parent_category_id === parentId)
          .map(category => ({
            ...category,
            children: buildCategoryTree(category.category_id)
          }));
      };
      
      // Build the tree starting from root categories
      rootCategories.forEach(root => {
        root.children = buildCategoryTree(root.category_id);
      });
      
      return rootCategories;
    } catch (error) {
      console.error('API Error getCategoryHierarchy:', error);
      throw error;
    }
  }
};

export default CategoryService;