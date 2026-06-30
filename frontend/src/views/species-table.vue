<template>
  <div class="species-page">
    <!-- 添加过渡效果的Header -->
    <div class="header-wrapper">
      <Header />
    </div>
    
    <!-- 主体内容区 -->
    <main class="main-content-area">
      <div class="layout-row">
    
        <!-- ==================== 左侧分类栏 START ==================== -->
        <div class="layout-col-left">
          <div class="ui-card taxonomy-card">
            <div class="taxonomy-info-container" id="taxonomyContainer">
              <div class="taxonomy-info-header">
                <div class="taxonomy-info-title">Taxonomy</div>
              
                <div class="taxonomy-actions">
                  <!-- <button class="refresh-btn" @click="refreshAllSpeciesData" :disabled="isRefreshing">
                    <span class="refresh-icon" :class="{ 'refreshing': isRefreshing }">⟳</span>
                    {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
                  </button>
                  <button class="taxonomy-expand-btn" @click="toggleTaxonomyExpand">
                    <span class="expand-icon" :class="{ 'expanded': isTaxonomyExpanded }">▼</span>
                    {{ isTaxonomyExpanded ? 'Collapse' : 'Expand' }}
                  </button> -->
                </div>
                
              </div>
              <div class="species-search-bar-container">
                <input 
                  type="text" 
                  v-model="speciesSearchQuery"
                  @keyup.enter="handleSpeciesSearch"
                  placeholder="e.g., Oryza sativa" 
                  class="species-search-bar-input"
                >
                <button @click="handleSpeciesSearch" class="species-search-bar-button">Search</button>
              </div>

              <div class="taxonomy-info-grid" ref="taxonomyGridRef">
                <div
                  v-for="category in sortedCategories"
                  :key="category"
                  class="taxonomy-item"
                  @click="openModal(category)"
                >
                  <span class="taxonomy-label">{{ category }}</span>
                  <span class="taxonomy-count">
                    ({{ categorySpeciesMap[category] && categorySpeciesMap[category].length
                        ? categorySpeciesMap[category].length
                        : (categorySpeciesMap[category] ? 0 : '...') }})
                  </span>
                </div>
              </div>
              
            </div>
          </div> <!-- ✅ 修正点 1: 添加了缺少的 </div> 来闭合 .ui-card -->
        </div> <!-- ✅ 修正点 1: 添加了缺少的 </div> 来闭合 .layout-col-left -->
        <!-- ==================== 左侧分类栏 END ==================== -->

        <!-- ==================== 右侧内容区 START ==================== -->
        <div class="layout-col-right">
          <div class="ui-card content-card">
        
            <!-- A. 如果有物种被选中，则显示详情和表格 -->
            <template v-if="isSpeciesSelected">
              
              <!-- 物种详情区域 -->
              <div class="species-detail-container">
                <div v-if="isLoadingPlantInfo" class="detail-loading">
                  <span class="loading-spinner">⟳</span>
                  正在获取植物专业信息...
                </div>
                <div v-else-if="plantInfoError" class="detail-error">
                  ⚠️ {{ plantInfoError }}
                </div>
                <div v-else class="species-detail-content">
                  <div v-if="isSpeciesSelected" class="species-detail-image">
                    <img :src="plantDetails.imageUrl || '/src/assets/placeholder-image.png'" alt="Species Image" referrerpolicy="no-referrer">
                  </div>
                  <div v-if="isSpeciesSelected" class="species-detail-info">
                    <h2 class="species-detail-title">{{ plantDetails.canonicalName }}</h2>
                    <p class="species-detail-scientific-name">{{ plantDetails.scientificName }}</p>
                    <div class="species-detail-grid">
                      <div class="detail-property">Family</div>
                      <div class="detail-value">{{ plantDetails.family || 'N/A' }}</div>
                      <div class="detail-property">Order</div>
                      <div class="detail-value">{{ plantDetails.order || 'N/A' }}</div>
                      <div class="detail-property">Phylum</div>
                      <div class="detail-value">{{ plantDetails.phylum || 'N/A' }}</div>
                      <div class="detail-property">Kingdom</div>
                      <div class="detail-value">{{ plantDetails.kingdom || 'N/A' }}</div>
                      <div class="detail-property">GBIF Key</div>
                      <div class="detail-value">
                        <a :href="`https://www.gbif.org/species/${plantDetails.gbifKey}`" target="_blank">{{ plantDetails.gbifKey || 'N/A' }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- ✅ 修正点 2: 删除了这里多余的 </div> -->

              <!-- 物种信息区 -->
              <div class="content-container">
                <div class="export-container">
                  <button class="export-btn" @click="exportSpeciesData" :disabled="!hasSpeciesData">Export Excel</button>
                </div>
                <div class="content-title">{{ speciesParam.replace(/_/g, ' ') }}</div>
                <div v-if="!hasSpeciesData" class="species-error"></div>
                <div v-else class="species-info">
                  <table class="species-data-table">
                    <thead>
                      <tr>
                        <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in tableData" :key="index">
                        <td v-for="header in tableHeaders" :key="header">{{ row[header] || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>

            <!-- B. 如果没有物种被选中，则显示占位符 -->
            <template v-else>
              <div class="placeholder-container">
                <img src="../assets/placeholder-right-panel.png" alt="Placeholder" class="placeholder-image">
                <h2 class="placeholder-title">Species Information Panel</h2>
                <p class="placeholder-text">
                  Select a species from the menu on the left to view its details and gene data here.
                </p>
              </div>
            </template>
            
          </div>
        </div>
        <!-- ==================== 右侧内容区 END ==================== -->

      </div> 
    </main>
    
    <!-- 添加模态框 -->
    <div id="speciesModal" class="modal" v-show="isModalVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Species List - <span id="categoryName">{{ currentCategory }}</span></h2>
          <span class="close" @click="closeModal">&times;</span>
        </div>
        <div class="species-search-container">
          <input type="text" v-model="searchQuery" placeholder="Search species..." class="species-search-input">
        </div>
        <div class="species-list">
          <div id="speciesList" class="species-list-grid">
            <template v-if="Array.isArray(filteredSpeciesList)">
              <div
                v-for="(species, index) in filteredSpeciesList"
                :key="species + index"
                class="species-list-item"
                v-if="filteredSpeciesList.length > 0"
              >
                <a href="#" @click.prevent="selectSpecies(species)">
                  {{ species }}
                </a>
              </div>
              <div v-if="filteredSpeciesList.length === 0" class="species-list-item" style="grid-column: 1 / -1; text-align:center; color:#aaa;">
                No species found.
              </div>
            </template>
            <div v-else class="species-list-item" style="grid-column: 1 / -1; text-align:center; color:#aaa;">
              No species found.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
    
    <!-- 添加过渡效果的Footer -->
    <div class="footer-wrapper">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import * as XLSX from 'xlsx/xlsx.mjs'

// ==================== 新增：API相关状态变量 START ====================
// 控制详情区域和底部表格是否显示
const isSpeciesSelected = ref(false);
// API加载状态
const isLoadingPlantInfo = ref(false);
// API错误信息
const plantInfoError = ref('');
// 存储从API获取并处理后的植物详情
const plantDetails = ref({
  scientificName: '',
  canonicalName: '',
  family: '',
  order: '',
  phylum: '',
  kingdom: '',
  gbifKey: '',
  lastUpdated: '',
  imageUrl: '',
  ncbiId: ''
});

// 物种数据接口
interface SpeciesInfo {
    Gene:string,
    SseqID:string,
    Gene_start: string,
    Gene_end:string,
    Identity:string, 
    E_value: string,
    Score: string,
}

// 定义Excel数据类型接口
interface SpeciesExcelData {
  Gene: string;
  SseqID: string;
  Gene_start: string;
  Gene_end: string;
  Identity: string;
  E_value: string;
  Score: string;
  [key: string]: string; // 允许其他字段
}

// 路由和查询参数
const route = useRoute();
const router = useRouter();
const speciesParam = computed(() => route.query.species as string || '');
const categoryParam = computed(() => route.query.category as string || '');

// 物种数据


// 当前物种信息()
const speciesInfo = ref<SpeciesInfo>({
  Gene: "",
  SseqID: "",
  Gene_start: "",
  Gene_end: "",
  Identity: "",
  E_value: "",
  Score: "",
});

// 模态框状态
const isModalVisible = ref(false);
const currentCategory = ref('');
const searchQuery = ref('');
const currentSpeciesList = ref<string[]>([]);
const speciesSearchQuery = ref('');

const taxonomyGridRef = ref<HTMLElement | null>(null);

// 分类物种映射，初始化为空对象，页面加载时动态填充 (mingjingli)
const categorySpeciesMap = reactive<Record<string, string[]>>({});

// ==> 新增：定义模式植物列表
const modelPlants = [
  'Arabidopsis thaliana', 'Oryza sativa', 'Nicotiana tabacum',
  'Solanum lycopersicum', 'Zea mays', 'Glycine max'
];

// ==> 新增：一个计算属性来处理排序和置顶
const sortedCategories = computed(() => {
  // 从 categorySpeciesMap 中过滤掉“模式植物”，以防重复
  const otherCategories = Object.keys(categorySpeciesMap).filter(c => c !== 'Model Plants');
  
  // 对其他分类按物种数量从多到少排序
  otherCategories.sort((a, b) => {
    const countA = categorySpeciesMap[a]?.length || 0;
    const countB = categorySpeciesMap[b]?.length || 0;
    return countB - countA;
  });
  
  // 将“模式植物”强制放在最前面，然后跟上排好序的其他分类
  return ['Model Plants', ...otherCategories];
});

// 添加在适当位置，如speciesInfo定义之后
const dataRefreshInterval = ref(5 * 60 * 1000) // 默认5分钟检查一次更新
const isRefreshing = ref(false)
const lastRefreshTime = ref(new Date())

// 添加一个引用来保存定时器ID
const refreshTimerId = ref<number | null>(null);

// 添加刷新数据的函数
function refreshAllSpeciesData() {
  isRefreshing.value = true
  
  // 记录当前时间
  lastRefreshTime.value = new Date()
  
  // 创建刷新所有分类数据的Promise数组
  const refreshPromises = Object.keys(categorySpeciesMap).map(category => {
    return refreshCategoryData(category)
  })
  
  // 等待所有刷新完成
  Promise.allSettled(refreshPromises)
    .then(() => {
      console.log('All category data refresh completed')
      // 如果当前正在查看某个物种，也要刷新该物种的详细信息
      if (speciesParam.value) {
        loadSpeciesData()
      }
    })
    .finally(() => {
      isRefreshing.value = false
    })
} 52

// 刷新单个分类的数据
function refreshCategoryData(category: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 获取该分类应有的物种数量
    const count = categorySpeciesMap[category]?.length || 0
    if (count === 0) {
      resolve()
      return
    }
    
    // 根据分类获取对应的Excel文件路径(mingjingli)
    const filePath = `./fla-data/All-Flavonvid_genes/${category.replace('/', '_')}_all_flavonvid_genes.xlsx`;

    
    fetch(filePath + '?t=' + new Date().getTime()) // 添加时间戳避免缓存
      .then(response => {
        if (!response.ok) {
          throw new Error(`${category} species data file not found`)
        }
        return response.arrayBuffer()
      })
      .then(data => {
        try { // <== 新增 try
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // 从Excel数据中提取物种名称列表
        const speciesList = jsonData
          .map((item: any) => item.species || '')
          .filter((name: string) => name)
          .sort()
        
        // 只有当数据确实有变化时才更新
        const currentList = JSON.stringify(categorySpeciesMap[category] || [])
        const newList = JSON.stringify(speciesList.slice(0, count))
        
        if (currentList !== newList) {
          console.log(`${category} category data updated`)
          categorySpeciesMap[category] = speciesList.slice(0, count)
          
          // 如果当前正在显示该分类的模态框，也要更新列表
          if (isModalVisible.value && currentCategory.value === category) {
            currentSpeciesList.value = categorySpeciesMap[category] || []
          }
        }
        
      } catch (parseError) { // <== 新增 catch
        console.error(`Failed to parse Excel file for ${category}:`, parseError);
        // 即使解析失败，也应该 resolve()，避免阻塞 Promise.allSettled
    }
    
    resolve();
})
      .catch(error => {
        console.error(`Failed to refresh ${category} species data:`, error)
        reject(error)
      })
  })
}

// Export species data to Excel
const exportSpeciesData = () => {
  if (!tableData.value || tableData.value.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // 创建新的工作簿
  const wb = XLSX.utils.book_new();
  
  // 将JSON数据转换为工作表
  const ws = XLSX.utils.json_to_sheet(tableData.value);
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, speciesParam.value || 'Species Data');
  
  // 生成Excel文件并触发下载
  XLSX.writeFile(wb, `${speciesParam.value.replace(/ /g, '_')}_data.xlsx`);
}

// 数据加载和刷新函数组织优化
function generateSpeciesList(category: string, count: number): string[] {
  // 仅触发异步加载，不返回实际数据 (mingjingli)
  fetchCategoryData(category, count);
  return [];
}

function fetchCategoryData(category: string, count: number, isComponentUnmounted?: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    // 兼容/data和/fla-data/All-Flavonvid_genes两种路径（mingjingli）
    const filePathCandidates = [
      `./data/${category.replace(/\//g, '_')}.xlsx`,
      `./fla-data/All-Flavonvid_genes/${category.replace('/', '_')}_all_flavonvid_genes.xlsx`
    ];

    // 尝试依次加载不同路径
    const tryFetch = (paths: string[], idx = 0) => {
      if (idx >= paths.length) {
        console.error(`No Excel file found for category: ${category}`);
        resolve();
        return;
      }
      fetch(paths[idx])
        .then(response => {
          if (!response.ok) throw new Error('Species data file not found');
          return response.arrayBuffer();
        })
        .then(data => {
          // 检查组件是否已卸载
          if (typeof isComponentUnmounted === 'function' && isComponentUnmounted && isComponentUnmounted()) {
            resolve();
            return;
          }
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          // 兼容不同表头
          const speciesList = jsonData
            .map((item: any) => item.Species || item.species || item['Species（种）'] || '')
            .filter((name: string) => name)
            .slice(0, count)
            .sort();
          if (JSON.stringify(categorySpeciesMap[category]) !== JSON.stringify(speciesList)) {
            categorySpeciesMap[category] = speciesList;
            if (isModalVisible.value && currentCategory.value === category) {
              currentSpeciesList.value = speciesList;
            }
          }
          resolve();
        })
        .catch(() => {
          // 尝试下一个路径
          tryFetch(paths, idx + 1);
        });
    };

    tryFetch(filePathCandidates);
  });
}

