<template>
  <div class="protein-search-page">
    <Header />
    
    <main>
      <!-- 顶部标题区域 -->
      <div class="search-heading-container">
        <h1 class="search-heading">Protein search</h1>
      </div>
      
      <!-- 搜索区域 -->
      <div class="search-container">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search proteins..." 
            class="search-input"
            @input="filterResults"
          />
          <button class="search-button" @click="handleSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="results-container">
        <div class="table-container">
          <div class="table-header">
            <h2>Protein List</h2>
            <div class="results-count">
              Total: {{ filteredData.length }} proteins
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th @click="sortTable('clade')">Clade <span class="sort-icon">⇅</span></th>
                <th @click="sortTable('order')">Order <span class="sort-icon">⇅</span></th>
                <th @click="sortTable('family')">Family <span class="sort-icon">⇅</span></th>
                <th @click="sortTable('species')">Species <span class="sort-icon">⇅</span></th>
                <th @click="sortTable('more')">Download <span class="sort-icon">⇅</span></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(protein, index) in paginatedData" 
                :key="index"
                :class="{ 'even-row': index % 2 === 1 }"
              >
                <td>{{ protein.clade }}</td>
                <td>{{ protein.order }}</td>
                <td>{{ protein.family }}</td>
                <td>{{ protein.species }}</td>
                <td class="download-cell">
                  <a href="#" @click.prevent="handleDownload(protein)" class="download-link">
                    <span class="download-icon">⬇</span> Download
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 分页控件 -->
          <div class="pagination">
            <span>
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
              {{ Math.min(currentPage * itemsPerPage, filteredData.length) }} 
              of {{ filteredData.length }} proteins
            </span>
            <div class="page-controls">
              <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">«</button>
              <button 
                v-for="page in pageButtons" 
                :key="page" 
                class="page-btn" 
                :class="{ 'active': currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">»</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

// 搜索相关
const searchQuery = ref('')

// 分页相关
const currentPage = ref(1)
const itemsPerPage = 10

// 模拟数据 - 增加更多示例数据
const proteins = ref([
  { clade: 'Core Eudicots/Rosids', order: 'Fabales', family: 'Fabaceae', species: 'Glycine max', more: 'Download' },
  { clade: 'Core Eudicots/Rosids', order: 'Rosales', family: 'Rosaceae', species: 'Malus domestica', more: 'Download' },
  { clade: 'Core Eudicots/Asterids', order: 'Solanales', family: 'Solanaceae', species: 'Solanum lycopersicum', more: 'Download' },
  { clade: 'Monocots', order: 'Poales', family: 'Poaceae', species: 'Oryza sativa', more: 'Download' },
  { clade: 'Core Eudicots', order: 'Brassicales', family: 'Brassicaceae', species: 'Arabidopsis thaliana', more: 'Download' },
  // ... 更多数据
])

// 过滤数据
const filteredData = computed(() => {
  if (!searchQuery.value) return proteins.value
  const query = searchQuery.value.toLowerCase()
  return proteins.value.filter(protein => 
    Object.values(protein).some(value => 
      value.toString().toLowerCase().includes(query)
    )
  )
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
})

// 总页数
const totalPages = computed(() => 
  Math.ceil(filteredData.value.length / itemsPerPage)
)

// 页码按钮
const pageButtons = computed(() => {
  const buttons = []
  const maxButtons = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2))
  let end = Math.min(totalPages.value, start + maxButtons - 1)
  
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1)
  }
  
  for (let i = start; i <= end; i++) {
    buttons.push(i)
  }
  
  return buttons
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理下载
const handleDownload = (protein: any) => {
  console.log('Downloading:', protein)
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// 表格排序
const sortTable = (column: string) => {
  console.log('Sorting by:', column)
}

// 过滤结果
const filterResults = () => {
  currentPage.value = 1  // 重置到第一页
}
</script>

<style scoped>
.protein-search-page {
  min-height: 100vh;
  background-image: linear-gradient(20deg, #fafafa, #abdfcb, #86c1bd, #e6f8f1, #faf5f0, #ffffff);
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 标题样式 */
.search-heading-container {
  text-align: center;
  margin-bottom: 40px;
}

.search-heading {
  font-size: 36px;
  color: #2d584b;
  margin: 0;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* 搜索框样式 */
.search-container {
  max-width: 800px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.search-box {
  display: flex;
  background: white;
  border-radius: 50px;
  padding: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #448870;
  transition: all 0.3s ease;
}

.search-input {
  flex: 1;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  outline: none;
  background: transparent;
}

.search-button {
  background: #448870;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button svg {
  color: white;
}

.search-button:hover {
  background: #2d584b;
  transform: scale(1.05);
}

/* 表格容器样式 */
.results-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
  transition: all 0.3s ease;
}

.table-container {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
  border-spacing: 0;
}

th, td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2d584b;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

th:hover {
  background-color: #f8f9fa;
}

.sort-icon {
  font-size: 12px;
  margin-left: 5px;
}

.even-row {
  background-color: #f8f9fa;
}

/* 下载链接样式 */
.download-link {
  color: #448870;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.download-link:hover {
  background: #448870;
  color: white;
  transform: translateY(-1px);
}

/* 分页样式 */
.pagination {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-controls {
  display: flex;
  gap: 5px;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 12px;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn.active {
  background: #448870;
  color: white;
}

.page-btn:hover:not(:disabled) {
  background: #2d584b;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-input {
    font-size: 16px;
  }
  
  .pagination {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  th, td {
    padding: 10px;
  }
}

/* 新增和优化的样式 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e6f8f1;
}

.table-header h2 {
  color: #2d584b;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
}

.results-count {
  color: #666;
  font-size: 16px;
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #e6f8f1;
}
</style> 