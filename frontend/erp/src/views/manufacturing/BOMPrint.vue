<!-- src/views/manufacturing/BOMPrint.vue -->
<template>
  <div class="bom-print-container">
    <div class="print-actions">
      <button @click="printBOM" class="btn btn-primary">
        <i class="fas fa-print"></i> Print BOM
      </button>
      <router-link :to="`/manufacturing/boms/${id}`" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Back to BOM Details
      </router-link>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading BOM data...</p>
    </div>

    <div v-else-if="!bom" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2>BOM Not Found</h2>
      <p>The requested BOM could not be found or may have been deleted.</p>
      <router-link to="/manufacturing/boms" class="btn btn-primary">
        Return to BOM List
      </router-link>
    </div>

    <div v-else ref="printable" class="printable-content">
      <!-- Print Header -->
      <div class="print-header">
        <div class="company-info">
          <h1>Bill of Materials</h1>
          <p>Company Name, Inc.</p>
        </div>
        <div class="print-metadata">
          <div class="metadata-item">
            <span class="metadata-label">Date Printed:</span>
            <span class="metadata-value">{{ formatDate(new Date()) }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">BOM Code:</span>
            <span class="metadata-value">{{ bom.bom_code }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Revision:</span>
            <span class="metadata-value">{{ bom.revision }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Status:</span>
            <span class="metadata-value">{{ bom.status }}</span>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="print-section">
        <h2>Product Information</h2>
        <div class="product-info">
          <div class="info-row">
            <div class="info-col">
              <span class="info-label">Item Code:</span>
              <span class="info-value">{{ bom.item?.item_code || 'N/A' }}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Item Name:</span>
              <span class="info-value">{{ bom.item?.name || 'N/A' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-col">
              <span class="info-label">Category:</span>
              <span class="info-value">{{ bom.item?.category?.name || 'N/A' }}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Standard Quantity:</span>
              <span class="info-value">{{ bom.standard_quantity }} {{ bom.unitOfMeasure?.symbol || '' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-col">
              <span class="info-label">Effective Date:</span>
              <span class="info-value">{{ formatDate(bom.effective_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BOM Components Table -->
      <div class="print-section">
        <h2>Components</h2>
        <table class="components-table">
          <thead>
            <tr>
              <th class="col-item-code">Item Code</th>
              <th class="col-item-name">Item Name</th>
              <th class="col-quantity">Quantity</th>
              <th class="col-uom">UOM</th>
              <th class="col-critical">Critical</th>
              <th class="col-notes">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!bom.bomLines || bom.bomLines.length === 0">
              <td colspan="6" class="empty-state">No components have been added to this BOM.</td>
            </tr>
            <tr v-for="line in bom.bomLines" :key="line.line_id">
              <td>{{ line.item?.item_code || 'N/A' }}</td>
              <td>{{ line.item?.name || 'N/A' }}</td>
              <td>{{ line.quantity }}</td>
              <td>{{ line.unitOfMeasure?.symbol || 'N/A' }}</td>
              <td>
                <span v-if="line.is_critical" class="critical-tag">Yes</span>
                <span v-else>No</span>
              </td>
              <td>{{ line.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures Section -->
      <div class="print-section signatures">
        <div class="signature-row">
          <div class="signature-block">
            <p class="signature-label">Prepared By:</p>
            <div class="signature-line"></div>
            <p class="signature-name">Name and Position</p>
            <p class="signature-date">Date: ________________</p>
          </div>
          <div class="signature-block">
            <p class="signature-label">Reviewed By:</p>
            <div class="signature-line"></div>
            <p class="signature-name">Name and Position</p>
            <p class="signature-date">Date: ________________</p>
          </div>
          <div class="signature-block">
            <p class="signature-label">Approved By:</p>
            <div class="signature-line"></div>
            <p class="signature-name">Name and Position</p>
            <p class="signature-date">Date: ________________</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="print-footer">
        <p>Document ID: BOM-{{ bom.bom_code }}-REV{{ bom.revision }}</p>
        <p>This document is confidential and property of Company Name, Inc.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BOMService from '@/services/BOMService';

export default {
  name: 'BOMPrint',
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const bom = ref(null);
    const isLoading = ref(true);
    const printable = ref(null);

    const fetchBOMDetails = async () => {
      isLoading.value = true;
      try {
        const response = await BOMService.getBOMById(props.id);
        bom.value = response.data;
      } catch (error) {
        console.error('Error fetching BOM details:', error);
        bom.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      });
    };

    const printBOM = () => {
      const printContent = printable.value.innerHTML;
      const originalContent = document.body.innerHTML;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Add print-specific styles
      printWindow.document.write(`
        <html>
          <head>
            <title>BOM: ${bom.value?.bom_code || ''}</title>
            <style>
              @media print {
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                }
                
                h1, h2 {
                  color: #2563eb;
                }
                
                h1 {
                  font-size: 24px;
                  margin-bottom: 10px;
                }
                
                h2 {
                  font-size: 18px;
                  margin-top: 20px;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 5px;
                }
                
                p {
                  margin: 5px 0;
                }
                
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 10px 0;
                }
                
                th, td {
                  border: 1px solid #e2e8f0;
                  padding: 8px;
                  text-align: left;
                }
                
                th {
                  background-color: #f8fafc;
                  font-weight: bold;
                }
                
                .critical-tag {
                  color: #dc2626;
                  font-weight: bold;
                }
                
                .print-header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                
                .company-info, .print-metadata {
                  max-width: 50%;
                }
                
                .metadata-item {
                  margin-bottom: 5px;
                }
                
                .metadata-label {
                  font-weight: bold;
                  margin-right: 5px;
                }
                
                .info-row {
                  display: flex;
                  margin-bottom: 10px;
                }
                
                .info-col {
                  width: 50%;
                }
                
                .info-label {
                  font-weight: bold;
                  margin-right: 5px;
                }
                
                .signatures {
                  margin-top: 50px;
                }
                
                .signature-row {
                  display: flex;
                  justify-content: space-between;
                }
                
                .signature-block {
                  width: 30%;
                }
                
                .signature-line {
                  border-bottom: 1px solid #333;
                  margin: 20px 0 10px 0;
                }
                
                .signature-name, .signature-date {
                  margin: 5px 0;
                }
                
                .print-footer {
                  margin-top: 50px;
                  font-size: 12px;
                  text-align: center;
                  border-top: 1px solid #e2e8f0;
                  padding-top: 10px;
                }
                
                .empty-state {
                  text-align: center;
                  font-style: italic;
                  color: #64748b;
                  padding: 10px;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    };

    onMounted(() => {
      fetchBOMDetails();
    });

    return {
      bom,
      isLoading,
      printable,
      formatDate,
      printBOM
    };
  }
};
</script>

<style scoped>
.bom-print-container {
  padding: 1rem;
}

.print-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--box-shadow);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.printable-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--box-shadow);
}

.print-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.company-info h1 {
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
}

.company-info p {
  margin: 0;
  color: var(--gray-700);
}

.print-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metadata-item {
  display: flex;
  gap: 0.5rem;
}

.metadata-label {
  font-weight: 600;
  color: var(--gray-700);
}

.print-section {
  margin-bottom: 2rem;
}

.print-section h2 {
  color: var(--primary-color);
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
  padding-bottom: 0.5rem;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  gap: 2rem;
}

.info-col {
  flex: 1;
}

.info-label {
  font-weight: 600;
  color: var(--gray-700);
  margin-right: 0.5rem;
}

.components-table {
  width: 100%;
  border-collapse: collapse;
}

.components-table th,
.components-table td {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-200);
  text-align: left;
}

.components-table th {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
}

.col-item-code {
  width: 15%;
}

.col-item-name {
  width: 30%;
}

.col-quantity,
.col-uom,
.col-critical {
  width: 10%;
}

.col-notes {
  width: 25%;
}

.critical-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: var(--danger-bg);
  color: var(--danger-color);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--gray-500);
  font-style: italic;
}

.signatures {
  margin-top: 3rem;
}

.signature-row {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.signature-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.signature-label {
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.signature-line {
  border-bottom: 1px solid var(--gray-400);
  margin-bottom: 0.5rem;
  min-height: 2rem;
}

.signature-name,
.signature-date {
  margin: 0.25rem 0;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.print-footer {
  margin-top: 3rem;
  text-align: center;
  color: var(--gray-600);
  font-size: 0.875rem;
  border-top: 1px solid var(--gray-200);
  padding-top: 1rem;
}

.print-footer p {
  margin: 0.25rem 0;
}

/* Hiding print-only elements in screen view */
@media screen {
  .printable-content {
    max-width: 210mm; /* A4 width */
    margin: 0 auto;
  }
}

/* Media query for print */
@media print {
  .print-actions,
  .btn {
    display: none !important;
  }
  
  .bom-print-container {
    padding: 0;
  }
  
  .printable-content {
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
}
</style>