// 替换 useIntervalFn 代码段
function startRefreshTimer() {
  // 清除可能存在的旧定时器
  if (refreshTimerId.value !== null) {
    clearInterval(refreshTimerId.value);
  }
  
  // 设置新的定时器
  refreshTimerId.value = window.setInterval(() => {
    refreshAllSpeciesData();
  }, dataRefreshInterval.value);
}

function stopRefreshTimer() {
  if (refreshTimerId.value !== null) {
    clearInterval(refreshTimerId.value);
    refreshTimerId.value = null;
  }
}

// 基于搜索查询的过滤物种列表
const filteredSpeciesList = computed(() => {
  if (!searchQuery.value) return currentSpeciesList.value;
  
  const query = searchQuery.value.toLowerCase();
  return currentSpeciesList.value.filter(species => 
    species.toLowerCase().includes(query)
  );
});

// 打开显示分类物种的模态框
function openModal(category: string) {
  currentCategory.value = category;
  currentSpeciesList.value = categorySpeciesMap[category] || [];
  searchQuery.value = '';
  isModalVisible.value = true;
}

// 关闭模态框
function closeModal() {
  isModalVisible.value = false;
  searchQuery.value = '';
}


// ==================== 3. 新增：调用后端API的函数 START ====================
async function fetchPlantApiData(speciesName: string) {
  // 开始加载，重置状态
  isLoadingPlantInfo.value = true;
  plantInfoError.value = '';
  isSpeciesSelected.value = true; // 立即显示加载状态
  

  try {
    const encodedName = encodeURIComponent(speciesName);
    const response = await fetch(`/KPGF_api/plant/table/${encodedName}/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      // 将API返回的数组转换为我们方便使用的对象
      const detailsObject = data.data.reduce((obj: any, item: any) => {
        // 将 "Scientific Name" 这样的键转换为 "scientificName"
        const key = item.Property.toLowerCase().replace(/ (\w)/g, (g: string) => g[1].toUpperCase());
        obj[key] = item.Value;
        return obj;
      }, {});

      // 更新我们的状态变量
      plantDetails.value = {
        scientificName: detailsObject.scientificName || 'N/A',
        canonicalName: detailsObject.canonicalName || 'N/A',
        family: detailsObject.family || 'N/A',
        order: detailsObject.order || 'N/A',
        phylum: detailsObject.phylum || 'N/A',
        kingdom: detailsObject.kingdom || 'N/A',
        gbifKey: detailsObject.gbifKey || '',
        lastUpdated: detailsObject.lastUpdated || 'N/A',
        // 从返回的HTML链接中提取真实的图片URL
        imageUrl: detailsObject.imageUrl?.match(/href="([^"]*)"/)?.[1] || '',
        ncbiId: detailsObject.ncbiTaxonomyId || '' 
      };

    } else {
      throw new Error(data.error || 'Failed to fetch plant information.');
    }

  } catch (error: any) {
    console.error('Error fetching plant API data:', error);
    plantInfoError.value = error.message || 'An unknown error occurred.';
  } finally {
    isLoadingPlantInfo.value = false;
  }
}
// ==================== 3. 新增：调用后端API的函数 END ====================```



// 修改加载物种数据的函数，避免拆分英文物种名称
function loadSpeciesData() {
  // 1. 定义您想要显示的列名"白名单"
  const DESIRED_HEADERS = [
    'subject_id', 'Function','pident', 'qStart', 'qEnd', 'tStart', 'tEnd', 
    'alnlen', 'nIdent', 'nPos', 'e-value', 'bitscore', 
    'ec_number', 'Description',
  ];

  if (speciesParam.value) {
    const formattedSpeciesName = speciesParam.value.replace(/ /g, '_');
    
    
    // 2. 更新文件路径以匹配新的 "_function.tsv" 格式
    const filePath = `./fla-data/All-Flavonvid_genes/${formattedSpeciesName}_function.tsv`;
    
    console.log('Attempting to load TSV file:', filePath);
    
    // 3. 修改 fetch 逻辑以处理 TSV 文本
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Species data TSV file not found');
        }
        return response.text(); // 读取为纯文本，而不是 arrayBuffer
      })
      .then(tsvData => {
        // 4. TSV 解析与列筛选逻辑
        const rows = tsvData.trim().split('\n').filter(line => line);
        
        if (rows.length > 1) { // 至少要有一行表头和一行数据
          const allHeaders = rows[0].trim().split('\t'); // TSV文件的原始表头

          // a. 找到我们想要的列在原始数据中的索引
          const headerIndexMap = new Map<string, number>();
          DESIRED_HEADERS.forEach(header => {
            const index = allHeaders.indexOf(header);
            if (index > -1) {
              headerIndexMap.set(header, index);
            }
          });

          // b. 设置最终要在表格中显示的表头 (按白名单顺序)
          tableHeaders.value = DESIRED_HEADERS.filter(h => headerIndexMap.has(h));

          // c. 解析数据行，并只提取想要的列来构建对象数组
          const dataRows = rows.slice(1);
          tableData.value = dataRows.map(row => {
            const cells = row.trim().split('\t');
            const rowData: { [key: string]: string } = {};

            for (const header of tableHeaders.value) {
              const index = headerIndexMap.get(header);
              if (index !== undefined) {
                rowData[header] = cells[index] || '-';
              }
            }
            return rowData;
          });

          hasSpeciesData.value = true;
        } else {
          // 文件为空或只有表头
          hasSpeciesData.value = false;
        }
      })
      .catch(error => {
        console.error('Failed to load species data:', error);
        hasSpeciesData.value = false;
        tableHeaders.value = [];
        tableData.value = [];
      });

    document.title = `${speciesParam.value} - Species Information`;
  }
  if (speciesParam.value) {
    // 这部分逻辑保持不变
    isSpeciesSelected.value = true; // 确保在有物种时显示内容
    // ... (fetch 和处理数据的代码)
  } else {
    // ==> 新增这部分 <==
    // 如果URL中没有species参数，则确保显示占位符
    isSpeciesSelected.value = false; 
  }
}

