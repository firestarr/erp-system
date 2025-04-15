// src/services/BOMService.js
import api from './api';

/**
 * Service for Bill of Materials (BOM) operations
 */
const BOMService = {
  /**
   * Get all BOMs with optional pagination and filters
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} Promise with BOMs response
   */
  getAllBOMs: async (params = {}) => {
    try {
      const response = await api.get('/manufacturing/boms', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      throw error;
    }
  },

  /**
   * Get a specific BOM by ID
   * @param {Number} id - BOM ID
   * @returns {Promise} Promise with BOM response
   */
  getBOMById: async (id) => {
    try {
      const response = await api.get(`/manufacturing/boms/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching BOM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new BOM
   * @param {Object} bomData - BOM data including components
   * @returns {Promise} Promise with create BOM response
   */
  createBOM: async (bomData) => {
    try {
      const response = await api.post('/manufacturing/boms', bomData);
      return response.data;
    } catch (error) {
      console.error('Error creating BOM:', error);
      throw error;
    }
  },

  /**
   * Update an existing BOM
   * @param {Number} id - BOM ID
   * @param {Object} bomData - BOM data to update
   * @returns {Promise} Promise with update BOM response
   */
  updateBOM: async (id, bomData) => {
    try {
      const response = await api.put(`/manufacturing/boms/${id}`, bomData);
      return response.data;
    } catch (error) {
      console.error(`Error updating BOM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a BOM
   * @param {Number} id - BOM ID
   * @returns {Promise} Promise with delete BOM response
   */
  deleteBOM: async (id) => {
    try {
      const response = await api.delete(`/manufacturing/boms/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting BOM ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get BOM component lines
   * @param {Number} bomId - BOM ID
   * @returns {Promise} Promise with BOM lines response
   */
  getBOMLines: async (bomId) => {
    try {
      const response = await api.get(`/manufacturing/boms/${bomId}/lines`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching BOM lines for BOM ${bomId}:`, error);
      throw error;
    }
  },

  /**
   * Add a new component line to a BOM
   * @param {Number} bomId - BOM ID
   * @param {Object} lineData - BOM line data
   * @returns {Promise} Promise with create BOM line response
   */
  addBOMLine: async (bomId, lineData) => {
    try {
      const response = await api.post(`/manufacturing/boms/${bomId}/lines`, lineData);
      return response.data;
    } catch (error) {
      console.error(`Error adding BOM line to BOM ${bomId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing BOM line
   * @param {Number} bomId - BOM ID
   * @param {Number} lineId - BOM line ID
   * @param {Object} lineData - BOM line data to update
   * @returns {Promise} Promise with update BOM line response
   */
  updateBOMLine: async (bomId, lineId, lineData) => {
    try {
      const response = await api.put(`/manufacturing/boms/${bomId}/lines/${lineId}`, lineData);
      return response.data;
    } catch (error) {
      console.error(`Error updating BOM line ${lineId} for BOM ${bomId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a BOM line
   * @param {Number} bomId - BOM ID
   * @param {Number} lineId - BOM line ID
   * @returns {Promise} Promise with delete BOM line response
   */
  deleteBOMLine: async (bomId, lineId) => {
    try {
      const response = await api.delete(`/manufacturing/boms/${bomId}/lines/${lineId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting BOM line ${lineId} for BOM ${bomId}:`, error);
      throw error;
    }
  }
};

export default BOMService;