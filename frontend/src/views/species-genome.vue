<template>
    <div class="species-genome">
        <Header />

        <!-- 主体内容区 -->
        <main>
            <div class="row q-col-gutter-md">
                <!-- 左侧分类部分 -->
                <div class="col-auto">
                    <div class="ui-card full-height taxonomy-card">
                        <div class="ui-left-bordered-title taxonomy-title" @click="handleTaxonomyTitleClick">🌲Taxonomy
                        </div>
                        <ul class="q-tree">
                            <li v-for="category in taxonomyCategories" :key="category"
                                class="q-tree__node q-tree__node--parent" :data-category="category"
                                @click="handleCategoryClick(category)">
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
                            {{ showTable ? `Species of ${currentCategory}` : 'Category Distribution' }}
                        </div>

                        <!-- 搜索框 - 仅在表格显示时可见 -->
                        <div class="search-container" v-if="showTable">
                            <input type="text" v-model="searchQuery" placeholder="Search species..."
                                class="species-search" @input="handleSearch" />
                        </div>

                        <!-- 图表区域 - 初始状态显示 -->
                        <div id="chart" ref="chartContainer" v-show="!showTable"></div>

                        <!-- 表格区域 - 点击分类后显示 -->
                        <div class="species-table" v-show="showTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th @click="sortTable('clade')">Clade <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('order')">Order <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('family')">Family <span class="sort-icon">⇅</span></th>
                                        <th @click="sortTable('species')">Species <span class="sort-icon">⇅</span></th>
                                        <th>Genome</th>
                                        <th>Protein</th>
                                        <th>CDS</th>
                                        <th>GFF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(species, index) in paginatedSpeciesData" :key="index"
                                        :class="{ 'even-row': index % 2 === 1 }" :data-species="species.species">
                                        <td>{{ species.clade }}</td>
                                        <td>{{ species.order }}</td>
                                        <td>{{ species.family }}</td>
                                        <td>
                                            <router-link
                                                :to="{ path: '/species-table', query: { species: species.species } }"
                                                class="species-link">
                                                {{ species.species }}
                                            </router-link>
                                        </td>
                                        <td class="download-cell">
                                            <a href="#" @click.prevent="handleDownload(species, 'genome')"
                                                class="download-link">
                                                <span class="download-icon">⬇</span> Download
                                            </a>
                                        </td>
                                        <td class="download-cell">
                                            <a href="#" @click.prevent="handleDownload(species, 'protein')"
                                                class="download-link">
                                                <span class="download-icon">⬇</span> Download
                                            </a>
                                        </td>
                                        <td class="download-cell">
                                            <a href="#" @click.prevent="handleDownload(species, 'cds')"
                                                class="download-link">
                                                <span class="download-icon">⬇</span> Download
                                            </a>
                                        </td>
                                        <td class="download-cell">
                                            <a href="#" @click.prevent="handleDownload(species, 'gff')"
                                                class="download-link">
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
                                    {{ Math.min(currentPage * itemsPerPage, filteredSpeciesData.length) }}
                                    fo {{ filteredSpeciesData.length }} Species
                                </span>
                                <div class="page-controls">
                                    <button class="page-btn" @click="goToPage(1)" :disabled="currentPage === 1">Home</button>
                                    <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">«</button>
                                    <button v-for="page in pageButtons" :key="page" class="page-btn"
                                        :class="{ 'active': currentPage === page }" @click="goToPage(page)">
                                        {{ page }}
                                    </button>
                                    <button class="page-btn" @click="nextPage"
                                        :disabled="currentPage === totalPages">»</button>
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
import type { ECharts } from 'echarts'
import * as echarts from 'echarts/core'
import {
    BarChart,
    // 其他图表添加
} from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    // 其他组件添加
} from 'echarts/components'
import {
    CanvasRenderer
} from 'echarts/renderers'
import * as XLSX from 'xlsx/xlsx.mjs'

// 注册必需组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    BarChart,
    CanvasRenderer
])

