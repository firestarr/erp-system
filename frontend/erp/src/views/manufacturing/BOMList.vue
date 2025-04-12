<!-- src/views/manufacturing/BOMList.vue -->
<template>
  <div class="bom-list">
    <div class="page-header">
      <h1>Bills of Materials</h1>
      <button class="btn btn-primary" @click="openCreateIntegratedModal">
        <i class="fas fa-plus"></i> Create New BOM
      </button>
    </div>

    <!-- Search and Filter -->
    <SearchFilter
      v-model:value="searchQuery"
      placeholder="Search BOMs..."
      @search="applyFilters"
      @clear="clearSearch"
    >
      <template #filters>
        <div class="filter-group">
          <label for="statusFilter">Status</label>
          <select id="statusFilter" v-model="filters.status" @change="applyFilters">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Obsolete">Obsolete</option>
          </select>
        </div>
      </template>
    </SearchFilter>

    <!-- DataTable -->
    <DataTable
      :columns="columns"
      :items="filteredBOMs"
      :is-loading="isLoading"
      keyField="bom_id"
      emptyIcon="fas fa-clipboard-list"
      emptyTitle="No BOMs found"
      emptyMessage="No BOMs match your search criteria or no BOMs have been created yet."
      @sort="handleSort"
    >
      <template #status="{ value }">
        <span class="status-badge" :class="getStatusClass(value)">
          {{ value }}
        </span>
      </template>

      <template #date="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #actions="{ item }">
        <button class="action-btn" title="View BOM Details" @click="viewBOM(item)">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn" title="Edit BOM" @click="editBOMIntegrated(item)">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn" title="Delete BOM" @click="confirmDelete(item)">
          <i class="fas fa-trash"></i>
        </button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <PaginationComponent
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :from="(currentPage - 1) * perPage + 1"
      :to="Math.min(currentPage * perPage, totalItems)"
      :total="totalItems"
      @page-changed="changePage"
    />

    <!-- Integrated BOM Form Modal -->
    <IntegratedBOMForm
      v-if="showIntegratedBOMModal"
      :is-edit-mode="isEditMode"
      :bom-data="currentBOM"
      :is-submitting="isSubmitting"
      @close="closeIntegratedBOMModal"
      @save="saveIntegratedBOM"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      title="Confirm Delete"
      :message="`Are you sure you want to delete BOM <strong>${bomToDelete.bom_code}</strong>?<br>This action cannot be undone.`"
      confirm-button-text="Delete"
      confirm-button-class="btn btn-danger"
      @confirm="deleteBOM"
      @close="closeDeleteModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import BOMService from '@/services/BOMService';
import IntegratedBOMForm from '@/components/manufacturing/IntegratedBOMForm.vue';
import DataTable from '@/components/common/DataTable.vue';