// 切换分类展开状态

// 添加路由变化监听函数，确保参数变化时重新加载数据
// 监听路由参数变化
watch(
  () => route.query.species,
  (newSpecies) => {
    if (newSpecies) {
      loadSpeciesData(); // 已有逻辑
      fetchPlantApiData(newSpecies as string); // 已有逻辑
    } else {
      isSpeciesSelected.value = false; // ==> 新增或确认有这行 <==
    }
  },
  { deep: true, immediate: true } // ==> 确认有 immediate: true <==
);

// 选择一个物种并关闭模态框
// ==================== 替换：selectSpecies 函数 START ====================
function selectSpecies(species: string) {
      // 关闭模态框
      closeModal();

      // 更新路由
      router.push({
        path: '/species-table',
        query: { species: species }
      });
      
      // *** 关键改动 ***
      // 1. 调用API获取专业信息
      fetchPlantApiData(species);

      // 2. 像以前一样加载Excel数据用于底部表格
      loadSpeciesData(); 
    }
    // ==================== 替换：selectSpecies 函数 END ====================
// ==> 新增：处理物种搜索的函数
function handleSpeciesSearch() {
  const query = speciesSearchQuery.value.trim();
  if (!query) {
    alert('Please enter a species name.');
    return;
  }
  
  // 直接调用我们已有的 selectSpecies 函数来处理后续逻辑
  // 这是一种很好的代码复用
  selectSpecies(query);
  
  // 清空搜索框（可选）
  speciesSearchQuery.value = '';
}

