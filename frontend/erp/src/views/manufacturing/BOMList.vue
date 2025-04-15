<!-- src/views/manufacturing/BOMList.vue -->
<template>
  <div class="bom-list-container">
    <div class="page-header">
      <h1>Bills of Materials</h1>
      <button @click="openCreateForm" class="btn btn-primary">
        <i class="fas fa-plus"></i> Create BOM
      </button>
    </div>

    <div class="bom-filters">
      <SearchFilter
        v-model:value="searchQuery"
        placeholder="Search BOMs..."
        @search="fetchBOMs"
        @clear="clearSearch"
      >
        <template v-slot:filters>
          <div class="filter-group">
            <label for="status-filter">Status</label>
            <select id="status-filter" v-model="filters.status" @change="fetchBOMs">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Obsolete">Obsolete</option>
            </select>
          </div>
        </template>
      </SearchFilter>
    </div>

    <div class="table-container">
      <DataTable
        :columns="columns"
        :items="boms"
        :is-loading="isLoading"
        :key-field="'bom_id'"
        :initial-sort-key="'bom_code'"
        :initial-sort-order="'asc'"
        :empty-title="'No BOMs Found'"
        :empty-message="'Try adjusting your search or filters, or create a new BOM.'"
        @sort="handleSort"
      >
        <template v-slot:item_name="{ value, item }">
          <span class="item-name">{{ value }}</span>
          <span class="item-code" v-if="item.item">({{ item.item.item_code }})</span>
        </template>

        <template v-slot:effective_date="{ value }">
          {{ formatDate(value) }}
        </template>

        <template v-slot:status="{ value }">
          <span :class="['status-badge', getStatusClass(value)]">{{ value }}</span>
        </template>

        <template v-slot:actions="{ item }">
          <div class="table-actions">
            <button @click="viewBOM(item)" class="action-btn view-btn" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="editBOM(item)" class="action-btn edit-btn" title="Edit BOM">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="confirmDelete(item)" class="action-btn delete-btn" title="Delete BOM">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </template>
      </DataTable>

      <div v-if="totalPages > 1" class="pagination-container">
        <PaginationComponent
          :current-page="currentPage"
          :total-pages="totalPages"
          :from="paginationFrom"
          :to="paginationTo"
          :total="totalBOMs"
          @page-changed="changePage"
        />
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      :title="'Delete BOM'"
      :message="'Are you sure you want to delete the BOM <strong>' + (selectedBOM?.bom_code || '') + '</strong>? This action cannot be undone.'"
      :confirm-button-text="'Delete'"
      :confirm-button-class="'btn btn-danger'"
      @confirm="deleteBOM"
      @close="closeDeleteModal"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import DataTable from '@/components/common/DataTable.vue';

export default {
  name: 'BOMList',
  components: {
    DataTable
  },
  setup() {
    const router = useRouter();
    const boms = ref([]);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalBOMs = ref(0);
    const itemsPerPage = ref(10);
    const searchQuery = ref('');
    const filters = reactive({
      status: ''
    });
    const sortKey = ref('bom_code');
    const sortOrder = ref('asc');
    const showDeleteModal = ref(false);
    const selectedBOM = ref(null);

    // Table columns definition
    const columns = [
      { key: 'bom_code', label: 'BOM Code', sortable: true },
      { key: 'item.name', label: 'Item', sortable: true, template: 'item_name' },
      { key: 'revision', label: 'Revision', sortable: true },
      { key: 'effective_date', label: 'Effective Date', sortable: true, template: 'effective_date' },
      { key: 'status', label: 'Status', sortable: true, template: 'status' }
    ];

    // Computed pagination values
    const paginationFrom = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1;
    });

    const paginationTo = computed(() => {
      return Math.min(currentPage.value * itemsPerPage.value, totalBOMs.value);
    });

    // Fetch BOMs from API
    const fetchBOMs = async () => {
      isLoading.value = true;
      try {
        const params = {
          page: currentPage.value,
          per_page: itemsPerPage.value,
          search: searchQuery.value,
          status: filters.status,
          sort_field: sortKey.value,
          sort_order: sortOrder.value
        };

        const response = await api.get('/manufacturing/boms', { params });
        
        if (response.data && response.data.data) {
          boms.value = response.data.data;
          
          if (response.data.meta) {
            totalBOMs.value = response.data.meta.total || 0;
            totalPages.value = response.data.meta.last_page || 1;
            currentPage.value = response.data.meta.current_page || 1;
          }
        }
      } catch (error) {
        console.error('Error fetching BOMs:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const clearSearch = () => {
      searchQuery.value = '';
      fetchBOMs();
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

    const formatDate = (dateString) => {
      if (!dateString) return '';
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

    const viewBOM = (bom) => {
      router.push(`/manufacturing/boms/${bom.bom_id}`);
    };

    const editBOM = (bom) => {
      router.push(`/manufacturing/boms/${bom.bom_id}/edit`);
    };

    const openCreateForm = () => {
      router.push('/manufacturing/boms/create');
    };

    const confirmDelete = (bom) => {
      selectedBOM.value = bom;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedBOM.value = null;
    };

    const deleteBOM = async () => {
      if (!selectedBOM.value) return;
      
      try {
        await api.delete(`/manufacturing/boms/${selectedBOM.value.bom_id}`);
        fetchBOMs();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting BOM:', error);
      }
    };

    onMounted(() => {
      fetchBOMs();
    });

    return {
      boms,
      isLoading,
      columns,
      currentPage,
      totalPages,
      totalBOMs,
      paginationFrom,
      paginationTo,
      searchQuery,
      filters,
      showDeleteModal,
      selectedBOM,
      fetchBOMs,
      clearSearch,
      handleSort,
      changePage,
      formatDate,
      getStatusClass,
      viewBOM,
      editBOM,
      openCreateForm,
      confirmDelete,
      closeDeleteModal,
      deleteBOM
    };
  }
};
</script>

<style scoped>
.bom-list-container {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-800);
}

.bom-filters {
  margin-bottom: 1.5rem;
}

.table-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.pagination-container {
  padding: 0.5rem;
  background-color: white;
  border-top: 1px solid var(--gray-200);
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  color: var(--primary-color);
}

.view-btn:hover {
  background-color: var(--primary-bg);
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

.item-name {
  font-weight: 500;
}

.item-code {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-left: 0.25rem;
}
</style>