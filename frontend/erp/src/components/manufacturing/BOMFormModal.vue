<!-- src/components/manufacturing/BOMFormModal.vue -->
<template>
  <div class="modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditMode ? 'Edit BOM' : 'Create New BOM' }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
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
              <label for="product_id">Product*</label>
              <select 
                id="product_id" 
                v-model="form.product_id"
                required
                :class="{ 'is-invalid': errors.product_id }"
              >
                <option value="">-- Select Product --</option>
                <option v-for="product in products" :key="product.product_id" :value="product.product_id">
                  {{ product.name }}
                </option>
              </select>
              <span v-if="errors.product_id" class="error-message">{{ errors.product_id }}</span>
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
                <option v-for="uom in unitsOfMeasure" :key="uom.uom_id" :value="uom.uom_id">
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
            <span class="hint-text">Quantity of finished product that this BOM produces</span>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode ? 'Update BOM' : 'Create BOM' }}
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
import UnitOfMeasureService from '@/services/UnitOfMeasureService';

export default {
  name: 'BOMFormModal',
  props: {
    isEditMode: {
      type: Boolean,
      default: false
    },
    bomData: {
      type: Object,
      required: true
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const products = ref([]);
    const unitsOfMeasure = ref([]);
    const isLoading = ref(false);
    const errors = ref({});
    
    // Initialize form with defaults or from props if editing
    const form = reactive({
      bom_id: props.bomData.bom_id || null,
      bom_code: props.bomData.bom_code || '',
      product_id: props.bomData.product_id || '',
      revision: props.bomData.revision || '1.0',
      effective_date: props.bomData.effective_date || new Date().toISOString().split('T')[0],
      status: props.bomData.status || 'Draft',
      standard_quantity: props.bomData.standard_quantity || 1,
      uom_id: props.bomData.uom_id || ''
    });
    
    // Load products and units of measure
    const fetchProducts = async () => {
      try {
        const result = await ProductService.getProducts();
        products.value = result.data || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        // For demonstration, use dummy data
        products.value = [
          { product_id: 1, name: 'Laptop Model X' },
          { product_id: 2, name: 'Smartphone Y Pro' },
          { product_id: 3, name: 'Mechanical Keyboard' },
          { product_id: 4, name: 'Wireless Earbuds' }
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
      
      if (!form.bom_code) {
        errors.value.bom_code = 'BOM Code is required';
      }
      
      if (!form.product_id) {
        errors.value.product_id = 'Product is required';
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
      fetchUnitsOfMeasure();
    });
    
    return {
      form,
      products,
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
  max-width: 600px;
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
.form-group input[type="date"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
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