// 生命周期钩子
onMounted(async () => {
  // 分类列表（顺序与species-genome.vue一致）
  const categoryList = [
    'Anthocerotopsida','Bangiophyceae','Basal Eudicots','Bryopsida','Charophyceae','Chlorodendrophyceae',
    'Chlorokybophyceae','Chlorophyceae','Chloropicophyceae','Core Eudicots/Asterids','Core Eudicots/Rosids',
    'Eudicotyledoneae','Florideophyceae','Ginkgoopsida','Glaucocystophyceae','Gnetopsida','Klebsormidiophyceae',
    'Lycopodiopsida','Mamiellophyceae','Marchantiopsida','Mesostigmatophyceae','Monocots','Pinopsida',
    'Polypodiopsida','Pyramimonadophyceae','Trebouxiophyceae','Ulvophyceae','Zygnematophyceae'
  ];

  // 初始化所有分类为 []，避免初始渲染出现0
  categoryList.forEach(category => {
    if (!(category in categorySpeciesMap)) categorySpeciesMap[category] = [];
  });

  categorySpeciesMap['Model Plants'] = modelPlants;
  let unmounted = false;
  const isComponentUnmounted = () => unmounted;
  onUnmounted(() => { unmounted = true; });

  try {
    // 并行加载所有分类数据（mingjingli）
    await Promise.all(
      categoryList.map(category => fetchCategoryData(category, 9999, isComponentUnmounted))
    );

    // 强制刷新视图（mingjingli）
    
  } catch (error) {
    console.error('Failed to load category data:', error);
  }


   // 如果URL中已存在物种参数，则加载所有相关数据
   if (speciesParam.value) {
        // ==================== 5. 新增：在onMounted中调用API START ====================
        fetchPlantApiData(speciesParam.value);
        // ==================== 5. 新增：在onMounted中调用API END ====================

  // 加载物种数据
  loadSpeciesData();
}

  // 启动定期刷新
  startRefreshTimer();

  // 添加路由监听
  watch(
    () => route.query.species,
    (newSpecies) => {
      if (newSpecies) {
        loadSpeciesData();
      }
    }
  );

  // 如果URL中有分类参数，则打开该分类的模态框
  if (categoryParam.value) {
    openModal(categoryParam.value);
  }
});

