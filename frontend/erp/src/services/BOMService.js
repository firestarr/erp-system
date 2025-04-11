// src/services/BOMService.js
import api from './api';

/**
 * Service for Bill of Materials (BOM) operations
 */
const BOMService = {
  /**
   * Get all BOMs
   * @param {object} params Query parameters
   * @returns {Promise} Promise with BOMs response
   */
  getBOMs: async (params = {}) => {
    const response = await api.get('/boms', { params });
    return response.data;
  },
  
  /**
   * Get a BOM by ID
   * @param {number} id BOM ID
   * @returns {Promise} Promise with BOM response
   */
  getBOMById: async (id) => {
    const response = await api.get(`/boms/${id}`);
    return response.data;
  },
  
  /**
   * Create a new BOM
   * @param {object} bomData BOM data
   * @returns {Promise} Promise with create BOM response
   */
  createBOM: async (bomData) => {
    const response = await api.post('/boms', bomData);
    return response.data;
  },
  
  /**
   * Update a BOM
   * @param {number} id BOM ID
   * @param {object} bomData BOM data to update
   * @returns {Promise} Promise with update BOM response
   */
  updateBOM: async (id, bomData) => {
    const response = await api.put(`/boms/${id}`, bomData);
    return response.data;
  },
  
  /**
   * Delete a BOM
   * @param {number} id BOM ID
   * @returns {Promise} Promise with delete BOM response
   */
  deleteBOM: async (id) => {
    const response = await api.delete(`/boms/${id}`);
    return response.data;
  },
  
  /**
   * Get BOM lines for a specific BOM
   * @param {number} bomId BOM ID
   * @returns {Promise} Promise with BOM lines response
   */
  getBOMLines: async (bomId) => {
    const response = await api.get(`/boms/${bomId}/lines`);
    return response.data;
  },
  
  /**
   * Create a new BOM line
   * @param {number} bomId BOM ID
   * @param {object} lineData Line data
   * @returns {Promise} Promise with create BOM line response
   */
  createBOMLine: async (bomId, lineData) => {
    const response = await api.post(`/boms/${bomId}/lines`, lineData);
    return response.data;
  },
  
  /**
   * Update a BOM line
   * @param {number} bomId BOM ID
   * @param {number} lineId Line ID
   * @param {object} lineData Line data to update
   * @returns {Promise} Promise with update BOM line response
   */
  updateBOMLine: async (bomId, lineId, lineData) => {
    const response = await api.put(`/boms/${bomId}/lines/${lineId}`, lineData);
    return response.data;
  },
  
  /**
   * Delete a BOM line
   * @param {number} bomId BOM ID
   * @param {number} lineId Line ID
   * @returns {Promise} Promise with delete BOM line response
   */
  deleteBOMLine: async (bomId, lineId) => {
    const response = await api.delete(`/boms/${bomId}/lines/${lineId}`);
    return response.data;
  }
};

export default BOMService;