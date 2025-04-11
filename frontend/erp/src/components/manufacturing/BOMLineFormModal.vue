<!-- src/components/manufacturing/BOMLineFormModal.vue -->
<template>
    <div class="modal">
      <div class="modal-backdrop" @click="$emit('close')"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Component' : 'Add Component' }}</h2>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="item_id">Item*</label>
              <select 
                id="item_id" 
                v-model="form.item_id" 
                required
                :class="{ 'is-invalid': errors.item_id }"
              >
                <option value="">-- Select Item --</option>
                <option v-for="item in items" :key="item.item_id" :value="item.item_id">
                  {{ item.name }} ({{ item.item_code }})
                </option>
              </select>
              <span v-if="errors.item_id" class="error-message">{{ errors.item_id }}</span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="quantity">Quantity*</label>
                <input 
                  type="number" 
                  id="quantity" 
                  v-model="form.quantity" 
                  min="0.01" 
                  step="0.01" 
                  required
                  :class="{ 'is-invalid': errors.quantity }"
                />
                <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
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
                  <option v-for="uom in unitsOfMeasure" :key="uom.uom_id" :value="uom.uom_id">
                    {{ uom.name }} ({{ uom.symbol }})
                  </option>
                </select>
                <span v-if="errors.uom_id" class="error-message">{{ errors.uom_id }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  type="checkbox" 
                  id="is_critical" 
                  v-model="form.is_critical"
                />
                <label for="is_critical">Critical Component</label>
              </div>
              <span class="hint-text">Mark this component as critical if it's essential for the final product.</span>
            </div>
            
            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea 
                id="notes" 
                v-model="form.notes" 
                rows="3"
                :class="{ 'is-invalid': errors.notes }"
              ></textarea>
              <span v-if="errors.notes" class="error-message">{{ errors.notes }}</span>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? 'Update Component' : 'Add Component' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import ItemService from '@/services/ItemService';
  import UnitOfMeasureService from '@/services/UnitOfMeasureService';
  
  export default {
    name: 'BOMLineFormModal',
    props: {
      isEditMode: {
        type: Boolean,
        default: false
      },
      lineData: {
        type: Object,
        required: true
      },
      bomId: {
        type: Number,
        required: true
      }
    },
    emits: ['save', 'close'],
    setup(props, { emit }) {
      const items = ref([]);
      const unitsOfMeasure = ref([]);
      const isLoading = ref(false);
      const errors = ref({});
      
      // Form data with defaults or from props if editing
      const form = reactive({
        line_id: props.lineData.line_id || null,
        bom_id: props.bomId,
        item_id: props.lineData.item_id || '',
        quantity: props.lineData.quantity || 1,
        uom_id: props.lineData.uom_id || '',
        is_critical: props.lineData.is_critical || false,
        notes: props.lineData.notes || ''
      });
      
      // Load items and units of measure
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
          unitsOfMeasure.value = result.data || [];
        } catch (error) {
          console.error('Error fetching units of measure:', error);
          // For demonstration, use dummy data
          unitsOfMeasure.value = [
            { uom_id: 1, name: 'Each', symbol: 'EA' },
            { uom_id: 2, name: 'Piece', symbol: 'PC' },
            { uom_id: 3, name: 'Kilogram', symbol: 'KG' },
            { uom_id: 4, name: 'Meter', symbol: 'M' }
          ];
        }
      };
      
      // Validate form
      const validateForm = () => {
        errors.value = {};
        
        if (!form.item_id) {
          errors.value.item_id = 'Item is required';
        }
        
        if (!form.quantity) {
          errors.value.quantity = 'Quantity is required';
        } else if (form.quantity <= 0) {
          errors.value.quantity = 'Quantity must be greater than 0';
        }
        
        if (!form.uom_id) {
          errors.value.uom_id = 'Unit of Measure is required';
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
        fetchItems();
        fetchUnitsOfMeasure();
      });
      
      return {
        form,
        items,
        unitsOfMeasure,
        isLoading,
        errors,
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
    max-width: 550px;
    z-index: 60;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
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
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e293b;
  }
  
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .form-group textarea {
    resize: vertical;
  }
  
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .checkbox-group input[type="checkbox"] {
    width: auto;
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
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
  </style>