// 组件卸载时停止刷新
onUnmounted(() => {
  stopRefreshTimer();
});

// 添加一个函数用于更改刷新间隔
function updateRefreshInterval(newInterval: number) {
  dataRefreshInterval.value = newInterval;
  // 重启定时器以应用新间隔
  startRefreshTimer();
}

// 如果有多个图片，可以这样处理
const getSpeciesImage = (speciesName: string) => {
  return new URL(`../assets/${speciesName.replace(' ', '_')}.jpg`, import.meta.url).href
}

// mingjingli: 添加新的数据状态
const hasSpeciesData = ref(false);
const tableHeaders = ref<string[]>([]);
const tableData = ref<any[]>([]);

defineOptions({
  name: 'SpeciesTable'
})
</script>

<style scoped>
/* 添加全局背景色 */
.species-page {
  background-image: linear-gradient(20deg,#fafafa,#abdfcb,#86c1bd,#e6f8f1,#faf5f0,#ffffff);
  min-height: 100vh;
  position: relative;
}

/* Header过渡效果 */
.header-wrapper {
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.header-wrapper:after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.03), transparent);
  pointer-events: none;
}

/* Footer过渡效果 */
.footer-wrapper {
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.footer-wrapper:before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.03), transparent);
  pointer-events: none;
}

