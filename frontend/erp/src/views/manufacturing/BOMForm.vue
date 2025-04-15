<!-- src/views/manufacturing/BOMForm.vue -->
<template>
  <div class="bom-form-container">
    <div class="page-header">
      <div class="header-left">
        <router-link :to="isEditMode ? `/manufacturing/boms/${bomId}` : '/manufacturing/boms'" class="back-link">
          <i class="fas fa-arrow-left"></i> {{ isEditMode ? 'Back to BOM Details' : 'Back to BOMs' }}
        </router-link>
        <h1>{{ isEditMode ? 'Edit BOM' : 'Create New BOM' }}</h1>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>{{ isEditMode ? 'Loading BOM data...' : 'Loading data...' }}</p>
    </div>

    <form v-else @submit.prevent="saveBOM" class="bom-form">
      <!-- BOM Header Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">BOM Information</h2>
        </div>
        <div class="card-body">
          <!-- First Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="item_id">Item*</label>
              <select 
                id="item_id" 
                v-model="formData.item_id" 
                required
                :disabled="isEditMode"
                :class="{ 'is-invalid': errors.item_id }"
              >
                <option value="">-- Select Item --</option>
                <option v-for="item in items" :key="item.item_id" :value="item.item_id">
                  {{ item.name }} ({{ item.item_code }})
                </option>
              </select>
              <div v-if="errors.item_id" class="invalid-feedback">{{ errors.item_id }}</div>
            </div>

            <div class="form-group">
              <label for="bom_code">BOM Code*</label>
              <input 
                type="text" 
                id="bom_code" 
                v-model="formData.bom_code" 
                required
                :disabled="isEditMode"
                :class="{ 'is-invalid': errors.bom_code }"
                placeholder="Enter BOM code"
              />
              <div v-if="errors.bom_code" class="invalid-feedback">{{ errors.bom_code }}</div>
            </div>
          </div>

          <!-- Second Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="revision">Revision*</label>
              <input 
                type="text" 
                id="revision" 
                v-model="formData.revision" 
                required
                :class="{ 'is-invalid': errors.revision }"
                placeholder="Enter revision (e.g., A, 1.0)"
              />
              <div v-if="errors.revision" class="invalid-feedback">{{ errors.revision }}</div>
            </div>

            <div class="form-group">
              <label for="effective_date">Effective Date*</label>
              <input 
                type="date" 
                id="effective_date" 
                v-model="formData.effective_date" 
                required
                :class="{ 'is-invalid': errors.effective_date }"
              />
              <div v-if="errors.effective_date" class="invalid-feedback">{{ errors.effective_date }}</div>
            </div>
          </div>

          <!-- Third Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="standard_quantity">Standard Quantity*</label>
              <input 
                type="number" 
                id="standard_quantity" 
                v-model="formData.standard_quantity" 
                required
                min="0.01"
                step="0.01"
                :class="{ 'is-invalid': errors.standard_quantity }"
                placeholder="Enter standard quantity"
              />
              <div v-if="errors.standard_quantity" class="invalid-feedback">{{ errors.standard_quantity }}</div>
            </div>

            <div class="form-group">
              <label for="uom_id">Unit of Measure*</label>
              <select 
                id="uom_id" 
                v-model="formData.uom_id" 
                required
                :class="{ 'is-invalid': errors.uom_id }"
              >
                <option value="">-- Select UOM --</option>
                <option v-for="uom in unitOfMeasures" :key="uom.uom_id" :value="uom.uom_id">
                  {{ uom.name }} ({{ uom.symbol }})
                </option>
              </select>
              <div v-if="errors.uom_id" class="invalid-feedback">{{ errors.uom_id }}</div>
            </div>
          </div>

          <!-- Fourth Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="status">Status*</label>
              <select 
                id="status" 
                v-model="formData.status" 
                required
                :class="{ 'is-invalid': errors.status }"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Obsolete">Obsolete</option>
              </select>
              <div v-if="errors.status" class="invalid-feedback">{{ errors.status }}</div>
            </div>

            <div class="form-group">
              <!-- Empty group for alignment -->
            </div>
          </div>
        </div>
      </div>

      <!-- BOM Line Items -->
      <div class="card mt-4">
        <div class="card-header bom-lines-header">
          <h2 class="card-title">BOM Components</h2>
          <button type="button" class="btn btn-secondary" @click="addBOMLine">
            <i class="fas fa-plus"></i> Add Component
          </button>
        </div>
        <div class="card-body p-0">
          <table class="bom-lines-table">
            <thead>
              <tr>
                <th>Item*</th>
                <th>Quantity*</th>
                <th>UOM*</th>
                <th>Critical</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="formData.bom_lines.length === 0">
                <td colspan="6" class="empty-state">
                  No components added. Click "Add Component" to add BOM components.
                </td>
              </tr>
              <BOMLineItem
                v-for="(line, index) in formData.bom_lines" 
                :key="index"
                :line="line"
                :line-index="index"
                :items="componentItems"
                :unit-of-measures="unitOfMeasures"
                :validation-errors="lineErrors[index] || {}"
                @update="updateBOMLine"
                @remove="removeBOMLine(index)"
              />
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <router-link 
          :to="isEditMode ? `/manufacturing/boms/${bomId}` : '/manufacturing/boms'" 
          class="btn btn-secondary"
        >
          Cancel
        </router-link>
        <button type="submit" class="btn btn-primary" :disabled="isSaving">
          <i v-if="isSaving" class="fas fa-spinner fa-spin mr-2"></i>
          {{ isSaving ? 'Saving...' : (isEditMode ? 'Update BOM' : 'Create BOM') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import BOMService from '@/services/BOMService';
import BOMLineItem from '@/components/manufacturing/BOMLineItem.vue';

export default {
  name: 'BOMForm',
  components: {
    BOMLineItem
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isLoading = ref(true);
    const isSaving = ref(false);
    
    // Determine if we're editing or creating
    const isEditMode = computed(() => !!route.params.id);
    const bomId = computed(() => route.params.id);
    
    // Form data
    const formData = reactive({
      item_id: '',
      bom_code: '',
      revision: '',
      effective_date: new Date().toISOString().split('T')[0], // Default to today
      status: 'Draft',
      standard_quantity: '',
      uom_id: '',
      bom_lines: []
    });
    
    // Options for selects
    const items = ref([]);
    const componentItems = ref([]);
    const unitOfMeasures = ref([]);
    
    // Validation errors
    const errors = ref({});
    const lineErrors = ref({});
    
    // Fetch required data (items, UOMs)
    const fetchFormData = async () => {
      isLoading.value = true;
      
      try {
        // Fetch items
        const itemsResponse = await api.get('/items');
        items.value = itemsResponse.data.data || [];
        componentItems.value = [...items.value]; // Copy items for components
        
        // Fetch UOMs
        const uomsResponse = await api.get('/unit-of-measures');
        unitOfMeasures.value = uomsResponse.data.data || [];
        
        // If editing, fetch the BOM data
        if (isEditMode.value) {
          const bomResponse = await BOMService.getBOMById(bomId.value);
          const bomData = bomResponse.data;
          
          // Set main form data
          formData.item_id = bomData.item_id;
          formData.bom_code = bomData.bom_code;
          formData.revision = bomData.revision;
          formData.effective_date = bomData.effective_date ? new Date(bomData.effective_date).toISOString().split('T')[0] : '';
          formData.status = bomData.status;
          formData.standard_quantity = bomData.standard_quantity;
          formData.uom_id = bomData.uom_id;
          
          // Set BOM lines
          if (bomData.bomLines && bomData.bomLines.length > 0) {
            formData.bom_lines = bomData.bomLines.map(line => ({
              line_id: line.line_id, // Include line_id for existing lines
              item_id: line.item_id,
              quantity: line.quantity,
              uom_id: line.uom_id,
              is_critical: line.is_critical,
              notes: line.notes
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Add a new BOM line
    const addBOMLine = () => {
      formData.bom_lines.push({
        item_id: '',
        quantity: '',
        uom_id: '',
        is_critical: false,
        notes: ''
      });
    };
    
    // Update a BOM line
    const updateBOMLine = ({ index, line }) => {
      Object.assign(formData.bom_lines[index], line);
    };
    
    // Remove a BOM line
    const removeBOMLine = (index) => {
      formData.bom_lines.splice(index, 1);
    };
    
    // Validate form
    const validateForm = () => {
      // Reset errors
      errors.value = {};
      lineErrors.value = {};
      
      let isValid = true;
      
      // Validate main form fields
      if (!formData.item_id) {
        errors.value.item_id = 'Please select an item';
        isValid = false;
      }
      
      if (!formData.bom_code) {
        errors.value.bom_code = 'BOM code is required';
        isValid = false;
      }
      
      if (!formData.revision) {
        errors.value.revision = 'Revision is required';
        isValid = false;
      }
      
      if (!formData.effective_date) {
        errors.value.effective_date = 'Effective date is required';
        isValid = false;
      }
      
      if (!formData.standard_quantity || formData.standard_quantity <= 0) {
        errors.value.standard_quantity = 'Standard quantity must be greater than 0';
        isValid = false;
      }
      
      if (!formData.uom_id) {
        errors.value.uom_id = 'Please select a unit of measure';
        isValid = false;
      }
      
      // Validate BOM lines
      formData.bom_lines.forEach((line, index) => {
        const lineError = {};
        
        if (!line.item_id) {
          lineError.item_id = 'Please select an item';
          isValid = false;
        }
        
        if (!line.quantity || line.quantity <= 0) {
          lineError.quantity = 'Quantity must be greater than 0';
          isValid = false;
        }
        
        if (!line.uom_id) {
          lineError.uom_id = 'Please select a unit of measure';
          isValid = false;
        }
        
        // If any errors, add to lineErrors
        if (Object.keys(lineError).length > 0) {
          lineErrors.value[index] = lineError;
        }
      });
      
      return isValid;
    };
    
    // Save the BOM
    const saveBOM = async () => {
      if (!validateForm()) {
        // Scroll to first error
        const firstErrorElement = document.querySelector('.is-invalid');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      isSaving.value = true;
      
      try {
        // Format the data for API
        const apiData = {
          item_id: formData.item_id,
          bom_code: formData.bom_code,
          revision: formData.revision,
          effective_date: formData.effective_date,
          status: formData.status,
          standard_quantity: formData.standard_quantity,
          uom_id: formData.uom_id,
          bom_lines: formData.bom_lines
        };
        
        let response;
        
        if (isEditMode.value) {
          // Update existing BOM
          response = await BOMService.updateBOM(bomId.value, apiData);
          
          // Handle BOM lines separately for an update
          const existingLines = formData.bom_lines.filter(line => line.line_id);
          const newLines = formData.bom_lines.filter(line => !line.line_id);
          
          // Get existing BOM lines to determine which ones to delete
          const existingLinesResponse = await BOMService.getBOMLines(bomId.value);
          const existingBOMLines = existingLinesResponse.data || [];
          
          // Find lines to delete (lines that exist in DB but not in form)
          const linesToDelete = existingBOMLines.filter(dbLine => 
            !existingLines.some(formLine => formLine.line_id === dbLine.line_id)
          );
          
          // Delete removed lines
          for (const line of linesToDelete) {
            await BOMService.deleteBOMLine(bomId.value, line.line_id);
          }
          
          // Update existing lines
          for (const line of existingLines) {
            await BOMService.updateBOMLine(bomId.value, line.line_id, {
              item_id: line.item_id,
              quantity: line.quantity,
              uom_id: line.uom_id,
              is_critical: line.is_critical,
              notes: line.notes
            });
          }
          
          // Add new lines
          for (const line of newLines) {
            await BOMService.addBOMLine(bomId.value, {
              item_id: line.item_id,
              quantity: line.quantity,
              uom_id: line.uom_id,
              is_critical: line.is_critical,
              notes: line.notes
            });
          }
          
          router.push(`/manufacturing/boms/${bomId.value}`);
        } else {
          // Create new BOM
          response = await BOMService.createBOM(apiData);
          router.push(`/manufacturing/boms/${response.data.bom_id}`);
        }
      } catch (error) {
        console.error('Error saving BOM:', error);
        
        // Handle validation errors from API
        if (error.response && error.response.status === 422) {
          errors.value = error.response.data.errors || {};
        }
      } finally {
        isSaving.value = false;
      }
    };
    
    onMounted(() => {
      fetchFormData();
    });
    
    return {
      isLoading,
      isSaving,
      isEditMode,
      bomId,
      formData,
      items,
      componentItems,
      unitOfMeasures,
      errors,
      lineErrors,
      addBOMLine,
      updateBOMLine,
      removeBOMLine,
      saveBOM
    };
  }
};
</script>

<style scoped>
.bom-form-container {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  color: var(--primary-color);
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-800);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--box-shadow);
}

.loading-spinner {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--gray-800);
}

.bom-lines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: 1.5rem;
}

.p-0 {
  padding: 0 !important;
}

.mt-4 {
  margin-top: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--gray-700);
  font-size: 0.875rem;
}

input[type="text"],
input[type="number"],
input[type="date"],
select {
  padding: 0.625rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.is-invalid {
  border-color: var(--danger-color) !important;
}

.invalid-feedback {
  color: var(--danger-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.bom-lines-table {
  width: 100%;
  border-collapse: collapse;
}

.bom-lines-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background-color: var(--gray-50);
  color: var(--gray-700);
  font-weight: 500;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--gray-200);
}

.bom-lines-table td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.bom-lines-table tr:last-child td {
  border-bottom: none;
}

.bom-lines-table input,
.bom-lines-table select {
  width: 100%;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-wrapper input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.empty-state {
  text-align: center;
  color: var(--gray-500);
  padding: 2rem;
  font-style: italic;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.delete-btn {
  color: var(--danger-color);
}

.delete-btn:hover {
  background-color: var(--danger-bg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .bom-lines-table {
    display: block;
    overflow-x: auto;
  }
}
</style>