export default {
  name: 'BOMList',
  components: {
    IntegratedBOMForm,
    DataTable
  },
  setup() {
    const router = useRouter();
    const boms = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const sortKey = ref('bom_code');
    const sortOrder = ref('asc');
    const currentPage = ref(1);
    const perPage = ref(10);
    const totalItems = ref(0);
    const totalPages = ref(1);
    const isSubmitting = ref(false);

    const filters = reactive({
      status: ''
    });

    // Modals
    const showIntegratedBOMModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditMode = ref(false);
    const currentBOM = ref({});
    const bomToDelete = ref({});

    // Table columns
    const columns = ref([
      { key: 'bom_code', label: 'BOM Code', sortable: true },
      { key: 'item.name', label: 'Product', sortable: true },
      { key: 'revision', label: 'Revision', sortable: true },
      { key: 'effective_date', label: 'Effective Date', sortable: true, template: 'date' },
      { key: 'status', label: 'Status', sortable: true, template: 'status' },
    ]);

    const fetchBOMs = async () => {
      isLoading.value = true;
      try {
        const params = {
          page: currentPage.value,
          per_page: perPage.value,
          sort_by: sortKey.value,
          sort_order: sortOrder.value,
          search: searchQuery.value,
          status: filters.status
        };
        
        const result = await BOMService.getBOMs(params);
        
        // Check if the API returns data in the expected format
        if (result.data) {
          boms.value = result.data;
          // Check if pagination metadata is available
          if (result.meta) {
            totalItems.value = result.meta.total || boms.value.length;
            totalPages.value = result.meta.last_page || Math.ceil(totalItems.value / perPage.value);
          } else {
            // If no metadata, assume all items are returned
            totalItems.value = boms.value.length;
            totalPages.value = 1;
          }
        } else {
          boms.value = [];
          totalItems.value = 0;
          totalPages.value = 1;
        }
      } catch (error) {
        console.error('Error fetching BOMs:', error);
        boms.value = [];
        totalItems.value = 0;
        totalPages.value = 1;
      } finally {
        isLoading.value = false;
      }
    };
    
    // Computed properties
    const filteredBOMs = computed(() => {
      return boms.value;
    });

    // Methods for handling BOM operations
    const openCreateIntegratedModal = () => {
      isEditMode.value = false;
      currentBOM.value = {
        item_id: '',
        bom_code: '',
        revision: '1.0',
        effective_date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        standard_quantity: 1,
        uom_id: '',
        bomLines: []
      };
      showIntegratedBOMModal.value = true;
    };

    const editBOMIntegrated = async (bom) => {
      isEditMode.value = true;
      isLoading.value = true;
      
      try {
        // Fetch complete BOM data including lines
        const response = await BOMService.getBOMById(bom.bom_id);
        const bomData = response.data;
        
        // Also fetch BOM lines for editing
        const linesResponse = await BOMService.getBOMLines(bom.bom_id);
        bomData.bomLines = linesResponse.data || [];
        
        currentBOM.value = bomData;
        showIntegratedBOMModal.value = true;
      } catch (error) {
        console.error('Error fetching BOM details:', error);
        alert('Failed to load BOM details for editing. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };

    const closeIntegratedBOMModal = () => {
      showIntegratedBOMModal.value = false;
    };

    const saveIntegratedBOM = async (bomData) => {
      isSubmitting.value = true;
      
      try {
        if (isEditMode.value) {
          // Update existing BOM header
          await BOMService.updateBOM(bomData.bom_id, {
            item_id: bomData.item_id,
            bom_code: bomData.bom_code,
            revision: bomData.revision,
            effective_date: bomData.effective_date,
            status: bomData.status,
            standard_quantity: bomData.standard_quantity,
            uom_id: bomData.uom_id
          });
          
          // Handle BOM lines - update, delete, or create as needed
          const existingLines = await BOMService.getBOMLines(bomData.bom_id);
          const existingLineIds = existingLines.data.map(line => line.line_id);
          
          // Update or create BOM lines
          for (const line of bomData.bomLines) {
            if (line.line_id) {
              // Update existing line
              await BOMService.updateBOMLine(bomData.bom_id, line.line_id, {
                item_id: line.item_id,
                quantity: line.quantity,
                uom_id: line.uom_id,
                is_critical: line.is_critical,
                notes: line.notes
              });
            } else {
              // Create new line
              await BOMService.createBOMLine(bomData.bom_id, {
                item_id: line.item_id,
                quantity: line.quantity,
                uom_id: line.uom_id,
                is_critical: line.is_critical,
                notes: line.notes
              });
            }
          }
          
          // Get submitted line IDs to identify deleted lines
          const submittedLineIds = bomData.bomLines
            .filter(line => line.line_id)
            .map(line => line.line_id);
          
          // Delete lines that were removed in the form
          for (const existingId of existingLineIds) {
            if (!submittedLineIds.includes(existingId)) {
              await BOMService.deleteBOMLine(bomData.bom_id, existingId);
            }
          }
        } else {
          // Create new BOM with lines
          const bomHeader = {
            item_id: bomData.item_id,
            bom_code: bomData.bom_code,
            revision: bomData.revision,
            effective_date: bomData.effective_date,
            status: bomData.status,
            standard_quantity: bomData.standard_quantity,
            uom_id: bomData.uom_id,
            bomLines: bomData.bomLines
          };
          
          await BOMService.createBOM(bomHeader);
        }
        
        // Refresh the list after saving
        fetchBOMs();
        closeIntegratedBOMModal();
      } catch (error) {
        console.error('Error saving BOM:', error);
        alert('Failed to save BOM. Please try again.');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // Methods for filter, sort, pagination
    const applyFilters = () => {
      currentPage.value = 1;
      fetchBOMs();
    };

    const clearSearch = () => {
      searchQuery.value = '';
      applyFilters();
    };

    const handleSort = ({ key, order }) => {
      sortKey.value = key;
      sortOrder.value = order;
      fetchBOMs();
    };

    const changePage = (page) => {
      currentPage.value = page;
      fetchBOMs();
    };

    // Navigation and Delete methods
    const viewBOM = (bom) => {
      router.push(`/manufacturing/boms/${bom.bom_id}`);
    };

    const confirmDelete = (bom) => {
      bomToDelete.value = bom;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
    };

    const deleteBOM = async () => {
      try {
        await BOMService.deleteBOM(bomToDelete.value.bom_id);
        // Refresh the list after deleting
        fetchBOMs();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting BOM:', error);
        alert('Failed to delete BOM. It may be in use or you may not have permission.');
        closeDeleteModal();
      }
    };

    // Helper methods
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'Active':
          return 'status-active';
        case 'Draft':
          return 'status-draft';
        case 'Obsolete':
          return 'status-obsolete';
        default:
          return '';
      }
    };

    onMounted(() => {
      fetchBOMs();
    });

    return {
      boms,
      columns,
      isLoading,
      isSubmitting,
      searchQuery,
      filters,
      filteredBOMs,
      currentPage,
      perPage,
      totalItems,
      totalPages,
      showIntegratedBOMModal,
      showDeleteModal,
      isEditMode,
      currentBOM,
      bomToDelete,
      openCreateIntegratedModal,
      editBOMIntegrated,
      closeIntegratedBOMModal,
      saveIntegratedBOM,
      applyFilters,
      clearSearch,
      handleSort,
      changePage,
      formatDate,
      getStatusClass,
      viewBOM,
      confirmDelete,
      closeDeleteModal,
      deleteBOM
    };
  }
};
</script>

<style scoped>
.bom-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-800);
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
  background-color: var(--warning-bg);
  color: var(--warning-color);
}

.status-obsolete {
  background-color: var(--danger-bg);
  color: var(--danger-color);
}

.action-btn {
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: var(--gray-100);
  color: var(--gray-700);
}
</style>