/* 确保页脚样式不受当前组件样式影响 */
:deep(footer),
:deep(.footer) {
  background-color: #abdfcb !important; /* 确保页脚为绿色 */
  color: white !important;
  padding: 20px 0;
  margin-top: 0;
  width: 100%;
  text-align: center;
  transition: background-color 0.3s ease;
}

/* 页脚中的链接样式 */
:deep(footer a),
:deep(.footer a) {
  color: white !important;
  text-decoration: none;
  transition: color 0.3s ease, text-decoration 0.3s ease;
}

/* 页脚中的链接悬停样式 */
:deep(footer a:hover),
:deep(.footer a:hover) {
  text-decoration: underline;
}

/* 主内容区的过渡效果 */
.center-content {
  position: relative;
  z-index: 5;
  padding-top: 10px;
  background-color: #86c1bd !important;
  padding-bottom: 10px;
  transition: padding 0.3s ease;
  background-color: #e6f8f1 !important;
  border-radius: 20px;
  width: 100%;
}

/* ==================== 页面主布局样式 START ==================== */
.main-content-area {
  flex-grow: 1;
  padding: 20px;
  max-width: 2100px;
  width: 100%;
  margin: 20px auto;
  background-color: #e6f8f1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  min-height: 650px;
}

.layout-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  height: 100%;
  align-items: stretch;
}

