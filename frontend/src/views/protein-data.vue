<template>
    <div class="protein-data">
        <Header />
        
        <!-- 主体内容区 -->
        <main>
            <div class="row q-col-gutter-md">
                <!-- 左侧分类部分 -->
                <div class="col-auto">
                    <div class="ui-card full-height taxonomy-card">
                        <div class="ui-left-bordered-title taxonomy-title" @click="handleTaxonomyTitleClick">🌲 Taxonomy</div>
                        <ul class="q-tree">
                            <li v-for="category in taxonomyCategories" 
                                :key="category"
                                class="q-tree__node q-tree__node--parent"
                                :data-category="category"
                                @click="handleCategoryClick(category)"
                            >
                                <div class="q-tree__node-header">
                                    <span class="q-tree__arrow"></span> {{ category }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- 右侧内容显示部分 -->
                <div class="col">
                    <div id="content-area" class="ui-card full-height content-card">
                        <div class="ui-left-bordered-title content-title">
                            {{ showTable ? `${currentCategory} proteins` : 'Taxonomy distribution' }}
                        </div>
                        
                        <!-- 搜索框 - 仅在表格显示时可见 -->
                        <div class="search-container" v-if="showTable">
                            <input 
                                type="text" 
                                v-model="searchQuery" 
                                placeholder="Search proteins..." 
                                class="species-search"
                                @input="handleSearch"
                            />
                        </div>
                        
                        <!-- 图表区域 - 初始状态显示 -->
                        <div id="chart" ref="chartContainer" v-show="!showTable"></div>
                        
                        <!-- 表格区域 - 点击分类后显示 -->
                        <div class="species-table" v-show="showTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th @click="sortTable('Class')">Class <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('Order')">Order <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('Family')">Family <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('Species')">Species <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('more')">More <span class="sort-icon">⇅</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr 
                                        v-for="(species, index) in paginatedSpeciesData" 
                                        :key="index"
                                        :class="{ 'even-row': index % 2 === 1 }"
                                        :data-species="species.Species"
                                    >
                                        <td>{{ species.Class }}</td>
                                        <td>{{ species.Order }}</td>
                                        <td>{{ species.Family }}</td>
                                        <td>{{ species.Species }}</td>
                                        <td class="download-cell">
                                            <a href="#" @click.prevent="handleDownload(species)" class="download-link">
                                                <span class="download-icon">⬇</span> {{ species.more }}
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <!-- 分页控件 -->
                            <div class="pagination">
                                <span>
                                     {{ (currentPage - 1) * itemsPerPage + 1 }} to
                                    {{ Math.min(currentPage * itemsPerPage, filteredSpeciesData.length) }} 
                                    for {{ filteredSpeciesData.length }} proteins
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
                </div>
            </div>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import * as echarts from 'echarts/core'
import type { ECharts } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import * as XLSX from 'xlsx/xlsx.mjs'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  CanvasRenderer
])

// 分类数据
const taxonomyCategories = [
    'Core Eudicots/Rosids','Core Eudicots/Asterids','Core Eudicots','Basal Eudicots', 'Monocots', 'Chlorophyceae', 'Pinopsida', 'Florideophyceae',
     'Bryopsida', 'Selaginellopsida', 'Cyanidiales', 
    'Anthocerotophyta', 'Mamiellophyceae',  
    'Prasinophyceae', 'Marchantiopsida', 
]

// 图表相关
const chartContainer = ref<HTMLElement | null>(null)
let chart: ECharts | null = null
const currentCategoryDetails = ref('Select a category to view details.')

// 控制显示表格还是图表
const showTable = ref(false)
const currentCategory = ref('')

// 添加一个变量用于跟踪当前加载的分类
const loadingCategory = ref('');
// 添加一个变量用于存储每个分类的数据
const categoryDataMap = ref<Record<string, SpeciesData[]>>({});
// 添加一个变量用于存储 AbortController
let currentFetchController: AbortController | null = null;