// 分类数据（mingjingli）
const taxonomyCategories = [
    'Core Eudicots/Rosids',
    'Core Eudicots/Asterids',
    'Basal Eudicots',
    'Monocots',
    'Chlorophyceae',
    'Zygnematophyceae',
    'Ulvophyceae',
    'Trebouxiophyceae',
    'Pyramimonadophyceae',
    'Polypodiopsida',
    'Pinopsida',
    'Mesostigmatophyceae',
    'Marchantiopsida',
    'Mamiellophyceae',
    'Lycopodiopsida',
    'Klebsormidiophyceae',
    'Gnetopsida',
    'Glaucocystophyceae',
    'Ginkgoopsida',
    'Florideophyceae',
    'Eudicotyledoneae',
    'Chloropicophyceae',
    'Chlorokybophyceae',
    'Chlorodendrophyceae',
    'Charophyceae',
    'Bryopsida',
    'Bangiophyceae',
    'Anthocerotopsida'
];

// 图表统计类别（只保留主要几类）
const chartMainCategories = [
    'Core Eudicots/Rosids',
    'Core Eudicots/Asterids',
    'Basal Eudicots',
    'Monocots',
    'Chlorophyceae',
    'Other'
];

// 分类统计数据
const categoryStats = ref<{ name: string, count: number }[]>([]);

// 加载主要分类的物种数量
const loadAllCategoryStats = async () => {
    const stats: { name: string, count: number }[] = [];
    for (const category of chartMainCategories) {
        if (category === 'Other') {
            // 统计剩余所有分类的总和
            let otherCount = 0;
            for (const cat of taxonomyCategories) {
                if (!chartMainCategories.includes(cat)) {
                    try {
                        const filePath = `./data/${cat.replace(/\//g, '_')}.xlsx`;
                        const response = await fetch(filePath);
                        if (!response.ok) continue;
                        const data = await response.arrayBuffer();
                        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                            raw: true,
                            defval: '',
                            blankrows: false
                        });
                        otherCount += jsonData.filter((item: any) => (item.Species || item.species || item['Species（种）'])).length;
                    } catch (e) { }
                }
            }
            stats.push({ name: 'Other', count: otherCount });
        } else {
            try {
                const filePath = `./data/${category.replace(/\//g, '_')}.xlsx`;
                const response = await fetch(filePath);
                if (!response.ok) {
                    stats.push({ name: category, count: 0 });
                    continue;
                }
                const data = await response.arrayBuffer();
                const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                    raw: true,
                    defval: '',
                    blankrows: false
                });
                const count = jsonData.filter((item: any) => (item.Species || item.species || item['Species（种）'])).length;
                stats.push({ name: category, count });
            } catch (e) {
                stats.push({ name: category, count: 0 });
            }
        }
    }
    categoryStats.value = stats;
}

// 图表相关
const chartContainer = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const currentCategoryDetails = ref('Select a category to see the details here.')

// 控制显示表格还是图表
const showTable = ref(false)
const currentCategory = ref('')

// 添加一个变量用于跟踪当前加载的分类
const loadingCategory = ref('');
// 添加一个变量用于存储每个分类的数据
const categoryDataMap = ref<Record<string, SpeciesData[]>>({});
// 添加一个变量用于存储 AbortController
let currentFetchController: AbortController | null = null;

// 更新类型定义(mingjingli)
interface SpeciesData {
    clade: string;
    order: string;
    family: string;
    species: string;
    genome: string;
    protein: string;
    cds: string;
    gff: string;
}