.layout-col-left {
  flex: 0 0 auto;
  width: 320px; /* 左侧栏固定宽度 */
}

.layout-col-right {
  flex: 1; /* 右侧栏占据剩余空间 */
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 卡片通用样式 */
.ui-card {
  border-radius: 20px;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.taxonomy-card {
  background-color: #abdfcb;
  overflow-y: auto; /* 如果内容超长，允许滚动 */
}

.content-card {
  background-color: #ffffff;
  min-height: 800px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ==================== 右侧占位符样式 START ==================== */
.placeholder-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}
.placeholder-image {
  max-width: 250px; /* 调整图片大小 */
  margin-bottom: 20px;
  opacity: 0.7;
}
.placeholder-title {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 10px;
}
.placeholder-text {
  font-size: 1.1rem;
  max-width: 500px;
}

/* 表格样式 */
.species-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 16px;
  margin-top: 20px;
}

.species-table th,
.species-table td {
  padding: 12px 35px;
  border-bottom: 1px solid #ddd;
}

.species-table th {
  background-color: #e6f8f1;
  font-weight: bold;
  cursor: pointer;
}

.species-table th:hover {
  background-color: #d4f1e0;
}

.species-table tr:hover {
  background-color: #f5f5f5;
}

/* 奇数行颜色 */
.species-table tr:nth-child(odd) {
  background-color: #e6f8f1;
}

/* 偶数行颜色 */
.species-table tr:nth-child(even) {
  background-color: #ffffff;
}

/* 图片样式 */
#species-image {
  width: 325px;
  height: 480px;
  border: none;
  border-radius: 10px;
  padding: 10px;
}

/* 居中对齐 */
.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: auto;
  margin-top: 20px;
  padding: 0 20px 20px;
  background-color: #f5f5f5;
}

/* 分类信息样式 */
.taxonomy-info-container {
  width: 100%;
  max-width: 1200px;
  background-color: #fffdfd;
  padding: 15px;
  margin-bottom: 20px;
}

.taxonomy-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.taxonomy-info-title {
  font-size: 1.5rem;
  color: #333;
  font-weight: bold;
  margin-bottom: 0;
}

.taxonomy-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
  position: relative;
  padding-bottom: 5px;
  will-change: max-height;
}

.taxonomy-item {
  padding: 8px 12px;
  background-color: #e6f8f1;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.taxonomy-item:hover {
  background-color: #d4f1e0;
}

.taxonomy-count {
  color: #666;
  font-size: 0.9em;
}

.content-container {
  width: 100%;
  max-width: 1200px;
  background-color: #ffffff;
  padding: 15px 20px;
}

.content-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
  border-bottom: 2px solid #e6f8f1;
  padding-bottom: 8px;
}

.species-info {
  overflow-x: auto;
  max-width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ffffff;
  border-radius: 8px;
  background: #fff;
}

/* 模态框样式 */
.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 800px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close {
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
}

.species-search-container {
  margin-bottom: 15px;
}

