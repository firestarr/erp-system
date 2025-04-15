<!-- src/components/manufacturing/BOMViewer.vue -->
<template>
    <div class="bom-viewer">
      <!-- BOM Header Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            {{ bom.bom_code }}
            <span class="bom-revision">Rev. {{ bom.revision }}</span>
            <span :class="['status-badge', getStatusClass(bom.status)]">{{ bom.status }}</span>
          </h2>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-group">
              <h3 class="info-title">Product Information</h3>
              <div class="info-content">
                <div class="info-item">
                  <span class="info-label">Item Code</span>
                  <span class="info-value">{{ bom.item?.item_code || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Item Name</span>
                  <span class="info-value">{{ bom.item?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Category</span>
                  <span class="info-value">{{ bom.item?.category?.name || 'N/A' }}</span>
                </div>
              </div>
            </div>
  
            <div class="info-group">
              <h3 class="info-title">BOM Information</h3>
              <div class="info-content">
                <div class="info-item">
                  <span class="info-label">Effective Date</span>
                  <span class="info-value">{{ formatDate(bom.effective_date) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Standard Quantity</span>
                  <span class="info-value">{{ bom.standard_quantity }} {{ bom.unitOfMeasure?.symbol || '' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">UOM</span>
                  <span class="info-value">{{ bom.unitOfMeasure?.name || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- BOM Line Items -->
      <div class="card mt-4">
        <div class="card-header">
          <h2 class="card-title">Components</h2>
          <div v-if="editable" class="header-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('add-component')">
              <i class="fas fa-plus"></i> Add Component
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <table class="bom-lines-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>UOM</th>
                <th>Critical</th>
                <th v-if="showNotes">Notes</th>
                <th v-if="editable">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!bom.bomLines || bom.bomLines.length === 0">
                <td :colspan="editable ? 7 : (showNotes ? 6 : 5)" class="empty-state">
                  No components have been added to this BOM.
                </td>
              </tr>
              <tr v-for="line in bom.bomLines" :key="line.line_id">
                <td>{{ line.item?.item_code || 'N/A' }}</td>
                <td>{{ line.item?.name || 'N/A' }}</td>
                <td>{{ line.quantity }}</td>
                <td>{{ line.unitOfMeasure?.symbol || 'N/A' }}</td>
                <td>
                  <span v-if="line.is_critical" class="critical-badge">
                    <i class="fas fa-exclamation-circle"></i> Critical
                  </span>
                  <span v-else>No</span>
                </td>
                <td v-if="showNotes">{{ line.notes || '-' }}</td>
                <td v-if="editable">
                  <div class="actions">
                    <button 
                      type="button" 
                      class="action-btn edit-btn" 
                      @click="$emit('edit-component', line)" 
                      title="Edit Component"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      type="button" 
                      class="action-btn delete-btn" 
                      @click="$emit('remove-component', line)" 
                      title="Remove Component"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Optional additional content slot -->
      <slot></slot>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BOMViewer',
    props: {
      bom: {
        type: Object,
        required: true
      },
      editable: {
        type: Boolean,
        default: false
      },
      showNotes: {
        type: Boolean,
        default: true
      }
    },
    emits: ['add-component', 'edit-component', 'remove-component'],
    setup() {
      const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      };
  
      const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
          case 'active':
            return 'status-active';
          case 'draft':
            return 'status-draft';
          case 'obsolete':
            return 'status-obsolete';
          default:
            return '';
        }
      };
  
      return {
        formatDate,
        getStatusClass
      };
    }
  };
  </script>
  
  <style scoped>
  .bom-viewer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-title {
    margin: 0;
    font-size: 1.25rem;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .bom-revision {
    font-size: 0.875rem;
    color: var(--gray-500);
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
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .info-group {
    display: flex;
    flex-direction: column;
  }
  
  .info-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--gray-700);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .info-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-item {
    display: flex;
    align-items: flex-start;
  }
  
  .info-label {
    flex: 0 0 40%;
    color: var(--gray-600);
    font-size: 0.875rem;
  }
  
  .info-value {
    flex: 1;
    color: var(--gray-800);
    font-weight: 500;
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
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-800);
  }
  
  .bom-lines-table tr:last-child td {
    border-bottom: none;
  }
  
  .empty-state {
    text-align: center;
    color: var(--gray-500);
    padding: 2rem;
    font-style: italic;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-active {
    background-color: var(--success-bg);
    color: var(--success-color);
  }
  
  .status-draft {
    background-color: var(--gray-100);
    color: var(--gray-700);
  }
  
  .status-obsolete {
    background-color: var(--danger-bg);
    color: var(--danger-color);
  }
  
  .critical-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--warning-bg);
    color: var(--warning-color);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
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
  
  .edit-btn {
    color: var(--warning-color);
  }
  
  .edit-btn:hover {
    background-color: var(--warning-bg);
  }
  
  .delete-btn {
    color: var(--danger-color);
  }
  
  .delete-btn:hover {
    background-color: var(--danger-bg);
  }
  
  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .bom-lines-table {
      display: block;
      overflow-x: auto;
    }
  }
  </style>