// 示例物种数据 - 这里可以根据分类动态加载不同的数据
const speciesData = ref([
    // 示例数据 - Basal Eudicots
    { 
        Class: 'Basal Eudicots', 
        Order: 'Berberidopsidales', 
        Family: 'Aextoxicaceae', 
        Species: 'Aextoxicon punctatum',
        more: 'Download' 
    },
    { Class: 'Basal Eudicots', Order: 'Ranunculales', Family: 'Lardizabalaceae', Species: 'Akebia trifoliata', more: 'Download' },
    { Class: 'Basal Eudicots', Order: 'Ranunculales', Family: 'Ranunculaceae', Species: 'Anemone hupehensis', more: 'Download' },
    { Class: 'Basal Eudicots', Order: 'Ranunculales', Family: 'Ranunculaceae', Species: 'Anemone pulsatilla', more: 'Download' },
    { Class: 'Basal Eudicots', Order: 'Ranunculales', Family: 'Papaveraceae', Species: 'Argemone mexicana', more: 'Download' },
    { Class: 'Basal Eudicots', Order: 'Berberidopsidales', Family: 'Berberidopsidaceae', Species: 'Berberidopsis beckleri', more: 'Download' },
])

// 更新类型定义
interface SpeciesData {
    Class: string;
    Order: string;
    Family: string;
    Species: string;
    more: string;
}

// 处理下载按钮点击事件
const handleDownload = (species: SpeciesData) => {
    // 这里可以根据物种信息构建下载链接
    const filePath = `./data/protein/${species.Class}/${species.Species.replace(' ', '_')}.zip`;
    
    // 触发下载
    window.open(filePath, '_blank');
}