// 示例物种数据(mingjingli)
const speciesData = ref<SpeciesData[]>([
    {
        clade: 'Basal Eudicots',
        order: 'Berberidopsidales',
        family: 'Aextoxicaceae',
        species: 'Aextoxicon punctatum',
        genome: '',
        protein: '',
        cds: '',
        gff: ''
    }
])

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

    // 根据分类获取对应的Excel文件路径
    const filePath = `./data/${category.replace(/\//g, '_')}.xlsx`;

    // 显示加载中状态
    speciesData.value = [{
        clade: category,
        order: 'Loading...',
        family: 'Loading...',
        species: 'Loading data, please wait...',
        genome: 'Loading',
        protein: 'Loading',
        cds: 'Loading',
        gff: 'Loading'
    }];

    fetch(filePath, { signal: currentFetchController.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error('Excel file not found');
            }
            return response.arrayBuffer();
        })
        .then(data => {
            console.log('Excel file content:', new Uint8Array(data));
            // 确保当前分类没有改变，防止加载过程中切换了分类
            if (loadingCategory.value !== category) return;

            try {
                // 使用更基础的选项读取Excel文件
                const workbook = XLSX.read(new Uint8Array(data), {
                    type: 'array',
                    raw: true,
                    cellFormula: false,
                    cellHTML: false,
                    cellStyles: false,
                    cellDates: false,
                    cellNF: false,
                    cellText: false
                });

                // 获取第一个工作表
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // 将工作表转换为JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                    raw: true,
                    defval: '',
                    blankrows: false
                });

                // 转换数据格式
                const processedData = jsonData.map((item: any) => {
                    // 确保所有必需的字段都存在，兼容中文表头（mingjingli）
                    const row = {
                        clade: String(item.Clade || item.clade || item['Clade（类群）'] || category),
                        order: String(item.Order || item.order || item['Order（目）'] || ''),
                        family: String(item.Family || item.family || item['Family（科）'] || ''),
                        species: String(item.Species || item.species || item['Species（种）'] || ''),
                        genome: String(item.Genome || item.genome || item['Genome（基因组）'] || ''),
                        protein: String(item.Pro || item.pro || item['Pro'] || ''),
                        cds: String(item.CDS || item.cds || item['CDS'] || ''),
                        gff: String(item.GFF || item.gff || item['GFF'] || '')
                    };

                    // 验证数据
                    if (!row.species) {
                        console.warn('Empty species name found in row:', item);
                    }

                    return row;
                }).filter(row => row.species); // 过滤掉没有物种名的行

                console.log('Family列内容示例：', processedData.map(row => row.family));

                // 存储到缓存中
                categoryDataMap.value[category] = processedData;

                // 更新显示数据
                speciesData.value = processedData;

                console.log(`Successfully loaded ${processedData.length} rows for ${category}`);
            } catch (error) {
                console.error('Error processing Excel data:', error);
                throw error;
            }
        })
        .catch(error => {
            // 忽略取消请求的错误
            if (error.name === 'AbortError') return;

            console.error('Failed to load Excel data:', error);

            // 确保当前分类没有改变
            if (loadingCategory.value !== category) return;

            // 加载失败时使用默认数据
            const defaultData = [
                {
                    clade: category,
                    order: 'Error',
                    family: 'Error',
                    species: `Failed to load data: ${error.message}`,
                    genome: '',
                    protein: '',
                    cds: '',
                    gff: ''
                }
            ];

            // 存储到缓存中
            categoryDataMap.value[category] = defaultData;

            // 更新显示数据
            speciesData.value = defaultData;
        })
        .finally(() => {
            if (loadingCategory.value === category) {
                currentFetchController = null;
            }
        });
}

// 处理下载按钮点击事件
const handleDownload = (species: SpeciesData, type: string) => {
    // 根据类型构建不同的下载路径
    let filePath = '';
    switch (type) {
        case 'genome':
            filePath = species.genome;
            break;
        case 'protein':
            filePath = species.protein;
            break;
        case 'cds':
            filePath = species.cds;
            break;
        case 'gff':
            filePath = species.gff;
            break;
        default:
            console.error('Unknown download type:', type);
            return;
    }

    if (!filePath) {
        console.error(`No ${type} file available for ${species.species}`);
        return;
    }

    // 触发下载
    window.open(filePath, '_blank');
}

// 图表
const getDefaultChartOption = () => {
    // 动态数据
    const categories = categoryStats.value.map(item => item.name);
    const samples = categoryStats.value.map(item => item.count);
    const colors = [
        '#86c1bd', '#3c9a76', '#e6f8f1', '#E2F2FF', '#acdfcb', '#e5c674', '#159989'
    ];
    return {
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                return `
          <strong>Clade:</strong> ${params.name}<br>
          <strong>Samples:</strong> ${params.value}
        `
            },
        },
        xAxis: { type: 'value' },
        yAxis: {
            type: 'category',
            data: categories,
        },
        series: [{
            type: 'bar',
            data: samples.map((value, index) => ({
                value,
                itemStyle: {
                    color: colors[index % colors.length],
                    borderWidth: 2,
                    borderColor: 'black',
                    borderRadius: 20
                }
            })),
            barWidth: 32
        }]
    }
}