.species-search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.species-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.species-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.species-list-item {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

.species-list-item:hover {
  background-color: #e6f8f1;
}

.species-list-item a {
  color: #333;
  text-decoration: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-footer {
  text-align: right;
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.modal-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.modal-btn:hover {
  background-color: #45a049;
}

.export-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.export-btn {
  padding: 10px 20px;
  background-color: #159989;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-btn:hover {
  background-color: #0c8c42;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .taxonomy-info-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .modal-content {
    width: 95%;
    margin: 10% auto;
  }
  
  .species-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .title-eyebrow {
    letter-spacing: 0.12em;
  }

  .content-title {
    font-size: 1.6rem;
  }
  
  .taxonomy-info-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .species-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .modal-title {
    font-size: 1.2rem;
  }
}


/* 添加渐变遮罩效果，提示有更多内容 */
.taxonomy-info-grid:not(.show-all)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background: linear-gradient(to bottom, rgba(249, 249, 249, 0), rgba(249, 249, 249, 0.9));
  pointer-events: none;
}


/* 修改 .taxonomy-card 以实现固定高度和内部滚动 */
.taxonomy-card {
  background-color: #abdfcb;
  height: 800px; /* 固定高度，可以根据你的需要调整 */
  display: flex;
  flex-direction: column;
}

/* 修改 .taxonomy-info-container 使其能正确布局 */
.taxonomy-info-container {
  /* 移除旧的背景色、padding等，因为它现在是透明的容器 */
  background-color: transparent; 
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 占据父容器所有可用空间 */
}

/* 修改 .taxonomy-info-header */
.taxonomy-info-header {
  /* 让标题单独一行，不再需要 space-between */
  margin-bottom: 0;
  flex-shrink: 0; /* 防止标题被压缩 */
}

/* 修改 .taxonomy-info-grid 来实现滚动 */
.taxonomy-info-grid {
  flex-grow: 1; /* 占据剩余的所有空间 */
  overflow-y: auto; /* 当内容超出时显示垂直滚动条 */
  /* 移除 transition 和 will-change */
  transition: none;
  will-change: auto;
  grid-template-columns: 1fr; /* 改为单列布局以适应窄容器 */
}

/* 修改 .species-search-bar-container 的样式 */
.species-search-bar-container {
    /* 从header中移出后，需要自己定义样式 */
    max-width: 500%;
    margin-top: 15px; /* 与标题的间距 */
    margin-bottom: 15px; /* 与列表的间距 */
    padding: 0;
    box-shadow: none;
    background-color: transparent;
}
.species-search-bar-input {
  background-color: white; /* 确保输入框可见 */
}

/* 美化滚动条样式 */
.taxonomy-info-grid::-webkit-scrollbar {
   width: 6px;
   background-color: transparent;
   margin-right: auto;
 }

 .taxonomy-info-grid::-webkit-scrollbar-track {
  background-color: transparent;
  margin-right: auto;
   background: transparent;
 }

 .taxonomy-info-grid::-webkit-scrollbar-thumb {
   background-color: #ffffff; /* 白色滑块 */
   border-radius: 3px;
   background-color: transparent;
   margin-right: auto;
 }



@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.species-error {
  text-align: center;
  padding: 24px;
  font-size: 1rem;
  color: #0c8c42;
  background-color: rgba(230, 248, 241, 0.6);
  border-radius: 20px;
  border: 1px dashed rgba(134, 193, 189, 0.6);
  line-height: 1.6;
}

/* 表格样式 */
.species-data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;
}

.species-data-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #e6f8f1;
}

.species-data-table th {
  background-color: #e6f8f1;
  font-weight: bold;
  color: #333;
  padding: 15px 26px;
  border-bottom: 2px solid #ddd;
}

.species-data-table td {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(134, 193, 189, 0.2);
  color: #34495e;
}

.table-row:hover {
  background-color: #e6f8f1;
}

/* ====================  新增：物种详情区域样式 START ==================== */

.species-detail-container {
  width: 100%;
  max-width: 1200px;
  background-color: #ffffff;
  padding: 20px 25px;
  margin-top: 20px; /* 与分类信息区隔开 */
}

.species-detail-content {
  display: flex;
  gap: 25px;
  align-items: flex-start;
}

.species-detail-image {
  flex-shrink: 0;
  width: 220px;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.species-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}



.species-detail-info {
  flex-grow: 1;
}

.species-detail-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.species-detail-scientific-name {
  font-size: 1.1rem;
  font-style: italic;
  color: #7f8c8d;
  margin: 5px 0 20px 0;
}

.species-detail-grid {
  display: grid;
  /* 关键修改：定义一个固定的两列布局 */
  /* 第一列宽度100px给属性名，第二列占据剩余空间给值 */
  grid-template-columns: 100px auto; 
  gap: 12px 20px; /* 行间距12px，列间距20px */
  align-items: center; /* 垂直居中对齐 */
}

.detail-property {
  font-weight: 600;
  color: #34495e;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  background-color: #f8f9fa;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.detail-value a {
  color: #159989;
  text-decoration: none;
  font-weight: 500;
}

.detail-value a:hover {
  text-decoration: underline;
}

/* 加载和错误状态的样式 */
.detail-loading,
.detail-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  font-size: 1.1rem;
  color: #555;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.detail-error {
  color: #e74c3c;
  font-weight: 500;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  font-size: 1.5rem;
}

/* 确保动画已定义 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==================== 6. 新增：物种详情区域样式 END ==================== */

/* ==> 新增：搜索框样式 START <== */
.species-search-bar-container {
  width: 200%;
  max-width: 200px;
  margin-bottom: 5px; /* 与下方的Taxonomy框隔开 */
  display: flex;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 8px;
}

.species-search-bar-input {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 10px 1px;
  font-size: 1rem;
  background-color: transparent;
}

.species-search-bar-button {
  border: none;
  background-color: #159989;
  color: white;
  font-weight: 400;
  padding: 0 px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.species-search-bar-button:hover {
  background-color: #0c8c42;
}
/* ==> 新增：搜索框样式 END <== */
</style>