// 修改加载数据函数
const loadExcelData = (category: string) => {
    // 首先标记当前正在加载的分类
    loadingCategory.value = category;
    
    // 如果有正在进行的请求，取消它
    if (currentFetchController) {
        currentFetchController.abort();
    }
    
    // 创建新的 AbortController
    currentFetchController = new AbortController();
    
    // 如果已经有缓存的数据，直接使用
    if (categoryDataMap.value[category]) {
        speciesData.value = categoryDataMap.value[category];
        return;
    }
    
    // 根据分类获取对应的Excel文件路径 - 移除public前缀
    const fileName = `${category.replace('/', '_')}-protein.xlsx`;
    const filePath = `./pro-data/${fileName}`;
    
    // 显示加载中状态
    speciesData.value = [{ 
        Class: category, 
        Order: 'Loading...', 
        Family: 'Loading...', 
        Species: 'Loading data, please wait...', 
        more: 'Loading' 
    }];
    
    // 尝试使用多个可能的路径
    const tryPaths = [
        filePath,                   // ./pro-data/...
        `/pro-data/${fileName}`,    // 绝对路径 /pro-data/...
        `../pro-data/${fileName}`,  // 向上一级 ../pro-data/...
        `/KPGF/html/pro-data/${fileName}` // 完整部署路径
    ];
    
    // 尝试所有可能的路径
    Promise.allSettled(tryPaths.map(path => 
        fetch(path, { signal: currentFetchController ? currentFetchController.signal : null })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch from: ${path}`);
                }
                console.log(`成功加载文件: ${path}`);
                return response.arrayBuffer();
            })
    ))
    .then(results => {
        // 查找第一个成功的结果
        const successResult = results.find(result => result.status === 'fulfilled');
        
        if (successResult && successResult.status === 'fulfilled') {
            // 处理成功获取的数据
            const data = successResult.value;
            
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // 转换数据格式并添加下载链接
            const processedData = jsonData.map((item: any) => ({
                Class: item.Class || category,
                Order: item.Order || '',
                Family: item.Family || '',
                Species: item.Species || '',
                more: 'Download'
            }));
            
            // 存储到缓存中
            categoryDataMap.value[category] = processedData;
            
            // 更新显示数据
            speciesData.value = processedData;
        }
    })
    .catch(error => {
        console.error('Error fetching Excel file:', error);
        // 所有路径都失败时，显示错误信息
        speciesData.value = [{ 
            Class: category, 
            Order: 'Error', 
            Family: 'Error', 
            Species: `Unable to load data. Error: ${error.message}. Attempted paths: ${tryPaths.join(', ')}`, 
            more: 'Error' 
        }];
    })
    .finally(() => {
        if (loadingCategory.value === category) {
            currentFetchController = null;
        }
    });
}

// 修改图表配置函数
const getDefaultChartOption = () => {
  const defaultData = {
    categories: ['Core Eudicots/Rosids','Core Eudicots/Asterids','Core Eudicots','Basal Eudicots' , 'Chlorophyceae', 'Other'],
    samples: [101, 52, 23, 8, 10, 16],
    colors: [
      '#86c1bd',  
      '#3c9a76',  
      '#e6f8f1',  
      '#60B6FF',  
      '#acdfcb',  
      '#e5c674',  
      '#159989',
    ]
  };

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center'
    },
    series: [{
      name: 'Species Distribution',
      type: 'pie',
      radius: ['30%', '75%'],
      center: ['50%', '45%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c} ({d}%)'
      },
      data: defaultData.categories.map((category, index) => ({
        name: category,
        value: defaultData.samples[index],
        itemStyle: {
          color: defaultData.colors[index]
        }
      }))
    }]
  };
};

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    chart.setOption(getDefaultChartOption());
  }
};

// 处理分类点击
const handleCategoryClick = (category: string) => {
    console.log(`Click category: ${category}`)
    currentCategory.value = category
    showTable.value = true
    
    // 调用加载Excel数据的函数
    loadExcelData(category);
    
    // 移除之前选中项的样式
    const prevSelected = document.querySelector('.q-tree__node-header.selected')
    if (prevSelected) {
        prevSelected.classList.remove('selected')
    }
    
    // 为当前点击项添加选中样式
    const currentNode = document.querySelector(`[data-category="${category}"]`)?.querySelector('.q-tree__node-header')
    if (currentNode) {
        currentNode.classList.add('selected')
    }
}

// 处理分类标题点击 - 返回到图表视图
const handleTaxonomyTitleClick = () => {
  showTable.value = false
  currentCategory.value = ''
  
  if (chart) {
    chart.setOption(getDefaultChartOption())
  }
  currentCategoryDetails.value = 'Select a category to view details.'
}

// 表格排序功能
const sortTable = (column: string) => {
    // 实现表格排序逻辑
    console.log(`Sort by: ${column}`)
}

// 添加窗口大小变化监听
const handleResize = () => {
  if (chart) {
    chart.resize();
    chart.setOption(getDefaultChartOption());
  }
}

// 生命周期钩子
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
    
    // 添加点击其他区域取消选中的处理
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (!target.closest('.q-tree')) {
            const selected = document.querySelector('.q-tree__node-header.selected')
            if (selected) {
                selected.classList.remove('selected')
            }
            currentCategory.value = ''
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (chart) {
        chart.dispose()
    }
    
    // 取消任何正在进行的请求
    if (currentFetchController) {
        currentFetchController.abort();
    }
})

// 添加搜索和分页相关变量
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// 计算属性：过滤后的数据
const filteredSpeciesData = computed(() => {
    if (!searchQuery.value) return speciesData.value
    const query = searchQuery.value.toLowerCase()
    return speciesData.value.filter(species => 
        species.Species.toLowerCase().includes(query) ||
        species.Family.toLowerCase().includes(query) ||
        species.Order.toLowerCase().includes(query) ||
        species.Class.toLowerCase().includes(query)
    )
})

// 计算属性：当前页的数据
const paginatedSpeciesData = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage
    return filteredSpeciesData.value.slice(startIndex, startIndex + itemsPerPage)
})

// 计算属性：总页数
const totalPages = computed(() => {
    return Math.ceil(filteredSpeciesData.value.length / itemsPerPage)
})

// 计算属性：分页按钮数组
const pageButtons = computed(() => {
    const buttons = []
    const maxButtons = 5 // 最多显示5个页码按钮
    
    let startPage = Math.max(1, currentPage.value - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages.value, startPage + maxButtons - 1)
    
    // 调整起始页，确保显示足够的按钮
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxButtons + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(i)
    }
    
    return buttons
})

// 处理搜索
const handleSearch = () => {
    currentPage.value = 1 // 搜索时重置到第一页
}

// 处理分页
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

// 处理上一页
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

// 处理下一页
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const selectedCategory = ref('')
</script>

<style scoped>
/* 主容器样式 */
.protein-data {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-image: linear-gradient(20deg,#fafafa,#abdfcb,#faf5f0,#ffffff);
}

main {
    padding: 20px;
    max-width: 2100px;
    margin: 0 auto;
    background-color: #e6f8f1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-radius: 20px;
    min-height: 650px;
}

.row {
    display: flex;
    flex-wrap: nowrap;
    gap: 20px;
    padding: 1px;
}

.col-auto {
    flex: 0 0 auto;
    width: 290px;
}

.col {
    flex: 1;
    min-width: 0;
}

.q-col-gutter-md {
    gap: 10px;
}

/* 左侧分类栏卡片样式 */
.col-auto .ui-card {
    border-radius: 0 20px;
    background-color: #40A780;  /* 浅绿色背景 */
    height: 735px;  /* 固定高度，大约显示15行 */
    overflow-y: auto;  /* 添加垂直滚动条 */
    overflow-x: hidden;  /* 隐藏水平滚动条 */
    direction: rtl;  /* 将内容方向设置为从右到左 */
    width: 500px;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
        width: 6px;
        background-color: transparent;
        margin-right: auto;  /* 将滚动条推到左侧 */
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: #40A780;
        border-radius: 3px;
    }
    
    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}

/* 恢复内容的正常方向 */
.q-tree {
    direction: ltr;  /* 将树形菜单内容方向恢复为从左到右 */
}

.full-height {
    height: 100%;
}

.ui-left-bordered-title {
    border-left: 7px solid #0c8c42;
    padding-left: 10px;
    font-size: 20px;
    font-weight: bold;
}

.taxonomy-title {
  cursor: pointer; /* 鼠标悬停时显示手指指针 */
  transition: color 0.3s; /* 颜色过渡效果 */
  text-align: left;
  margin-left: 80px;
  color: #041d1a;
}

.taxonomy-title:hover {
  color: #ffffff; /* 悬停时改变颜色 */
}

/* 分类树样式 */
/* 左分类样式 */
.taxonomy-card {
    padding: 20px;
    width: 500px;
    min-height: 584px;
}

.taxonomy-title {
    margin-bottom: 20px;
}

.q-tree {
    font-size: 16px;
    line-height: 1.4;
    margin:  0;  /* 调整每项的间距 */
    padding:  0;
    font-weight: bold;
}
/* 左分类上下间距 */
.q-tree__node {
    list-style: none;
    margin: 8px 0;  /* 调整每项的间距 */
    padding: 4px 0;
}

.q-tree__node--parent {
    cursor: pointer;/* 鼠标变手指 */
}

.q-tree__node-header {
    padding: 5px 15px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 290px;
    border-radius: 10px;
}

/* 左分类鼠标悬停样式 */
.q-tree__node-header:hover {
    background-color: #ffffff;
}

/* 左分类被选中时的样式 */
.q-tree__node-header.selected {
    background-color: #ffffff;
}

/* 左分类箭头样式 */
.q-tree__arrow {
    margin-right: 8px;
    transform: rotate(0deg);
    transition: transform 0.3s;
}

/* 图表容器样式 */
#chart {
    width: 100%;
    height: 600px; /* 增加高度以更好地展示玫瑰图 */
    margin-top: 50px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    
    padding: 20px;
    transition: all 0.3s ease;
}

/* 右侧内容区卡片样式 */
.col .ui-card {
    border-radius: 50px;
    background-color: #fff;
    
}

/* 内容卡片样式 */
.content-card {
    padding: 100px;
}
/* 内容卡片标题样式 */
.content-title {
    margin-bottom: 20px;
}

/* 表格样式 */
.species-table {
    width: 100%;
    margin-top: 20px;
}

.species-table table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 16px;
    font-style: italic;
}

.species-table th, 
.species-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
}

.species-table th {
    background-color: #e6f8f1;
    font-weight: bold;
    cursor: pointer;
}

.species-table th:hover {
    background-color: #e6f8f1;
}

.sort-icon {
    font-size: 12px;
    margin-left: 5px;
}

.species-table tr:hover {
    background-color: #f5f5f5;
}

/* 分页控件样式 */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 10px 0;
}

.page-controls {
    display: flex;
    gap: 5px;
}

.page-btn {
    padding: 5px 10px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 3px;
    min-width: 35px;
}

.page-btn.active {
    background-color: #0c8c42;
    color: white;
    border-color: #0c8c42;
}

.page-btn:hover:not(.active) {
    background-color: #e6f8f1;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 移动设备适配 */
@media (min-width: 1024px) {
  .content-card {
    padding: 30px;
  }
  
  .taxonomy-card {
    width: 300px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .col-auto {
    width: 250px;
  }
  
  .content-card {
    padding: 20px;
  }
  
  .taxonomy-card {
    width: 250px;
  }
}

@media (max-width: 767px) {
  .row {
    flex-direction: column;
  }
  
  .col-auto {
    width: 100%;
  }
  
  .taxonomy-card {
    width: 100%;
    min-height: auto;
  }
  
  .content-card {
    padding: 15px;
  }
}

/* 更小的手机屏幕 */
@media (max-width: 480px) {
  .taxonomy-title, .content-title {
    font-size: 14px;
  }
  
  .q-tree {
    font-size: 13px;
  }
  
  .content-card {
    padding: 10px;
  }
  
  #chart {
    height: 250px;
  }
  
  .page-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}

/* 下载链接样式 */
.download-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: #0c8c42;
    text-decoration: none;
    transition: color 0.3s ease;
    padding-left: 15px;
    margin-left: -30px; 
}

.download-link:hover {
    color: #075f2c;
    text-decoration: underline;
}

.download-icon {
    margin-right: 5px;
    font-size: 14px;
}

/* 搜索框样式 */
.search-container {
    margin: 20px 0;
    display: flex;
    justify-content: flex-end;
}

.species-search {
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 20px;
    width: 300px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.species-search:focus {
    border-color: #0c8c42;
    outline: none;
}

/* 隔行变色 */
.even-row {
    background-color: #e6f8f1;
}

/* 高亮搜索结果 */
.highlight {
    background-color: #abdfcb !important;
    transition: background-color 0.5s ease;
}

/* 下载单元格样式 */
.download-cell {
    text-align: left; /* 左对齐 */
}

/* 响应式设计增强 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  main {
    max-width: 1400px;
    padding: 30px;
  }
  
  .col-auto {
    width: 350px;
  }
  
  .taxonomy-card {
    width: 350px;
    padding: 30px;
  }
  
  .content-card {
    padding: 35px;
  }
  
  #chart {
    height: 650px;
    padding: 25px;
  }
  
  .search-container {
    margin: 25px 0;
  }
  
  .species-search {
    width: 350px;
    font-size: 1rem;
    padding: 10px 15px;
  }
  
  .species-table th,
  .species-table td {
    padding: 15px 20px;
  }
  
  .pagination {
    margin-top: 25px;
  }
  
  .page-btn {
    min-width: 40px;
    padding: 8px 12px;
    font-size: 1rem;
  }
}

/* 平板端适配增强 */
@media (min-width: 768px) and (max-width: 1024px) {
  main {
    padding: 25px;
  }
  
  .col-auto {
    width: 300px;
  }
  
  .taxonomy-card {
    width: 300px;
    padding: 25px;
    height: 650px;
  }
  
  .content-card {
    padding: 25px;
  }
  
  .taxonomy-title {
    font-size: 22px;
  }
  
  .q-tree {
    font-size: 18px;
  }
  
  #chart {
    height: 550px;
    padding: 20px;
  }
  
  .species-search {
    width: 300px;
  }
  
  .species-table {
    font-size: 14px;
    overflow-x: auto;
  }
  
  .species-table th,
  .species-table td {
    padding: 12px 15px;
    min-width: 120px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .page-btn {
    min-width: 36px;
    font-size: 0.9rem;
  }
}

/* 手机端适配增强 */
@media (max-width: 767px) {
  main {
    padding: 15px 10px;
    min-height: 500px;
  }
  
  .row {
    flex-direction: column;
    gap: 15px;
  }
  
  .col-auto {
    width: 100%;
    order: 1;
  }
  
  .col {
    width: 100%;
    order: 2;
  }
  
  .taxonomy-card {
    width: 100%;
    height: 200px;
    padding: 15px;
    overflow-y: auto;
  }
  
  .taxonomy-title {
    font-size: 18px;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .q-tree {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .q-tree__node {
    margin: 8px 0;
  }
  
  .q-tree__node-header {
    padding: 8px 12px;
    border-radius: 8px;
    width: auto;
  }
  
  .content-card {
    padding: 15px;
  }
  
  .content-title {
    font-size: 18px;
    text-align: center;
    margin-bottom: 15px;
  }
  
  #chart {
    height: 300px;
    padding: 10px;
    margin-top: 15px;
  }
  
  .search-container {
    margin: 15px 0;
    justify-content: center;
  }
  
  .species-search {
    width: 100%;
    max-width: 280px;
    font-size: 16px;
    padding: 12px 15px;
  }
  
  /* 表格移动端卡片化 */
  .species-table {
    display: none;
  }
  
  .mobile-species-list {
    display: block;
  }
  
  .species-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #0c8c42;
  }
  
  .species-card-header {
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    font-size: 1rem;
  }
  
  .species-card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .species-detail {
    display: flex;
    flex-direction: column;
  }
  
  .detail-label {
    font-weight: 600;
    color: #666;
    font-size: 0.8rem;
    margin-bottom: 2px;
  }
  
  .detail-value {
    color: #333;
  }
  
  .species-card-actions {
    text-align: center;
    margin-top: 10px;
  }
  
  .download-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 15px;
    background-color: #0c8c42;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.85rem;
    transition: background-color 0.3s ease;
  }
  
  .download-link:hover {
    background-color: #075f2c;
  }
  
  /* 分页控件移动端优化 */
  .pagination {
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
    text-align: center;
  }
  
  .page-controls {
    display: flex;
    justify-content: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
    padding: 0;
  }
}

/* 超小屏幕适配 */
@media (max-width: 479px) {
  main {
    padding: 10px 5px;
  }
  
  .taxonomy-card {
    height: 150px;
    padding: 12px;
  }
  
  .taxonomy-title {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .q-tree {
    font-size: 13px;
  }
  
  .content-card {
    padding: 12px;
  }
  
  .content-title {
    font-size: 16px;
  }
  
  #chart {
    height: 250px;
    padding: 8px;
  }
  
  .species-search {
    font-size: 14px;
    padding: 10px 12px;
  }
  
  .species-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .species-card-header {
    font-size: 0.9rem;
  }
  
  .species-card-details {
    grid-template-columns: 1fr;
    gap: 6px;
    font-size: 0.8rem;
  }
  
  .detail-label {
    font-size: 0.75rem;
  }
  
  .download-link {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .taxonomy-card {
    height: 120px;
  }
  
  #chart {
    height: 200px;
  }
  
  .row {
    flex-direction: row;
  }
  
  .col-auto {
    width: 200px;
    order: 1;
  }
  
  .col {
    flex: 1;
    order: 2;
  }
  
  .species-card-details {
    grid-template-columns: 1fr 1fr;
  }
}

/* 桌面端显示表格，隐藏移动端卡片 */
@media (min-width: 768px) {
  .mobile-species-list {
    display: none;
  }
  
  .species-table {
    display: table;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .q-tree__node-header {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .species-search {
    min-height: 44px;
  }
  
  .download-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .page-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .species-card {
    padding: 18px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .taxonomy-card,
  .content-card,
  .species-card {
    border: 2px solid #000;
  }
  
  .species-search {
    border: 2px solid #000;
  }
  
  .species-search:focus {
    outline: 3px solid #000;
  }
  
  .download-link {
    border: 2px solid #000;
  }
  
  .page-btn {
    border: 2px solid #000;
  }
  
  .q-tree__node-header.selected {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .q-tree__node-header,
  .download-link,
  .page-btn,
  .species-card,
  #chart {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .protein-data {
    background: white;
  }
  
  .search-container,
  .pagination {
    display: none;
  }
  
  main {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .taxonomy-card,
  .content-card {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .species-card {
    border: 1px solid #000;
    box-shadow: none;
    break-inside: avoid;
  }
  
  #chart {
    border: 1px solid #000;
  }
  
  .species-table {
    font-size: 10px;
  }
}
</style> 