<!-- src/components/manufacturing/BOMLineItem.vue -->
<template>
    <tr class="bom-line-item">
      <td>
        <select 
          v-model="lineData.item_id" 
          required
          :class="{ 'is-invalid': errors.item_id }"
          @change="updateLine"
        >
          <option value="">-- Select Item --</option>
          <option v-for="item in items" :key="item.item_id" :value="item.item_id">
            {{ item.name }} ({{ item.item_code }})
          </option>
        </select>
        <div v-if="errors.item_id" class="invalid-feedback">{{ errors.item_id }}</div>
      </td>
      <td>
        <input 
          type="number" 
          v-model="lineData.quantity" 
          required
          min="0.01"
          step="0.01"
          :class="{ 'is-invalid': errors.quantity }"
          @input="updateLine"
        />
        <div v-if="errors.quantity" class="invalid-feedback">{{ errors.quantity }}</div>
      </td>
      <td>
        <select 
          v-model="lineData.uom_id" 
          required
          :class="{ 'is-invalid': errors.uom_id }"
          @change="updateLine"
        >
          <option value="">-- Select UOM --</option>
          <option v-for="uom in unitOfMeasures" :key="uom.uom_id" :value="uom.uom_id">
            {{ uom.name }} ({{ uom.symbol }})
          </option>
        </select>
        <div v-if="errors.uom_id" class="invalid-feedback">{{ errors.uom_id }}</div>
      </td>
      <td>
        <div class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :id="'is_critical_' + lineIndex" 
            v-model="lineData.is_critical" 
            @change="updateLine"
          />
          <label :for="'is_critical_' + lineIndex" class="checkbox-label"></label>
        </div>
      </td>
      <td>
        <input 
          type="text" 
          v-model="lineData.notes" 
          placeholder="Optional notes"
          @input="updateLine"
        />
      </td>
      <td>
        <button type="button" class="action-btn delete-btn" @click="$emit('remove')" title="Remove Line">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  </template>
  
  <script>
  import { reactive, toRefs, watch } from 'vue';
  
  export default {
    name: 'BOMLineItem',
    props: {
      line: {
        type: Object,
        required: true
      },
      lineIndex: {
        type: Number,
        required: true
      },
      items: {
        type: Array,
        required: true
      },
      unitOfMeasures: {
        type: Array,
        required: true
      },
      validationErrors: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ['update', 'remove'],
    setup(props, { emit }) {
      // Create a local reactive copy of the line data
      const lineData = reactive({
        ...props.line
      });
      
      // Local errors
      const errors = reactive({});
      
      // Watch for external validation errors
      watch(() => props.validationErrors, (newErrors) => {
        Object.assign(errors, newErrors);
      }, { deep: true });
      
      // Update parent when line data changes
      const updateLine = () => {
        emit('update', {
          index: props.lineIndex,
          line: {
            ...lineData
          }
        });
      };
      
      // Watch for props changes to update local data
      watch(() => props.line, (newLine) => {
        Object.assign(lineData, newLine);
      }, { deep: true });
      
      return {
        ...toRefs(lineData),
        lineData,
        errors,
        updateLine
      };
    }
  };
  </script>
  
  <style scoped>
  .bom-line-item td {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--gray-100);
  }
  
  select,
  input[type="text"],
  input[type="number"] {
    width: 100%;
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
  </style>