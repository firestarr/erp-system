<!-- src/components/manufacturing/IntegratedBOMForm.vue -->
<template>
    <div class="modal">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit BOM' : 'Create New BOM' }}</h2>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <!-- BOM Header Section -->
            <div class="form-section">
              <h3 class="section-title">BOM Information</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="bom_code">BOM Code*</label>
                  <input 
                    type="text" 
                    id="bom_code" 
                    v-model="form.bom_code" 
                    required
                    :disabled="isEditMode"
                    :class="{ 'is-invalid': errors.bom_code }"
                  />
                  <span v-if="errors.bom_code" class="error-message">{{ errors.bom_code }}</span>
                </div>
                
                <div class="form-group">
                  <label for="item_id">Product*</label>
                  <select 
                    id="item_id" 
                    v-model="form.item_id"
                    required
                    :class="{ 'is-invalid': errors.item_id }"
                  >
                    <option value="">-- Select Product --</option>
                    <option v-for="item in items" :key="item.item_id" :value="item.item_id">
                      {{ item.name }}
                    </option>
                  </select>
                  <span v-if="errors.item_id" class="error-message">{{ errors.item_id }}</span>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="revision">Revision*</label>
                  <input 
                    type="text" 
                    id="revision" 
                    v-model="form.revision" 
                    required
                    :class="{ 'is-invalid': errors.revision }"
                  />
                  <span v-if="errors.revision" class="error-message">{{ errors.revision }}</span>
                </div>
                
                <div class="form-group">
                  <label for="effective_date">Effective Date*</label>
                  <input 
                    type="date" 
                    id="effective_date" 
                    v-model="form.effective_date" 
                    required
                    :class="{ 'is-invalid': errors.effective_date }"
                  />
                  <span v-if="errors.effective_date" class="error-message">{{ errors.effective_date }}</span>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="status">Status*</label>
                  <select 
                    id="status" 
                    v-model="form.status"
                    required
                    :class="{ 'is-invalid': errors.status }"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                  <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
                </div>
                
                <div class="form-group">
                  <label for="uom_id">Unit of Measure*</label>
                  <select 
                    id="uom_id" 
                    v-model="form.uom_id"
                    required
                    :class="{ 'is-invalid': errors.uom_id }"
                  >
                    <option value="">-- Select UOM --</option>
                    <option v-for="uom in unit_of_measures" :key="uom.uom_id" :value="uom.uom_id">
                      {{ uom.name }} ({{ uom.symbol }})
                    </option>
                  </select>
                  <span v-if="errors.uom_id" class="error-message">{{ errors.uom_id }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="standard_quantity">Standard Quantity*</label>
                <input 
                  type="number" 
                  id="standard_quantity" 
                  v-model="form.standard_quantity" 
                  min="0.01" 
                  step="0.01" 
                  required
                  :class="{ 'is-invalid': errors.standard_quantity }"
                />
                <span v-if="errors.standard_quantity" class="error-message">{{ errors.standard_quantity }}</span>
                <span class="hint-text">Quantity of finished item that this BOM produces</span>
              </div>
            </div>
            
            <!-- BOM Components Section -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">BOM Components</h3>
                <button type="button" class="btn btn-secondary btn-sm" @click="addNewLine">
                  <i class="fas fa-plus"></i> Add Component
                </button>
              </div>
              
              <div v-if="form.bomLines.length === 0" class="empty-components">
                <p>No components added yet.</p>
                <button type="button" class="btn btn-outline" @click="addNewLine">
                  Add Your First Component
                </button>
              </div>
              
              <div v-else class="components-table-container">
                <table class="components-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>UOM</th>
                      <th>Critical</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(line, index) in form.bomLines" :key="`bom-line-${index}`" :data-index="index">
                      <td>
                        <select 
                          v-model="line.item_id"
                          required
                          class="line-input"
                        >
                          <option value="">-- Select Item --</option>
                          <option v-for="item in items" :key="item.item_id" :value="item.item_id">
                            {{ item.name }} ({{ item.item_code }})
                          </option>
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          v-model="line.quantity" 
                          min="0.01" 
                          step="0.01" 
                          required
                          class="line-input quantity-input"
                        />
                      </td>
                      <td>
                        <select 
                          v-model="line.uom_id"
                          required
                          class="line-input"
                        >
                          <option value="">-- UOM --</option>
                          <option v-for="uom in unit_of_measures" :key="uom.uom_id" :value="uom.uom_id">
                            {{ uom.symbol }}
                          </option>
                        </select>
                      </td>
                      <td>
                        <div class="checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            v-model="line.is_critical"
                            class="line-checkbox"
                          />
                        </div>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          v-model="line.notes" 
                          placeholder="Optional notes"
                          class="line-input"
                        />
                      </td>
                      <td>
                        <button 
                          type="button" 
                          class="action-btn" 
                          title="Remove Component" 
                          @click="removeLine(index)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update BOM' : 'Create BOM') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import ProductService from '@/services/ProductService';
  import ItemService from '@/services/ItemService';
  import UnitOfMeasureService from '@/services/UnitOfMeasureService';
  
  export default {
    name: 'IntegratedBOMForm',
    props: {
      isEditMode: {
        type: Boolean,
        default: false
      },
      bomData: {
        type: Object,
        default: () => ({})
      },
      isSubmitting: {
        type: Boolean,
        default: false
      }
    },
    emits: ['save', 'close'],
    setup(props, { emit }) {
      const items = ref([]);
      const unit_of_measures = ref([]);
      const errors = ref({});
      
      // Initialize form with defaults or from props if editing
      const form = reactive({
        bom_id: props.bomData?.bom_id || null,
        bom_code: props.bomData?.bom_code || '',
        item_id: props.bomData?.item_id || '',
        revision: props.bomData?.revision || '1.0',
        effective_date: props.bomData?.effective_date || new Date().toISOString().split('T')[0],
        status: props.bomData?.status || 'Draft',
        standard_quantity: props.bomData?.standard_quantity || 1,
        uom_id: props.bomData?.uom_id || '',
        bomLines: props.bomData?.bomLines?.map(line => ({
          line_id: line.line_id,
          item_id: line.item_id,
          quantity: line.quantity,
          uom_id: line.uom_id,
          is_critical: line.is_critical,
          notes: line.notes
        })) || []
      });
      
      // Load items, items and units of measure
      const fetchProducts = async () => {
        try {
          const result = await ProductService.getProducts();
          items.value = result.data || [];
        } catch (error) {
          console.error('Error fetching items:', error);
          // For demonstration, use dummy data
          items.value = [
            { item_id: 1, name: 'Laptop Model X' },
            { item_id: 2, name: 'Smartphone Y Pro' },
            { item_id: 3, name: 'Mechanical Keyboard' },
            { item_id: 4, name: 'Wireless Earbuds' }
          ];
        }
      };
      
      const fetchItems = async () => {
        try {
          const result = await ItemService.getItems();
          items.value = result.data || [];
        } catch (error) {
          console.error('Error fetching items:', error);
          // For demonstration, use dummy data
          items.value = [
            { item_id: 101, name: 'Motherboard X570', item_code: 'MB-X570' },
            { item_id: 102, name: 'CPU Ryzen 7', item_code: 'CPU-R7' },
            { item_id: 103, name: 'RAM DDR4 16GB', item_code: 'RAM-16G' },
            { item_id: 104, name: 'SSD 1TB', item_code: 'SSD-1T' },
            { item_id: 105, name: 'Power Supply 650W', item_code: 'PS-650W' }
          ];
        }
      };
      
      const fetchUnitsOfMeasure = async () => {
        try {
          const result = await UnitOfMeasureService.getAll();
          unit_of_measures.value = result.data || [];
        } catch (error) {
          console.error('Error fetching units of measure:', error);
          // For demonstration, use dummy data
          unit_of_measures.value = [
            { uom_id: 1, name: 'Each', symbol: 'EA' },
            { uom_id: 2, name: 'Piece', symbol: 'PC' },
            { uom_id: 3, name: 'Kilogram', symbol: 'KG' },
            { uom_id: 4, name: 'Meter', symbol: 'M' }
          ];
        }
      };
      
      // Adding a new component line
      const addNewLine = () => {
        form.bomLines.push({
          item_id: '',
          quantity: 1,
          uom_id: form.uom_id || '', // Default to same UOM as BOM if available
          is_critical: false,
          notes: ''
        });
      };
      
      // Remove a component line
      const removeLine = (index) => {
        form.bomLines.splice(index, 1);
      };
      
      // Validate form
      const validateForm = () => {
        errors.value = {};
        
        // Validate header fields
        if (!form.bom_code) {
          errors.value.bom_code = 'BOM Code is required';
        }
        
        if (!form.item_id) {
          errors.value.item_id = 'Product is required';
        }
        
        if (!form.revision) {
          errors.value.revision = 'Revision is required';
        }
        
        if (!form.effective_date) {
          errors.value.effective_date = 'Effective Date is required';
        }
        
        if (!form.status) {
          errors.value.status = 'Status is required';
        }
        
        if (!form.standard_quantity) {
          errors.value.standard_quantity = 'Standard Quantity is required';
        } else if (form.standard_quantity <= 0) {
          errors.value.standard_quantity = 'Standard Quantity must be greater than 0';
        }
        
        if (!form.uom_id) {
          errors.value.uom_id = 'Unit of Measure is required';
        }
        
        // Validate component lines
        if (form.bomLines.length === 0) {
          errors.value.bomLines = 'At least one component is required';
        } else {
          let hasLineErrors = false;
          form.bomLines.forEach((line) => {
            if (!line.item_id || !line.quantity || !line.uom_id || line.quantity <= 0) {
              hasLineErrors = true;
            }
          });
          
          if (hasLineErrors) {
            errors.value.bomLineDetails = 'Please fill in all required fields for each component';
          }
        }
        
        return Object.keys(errors.value).length === 0;
      };
      
      // Submit form
      const submitForm = () => {
        if (validateForm()) {
          emit('save', { ...form });
        }
      };
      
      onMounted(() => {
        fetchProducts();
        fetchItems();
        fetchUnitsOfMeasure();
        
        // If no existing BOM data and no lines added, add an empty line for convenience
        if (!props.isEditMode && !form.bomLines.length) {
          addNewLine();
        }
      });
      
      return {
        form,
        items,
        unit_of_measures,
        errors,
        addNewLine,
        removeLine,
        submitForm
      };
    }
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 50;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    z-index: 60;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .modal-content.modal-lg {
    max-width: 900px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
  }
  
  .close-btn:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: #f8fafc;
  }
  
  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1.25rem 0;
    color: #1e293b;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-group:last-child {
    margin-bottom: 0;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e293b;
  }
  
  .form-group input[type="text"],
  .form-group input[type="date"],
  .form-group input[type="number"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .hint-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .is-invalid {
    border-color: #ef4444 !important;
  }
  
  .error-message {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #ef4444;
  }
  
  .components-table-container {
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .components-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  
  .components-table th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    background-color: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    color: #334155;
  }
  
  .components-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  
  .line-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .quantity-input {
    width: 80px;
  }
  
  .checkbox-wrapper {
    display: flex;
    justify-content: center;
  }
  
  .line-checkbox {
    width: 1rem;
    height: 1rem;
  }
  
  .action-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }
  
  .action-btn:hover {
    background-color: #f1f5f9;
    color: #ef4444;
  }
  
  .empty-components {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: #64748b;
    background-color: #f1f5f9;
    border-radius: 0.375rem;
    border: 1px dashed #cbd5e1;
  }
  
  .empty-components p {
    margin-bottom: 1rem;
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background-color: #2563eb;
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: #e2e8f0;
    color: #334155;
  }
  
  .btn-secondary:hover {
    background-color: #cbd5e1;
  }
  
  .btn-outline {
    background-color: transparent;
    border: 1px solid #2563eb;
    color: #2563eb;
  }
  
  .btn-outline:hover {
    background-color: #eff6ff;
  }
  
  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
  </style>