// 修改初始化函数
const initChart = () => {
    if (chartContainer.value) {
        chart = echarts.init(chartContainer.value)
        chart.setOption(getDefaultChartOption()) // 使用统一配置
    }
}

// 修改处理分类点击的函数
const handleCategoryClick = (category: string) => {
    console.log(`Clicked on category: ${category}`)
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
    currentCategoryDetails.value = 'Select a category to see the details here.'
}

// 表格排序功能
const sortTable = (column: string) => {
    // 实现表格排序逻辑
    // 这里可以根据需要实现升序/降序排序
    console.log(`Sorting by ${column}`)
}

// 添加窗口大小变化监听
const handleResize = () => {
    if (chart) {
        chart.resize();
        chart.setOption(getDefaultChartOption());
    }
}

// 生命周期钩子
onMounted(async () => {
    await loadAllCategoryStats();
    initChart();
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
        species.species.toLowerCase().includes(query) ||
        species.family.toLowerCase().includes(query) ||
        species.order.toLowerCase().includes(query) ||
        species.clade.toLowerCase().includes(query)
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

// 跳转到包含特定物种的页面
const scrollToSpecies = (speciesName: string) => {
    const index = speciesData.value.findIndex(s =>
        s.species.toLowerCase().includes(speciesName.toLowerCase())
    )

    if (index !== -1) {
        // 计算物种所在的页码
        const page = Math.floor(index / itemsPerPage) + 1
        currentPage.value = page

        // 等待DOM更新后滚动到该行
        setTimeout(() => {
            const row = document.querySelector(`tr[data-species="${speciesData.value[index].species}"]`)
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // 添加高亮效果
                row.classList.add('highlight')
                setTimeout(() => row.classList.remove('highlight'), 2000)
            }
        }, 100)
    }
}

const selectedCategory = ref('')
</script>

<style scoped>
/* 主容器样式 */
.species-genome {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-image: linear-gradient(20deg, #fafafa, #abdfcb, #faf5f0, #ffffff);
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
    border-radius: 20px;
    background-color: #abdfcb;
    /* 浅绿色背景 */
    height: 735px;
    /* 固定高度，大约显示15行 */
    overflow-y: auto;
    /* 添加垂直滚动条 */
    overflow-x: hidden;
    /* 隐藏水平滚动条 */
    direction: rtl;
    /* 将内容方向设置为从右到左 */

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
        width: 6px;
        background-color: transparent;
        margin-right: auto;
        /* 将滚动条推到左侧 */
    }

    &::-webkit-scrollbar-thumb {
        background-color: #abdfcb;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}

/* 恢复内容的正常方向 */
.q-tree {
    direction: ltr;
    /* 将树形菜单内容方向恢复为从左到右 */
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
    cursor: pointer;
    /* 鼠标悬停时显示手指指针 */
    transition: color 0.3s;
    /* 颜色过渡效果 */
}

.taxonomy-title:hover {
    color: #ffffff;
    /* 悬停时改变颜色 */
}

/* 分类树样式 */
/* 左分类样式 */
.taxonomy-card {
    padding: 20px;
    width: 300px;
    min-height: 584px;
}

.taxonomy-title {
    margin-bottom: 20px;
}

.q-tree {
    font-size: 16px;
    line-height: 1.4;
    margin: 0;
    /* 调整每项的间距 */
    padding: 0;
    font-weight: bold;
}

/* 左分类上下间距 */
.q-tree__node {
    list-style: none;
    margin: 8px 0;
    /* 调整每项的间距 */
    padding: 4px 0;
}

.q-tree__node--parent {
    cursor: pointer;
    /* 鼠标变手指 */
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
    height: 500px;
    margin-top: 100px;
}

/* 右侧内容区卡片样式 */
.col .ui-card {
    border-radius: 20px;
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

    .taxonomy-title,
    .content-title {
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
    font-size: 10px;
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

/* 修改链接样式 */
.species-link {
    text-decoration: none;
    /* 去除下划线 */
    color: #0c8c42;
    /* 字体颜色为黑色 */
}

.species-link:hover {
    text-decoration: underline;
    color: #0c8c42;
    /* 悬停时字体颜色 */
}

/* 下载单元格样式 */
.download-cell {
    text-align: left;
    /* 左对齐 */
}
</style>
