<template>
    <div class="protein-data">
        <Header />
        
        <!-- 主内容区域 -->
        <main>
            <div class="row q-col-gutter-md">
                <!-- 左边的分类部分 -->
                <div class="col-auto">
                    <div class="ui-card full-height taxonomy-card">
                        <div class="ui-left-bordered-title taxonomy-title" @click="handleTaxonomyTitleClick">Flavonoid Pathways</div>
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

                <!-- 右边内容显示部分 -->
                <div class="col">
                    <div id="content-area" class="ui-card full-height content-card">
                        <div class="ui-left-bordered-title content-title">
                            {{ currentCategory ? `${currentCategory} Gene Distribution` : 'Flavonoid Pathway Distribution' }}
                        </div>
                        
                        <!-- 物种搜索框 - 仅在选择分类时可见 -->
                        <div class="search-container" v-if="currentCategory">
                            <div class="search-example" @click="fillExampleSpecies">e.g. Oryza_sativa</div>
                            <input 
                                type="text" 
                                v-model="speciesSearchQuery" 
                                placeholder="Search species..." 
                                class="species-search"
                                @keyup.enter="handleSpeciesSearch"
                            />
                            <button class="search-btn" @click="handleSpeciesSearch">Search</button>
                        </div>
                        
                        <!-- 图表区域 -->
                        <div id="chart" ref="chartContainer" v-show="!showSpeciesDetail" @click.stop></div>
                        
                        <!-- 物种详情表 - 当点击物种时显示 -->
                        <!-- 物种详情表 - 当点击物种时显示 -->
                        <div class="species-detail" v-if="showSpeciesDetail">
                            <div class="detail-header">
                                <h3>{{ selectedSpecies }} Genes</h3>
                                <button class="back-btn" @click="handleBackToChart">Back to Chart</button>
                            </div>
                            <div class="species-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th v-for="header in speciesTableHeaders" :key="header" :class="getHeaderClass(header)">{{ header }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(row, index) in speciesTableData"
                                            :key="index"
                                            :class="{ 'even-row': index % 2 === 1 }"
                                        >
                                            <td
                                            v-for="(cell, cellIndex) in row"
                                            :key="cellIndex"
                                            :class="getHeaderClass(speciesTableHeaders[Number(cellIndex)] ?? '')"
                                            :title="String(cell ?? '')"
                                            >
                                            {{ cell }}
                                            </td>
                                        </tr>
                                        </tbody>
                                </table>
                            </div>
                            <div class="export-container">
                                <button class="export-btn" @click="exportSpeciesData">Export Excel</button>
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
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components'
import { PieChart, TreemapChart, BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import * as XLSX from 'xlsx/xlsx.mjs'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  PieChart,
  TreemapChart,
  BarChart,
  CanvasRenderer
])

// 分类数据
const taxonomyCategories = [
                       "Flavonols",
                        "Flavones",
                        "Flavanones",
                        "Isoflavones", 
                        "Anthocyanins",
                        "Flavanols",
                        "Phenylpropanoid",
]

// 图表相关
const chartContainer = ref<HTMLElement | null>(null)
let chart: ECharts | null = null
const currentCategoryDetails = ref('Select a category to view details.')

// 控制显示状态
const currentCategory = ref('')

// 添加一个变量用于跟踪当前加载的分类
const loadingCategory = ref('');
// 添加一个变量用于存储每个分类的图表数据
const categoryChartDataMap = ref<Record<string, {categoryData: string[], valueData: number[]}>>({});
// 添加一个变量用于存储 AbortController
let currentFetchController: AbortController | null = null;

// Species detail related variables
const showSpeciesDetail = ref(false);
const selectedSpecies = ref('');
const speciesTableHeaders = ref<string[]>([]);
const speciesTableData = ref<string[][]>([]);
const speciesSearchQuery = ref('');
const currentCategorySpecies = ref<string[]>([]);

// 生成随机数据的辅助函数 - 生成1031个物种的数据
const generateRandomData = (category: string, count: number = 1031) => {
    const categoryData: string[] = [];
    const valueData: number[] = [];
    
    for (let i = 0; i < count; i++) {
        categoryData.push(`${category} Species ${i+1}`);
        valueData.push(Math.floor(Math.random() * 21)); // 生成0-20之间的随机整数
    }
    
    // Store species list for search functionality
    currentCategorySpecies.value = [...categoryData];
    
    return { categoryData, valueData };
}

// 修改加载数据函数
const loadPathwayData = (category: string) => {
    loadingCategory.value = category;

    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();

    // 检查缓存
    if (categoryChartDataMap.value[category]) {
        updateCategoryChart(category, categoryChartDataMap.value[category]);
        currentCategorySpecies.value = categoryChartDataMap.value[category].categoryData;
        return;
    }

    if (chart) {
        chart.showLoading({
            text: 'Loading data...',
            color: '#86c1bd',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0
        });
    }

    // 1. 先获取清单文件
    fetch('./fla-data/manifest.json', { signal: currentFetchController?.signal })
        .then(response => {
            if (!response.ok) throw new Error('manifest.json not found');
            return response.json();
        })
        .then(manifest => {
            // 2. 从清单中找到当前分类对应的文件列表
            const pathwayKey = `${category.replace(/ /g, '')}_genes`;
            const fileList = manifest[pathwayKey];

            if (!fileList || fileList.length === 0) {
                console.warn(`No files found for category ${category} in manifest.json`);
                updateCategoryChart(category, { categoryData: [], valueData: [] });
                return Promise.reject(`No files listed for ${category}`); // 中断 Promise 链
            }
            
            // 3. 为列表中的每个文件创建一个 fetch 请求
            const fetchPromises = fileList.map((fileName: string) => {
                const filePath = `./fla-data/${pathwayKey}/${fileName}`;
                return fetch(filePath, { signal: currentFetchController?.signal }) // 使用可选链操作符
                    .then(res => {
                        if (!res.ok) throw new Error(`${fileName} not found`);
                        return res.text();
                    })
                    .then(tsvData => {
                        // 计算行数 (总行数 - 1 作为表头)，过滤空行
                        const rowCount = tsvData.trim().split('\n').filter(line => line).length - 1;
                        
                        // 从文件名中提取物种名称
                        const speciesName = fileName.replace(`_${category.replace(/ /g, '')}.tsv`, '');
                        
                        return { species: speciesName, count: rowCount > 0 ? rowCount : 0 };
                    });
            });

            // 4. 等待所有文件都处理完毕
            return Promise.all(fetchPromises);
        })
        .then(speciesData => {
            if (!speciesData) return;

            // 5. 准备 ECharts 需要的数据格式
            const categoryData: string[] = speciesData.map(item => item.species);
            const valueData: number[] = speciesData.map(item => item.count);

            currentCategorySpecies.value = [...categoryData];
            
            const chartData = { categoryData, valueData };
            categoryChartDataMap.value[category] = chartData;

            // 6. 更新图表
            updateCategoryChart(category, chartData);
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            console.error('Failed to load pathway data:', error);
            updateCategoryChart(category, { categoryData: ["Error Loading Data"], valueData: [0] });
        })
        .finally(() => {
            if (chart) chart.hideLoading();
            if (loadingCategory.value === category) {
                currentFetchController = null;
            }
        });
}


//定义表头名转化为css类名
const getHeaderClass = (header: string) => {
  if (!header) return '';
  // 将 "e-value" 转换为 "col-e-value"
  return `col-${header.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
};

// 添加更新分类图表的函数
const updateCategoryChart = (category: string, chartData: {categoryData: string[], valueData: number[]}) => {
    if (!chart) return;
    
    // 先清除图表，避免堆叠问题
    chart.clear();
    
    const option = {
        title: {
            //text: `${category} Gene Distribution (${chartData.categoryData.length} species)`,
            text: `${category} Gene Distribution`,
            left: 10
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                saveAsImage: {
                    pixelRatio: 2
                }
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            top: 60,        // 增加顶部空间
            bottom: 200,    // 增加底部空间
            left: 100,      // 保持左侧空间
            right: 40       // 增加右侧空间
        },
        dataZoom: [
            {
                type: 'inside'
            },
            {
                type: 'slider',
                bottom: 40,  // 调整滑块位置
                borderColor: '#e5c674',  // 滑块边框颜色
                handleStyle: {
                    color: '#e5c674',    // 手柄颜色
                    borderColor: '#e5c674'  // 手柄边框颜色
                },
                moveHandleStyle: {
                    color: '#86c1bd'     // 移动手柄颜色
                },
                selectedDataBackground: {
                    lineStyle: {
                        color: '#e5c674'  // 选中区域线条颜色
                    },
                    areaStyle: {
                        color: '#e5c674'  // 选中区域填充颜色
                    }
                },
                emphasis: {
                    handleStyle: {
                        color: '#e5c674'  // 手柄高亮颜色
                    }
                }
            }
        ],
        xAxis: {
            data: chartData.categoryData,
            silent: false,
            splitLine: {
                show: false
            },
            splitArea: {
                show: false
            },
            axisLabel: {
                interval: 'auto',
                rotate: 60,
                margin: 10,    // 增加标签与轴线的距离
                
                formatter: function(value: string) {
                    if (value.length > 18) {
                        return value.substring(0, 12) + '...';
                    }
                    return value;
                }
            }
        },
        yAxis: {
            name: 'Gene Count',
            splitArea: {
                show: false
            }
        },
        series: [
            {
                name: category,
                type: 'bar',
                data: chartData.valueData,
                large: true,
                itemStyle: {
                    color: '#86c1bd'
                }
            }
        ]
    };
    
    // 为每个柱子添加点击事件
    chart.off('click');
    chart.on('click', function(params) {
        // 仅在点击系列中的柱子时触发
        if (params.componentType === 'series' && params.seriesType === 'bar') {
            const speciesName = params.name;
            handleSpeciesClick(speciesName);
        }
    });
    
    chart.setOption(option, true);
}

// 处理物种点击
const handleSpeciesClick = (speciesName: string) => {
    selectedSpecies.value = speciesName;
    loadSpeciesDetail(speciesName);
}

// 加载物种详情数据
const loadSpeciesDetail = (speciesName: string) => {
    showSpeciesDetail.value = true;
    speciesTableHeaders.value = ['Loading...'];
    speciesTableData.value = [['Please wait...']];

    // --- 1. 在这里定义你想要显示的列名 (白名单) ---
    // 自由地添加、删除或调整这里的顺序
    const DESIRED_HEADERS = [
        'subject_id', 'Function','function','query','query_id','pident', 'qStart','qstart', 'qEnd', 'qend','tStart', 'tstart','tEnd','tend', 'alnlen', 'nIdent','nident', 'nPos','npos', 'e-value', 'evalue','bitscore', 'ec_number','ecnumber', 'description',
    ];

    const formattedSpeciesName = speciesName.replace(/ /g, '_');
    const pathwayName = currentCategory.value.replace(/ /g, '');
    const filePath = `./fla-data/${pathwayName}_genes/${formattedSpeciesName}_${pathwayName}.tsv`;
    
    console.log(`Attempting to load TSV data from: ${filePath}`);
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error(`TSV file not found at ${filePath}`);
            return response.text();
        })
        .then(tsvData => {
            const rows = tsvData.trim().split('\n').filter(line => line);
            
            if (rows.length > 0) {
                // --- 2. 核心修改：根据白名单过滤数据 ---
                const allHeaders = rows[0].trim().split('\t');
                const allDataRows = rows.slice(1);

                // a. 找到我们想要的列在原始数据中的索引位置
                const desiredColumnIndices: number[] = [];
                const finalHeaders: string[] = [];

                DESIRED_HEADERS.forEach(desiredHeader => {
                    const index = allHeaders.indexOf(desiredHeader);
                    if (index > -1) {
                        desiredColumnIndices.push(index);
                        finalHeaders.push(desiredHeader);
                    }
                });
                
                // b. 生成最终的表头和表格数据
                speciesTableHeaders.value = finalHeaders;
                speciesTableData.value = allDataRows.map(row => {
                    const cells = row.trim().split('\t');
                    // 只挑选出我们想要的列
                    return desiredColumnIndices.map(index => cells[index]);
                });

            } else {
                speciesTableHeaders.value = ['No data'];
                speciesTableData.value = [['No data found in file']];
            }
        })
        .catch(error => {
            console.error('Failed to load species TSV data:', error);
            // 您的模拟数据后备逻辑保持不变
            speciesTableHeaders.value = ['geneID', 'SseqID', 'Identity(%)', 'E-value', 'Score'];
            const mockData = [];
            for (let i = 0; i < 10; i++) {
                mockData.push([
                    `NC_08${i+1}${i*1}${i+3}${i}.1`, `osa: ${i+1}32932${i+1}`,
                    `${Math.floor(Math.random() * 5) + 95}`, `${1}e-${i+20}`,
                    `${Math.floor(Math.random() * 500) + 500}`, pathwayName,
                    `${Math.floor(Math.random() * 100 + 50)}`
                ]);
            }
            speciesTableData.value = mockData;
            console.log(`Attempted file path was: ${filePath}`);
        });
}
    
    // 使用 Promise.allSettled 替代 Promise.any
    //Promise.allSettled(filePaths.map(path => 
        //fetch(path)
           // .then(response => {
                //if (!response.ok) {
                   // throw new Error(`${path} file not found`);
                //}
                //console.log(`successfully found file: ${path}`);
                //return response.arrayBuffer();
            //})
   // ))
    //.then(results => {
        // 查找第一个成功的结果
        //const successResult = results.find(result => result.status === 'fulfilled');
        
        //if (successResult && successResult.status === 'fulfilled') {
            // 处理成功的数据
            //const data = successResult.value;
            //const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            //const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            //const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            // 提取表头和数据
            //if (jsonData.length > 0) {
                //speciesTableHeaders.value = jsonData[0] as string[];
                //speciesTableData.value = jsonData.slice(1);
            //} else {
                //speciesTableHeaders.value = ['no data'];
                //speciesTableData.value = [['no data']];
            //}
        //} else {
            // 所有请求都失败时，抛出错误
            //throw new Error('All requests failed');
        //}
    //})
    //.catch(error => {
        //console.error('failed to load species data:', error);
        
        // 显示错误信息并生成模拟数据
        //speciesTableHeaders.value = ['geneID', 'SseqID', 'Identity(%)', 'E-value', 'Score'];
        
        //const mockData = [];
        //for (let i = 0; i < 10; i++) {
            //mockData.push([
                //`NC_08${i+1}${i*1}${i+3}${i}.1`,
                //`osa: ${i+1}32932${i+1}`,
                //`${Math.floor(Math.random() * 5) + 95}`,  // 95-99的随机数
                //`${1}e-${i+20}`,
                //`${Math.floor(Math.random() * 500) + 500}`,
                //pathwayName,
                //`${Math.floor(Math.random() * 100 + 50)}`
            //]);
        //}
        
        // 添加一条说明行
        //speciesTableData.value = mockData;
        
        // 在控制台输出详细错误信息，方便调试
        //console.log(`attempted file paths:`, filePaths);
    //});
//}

// Handle back button click
const handleBackToChart = () => {
    showSpeciesDetail.value = false;
    selectedSpecies.value = '';
}

// Handle species search
const handleSpeciesSearch = () => {
    if (!speciesSearchQuery.value) return;
    
    const query = speciesSearchQuery.value.toLowerCase();
    
    // 1. 先尝试精确匹配
    let matchedSpecies = currentCategorySpecies.value.find(
        species => species.toLowerCase() === query
    );
    
    // 2. 如果没有精确匹配，尝试部分匹配
    if (!matchedSpecies) {
        matchedSpecies = currentCategorySpecies.value.find(
            species => species.toLowerCase().includes(query)
        );
    }
    
    // 3. 如果仍然没找到，直接使用输入的查询词
    if (!matchedSpecies) {
        console.log(`no match found, using input value: ${speciesSearchQuery.value}`);
        // 直接使用用户输入的物种名称
        handleSpeciesClick(speciesSearchQuery.value);
    } else {
        handleSpeciesClick(matchedSpecies);
    }
}

// Fill example species in search box
const fillExampleSpecies = () => {
    speciesSearchQuery.value = "Oryza_sativa";
}

// Export species data to Excel
const exportSpeciesData = () => {
    const pathwayName = currentCategory.value.replace(/ /g, '');
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([speciesTableHeaders.value, ...speciesTableData.value]);
    XLSX.utils.book_append_sheet(wb, ws, selectedSpecies.value);
    
    // 更新导出的文件名，去掉 "_genes"
    XLSX.writeFile(wb, `${selectedSpecies.value.replace(/ /g, '_')}_${pathwayName}.xlsx`);
    // 获取当前通路名称
    //const pathwayName = currentCategory.value
    //    .replace(' ', '')
    //    .replace(' ', '')
    //    .replace(' ', '')
    //    .replace(' ', '');
    
    // 创建新的工作簿
    //const wb = XLSX.utils.book_new();
    
    // 转换数据为工作表
    //const ws = XLSX.utils.aoa_to_sheet([speciesTableHeaders.value, ...speciesTableData.value]);
    
    // 添加工作表到工作簿
    //XLSX.utils.book_append_sheet(wb, ws, selectedSpecies.value);
    
    // 生成Excel文件并触发下载，包含通路信息
    //XLSX.writeFile(wb, `${selectedSpecies.value.replace(/ /g, '_')}_${pathwayName}_genes.xlsx`);

}

// 修改图表配置函数
const getDefaultChartOption = () => {
  const defaultData = {
    categories: [       "Flavonols",
                        "Flavones",
                        "Flavanones",
                        "Isoflavones", 
                        "Anthocyanins",
                        "Flavanols",
                        "Phenylpropanoid",],
    samples: [421810, 268172, 396675, 360611, 463795, 278059, 285704 ],
    colors: [
      '#1D4D4F',  
      '#3c9a76',  
      '#86c1bd',  
      '#acdfcb',  
      '#e5c674',  
      '#159989',
      '#B78475',
    ]
  };

  return {
    tooltip: {
      formatter: '{b}: {c}'
    },
    series: [{
      name: 'Flavonoid Pathways',
      type: 'treemap',
      visibleMin: 300,
      label: {
        show: true,
        formatter: '{b}\n{c}',
        fontSize: 18
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        gapWidth: 5
      },
      upperLabel: {
        show: true,
        height: 1
      },
      breadcrumb: {
        show: false
      },
      roam: false,
      nodeClick: false,
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
    chart.setOption(getDefaultChartOption(), true);
    
    // Prevent default click behavior on treemap
    chart.on('click', function(params) {
      // Only allow clicks on treemap nodes to trigger category selection
      if (params.componentType === 'series' && params.seriesType === 'treemap') {
        const category = params.name;
        if (taxonomyCategories.includes(category)) {
          handleCategoryClick(category);
        }
        // Prevent event from bubbling up
        if (params.event && params.event.event) {
          params.event.event.stopPropagation();
        }
      }
    });
  }
};

// 处理分类点击
const handleCategoryClick = (category: string) => {
    console.log(`Click category: ${category}`)
    currentCategory.value = category
    
    // Reset species detail view
    showSpeciesDetail.value = false;
    selectedSpecies.value = '';
    
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
    
    // 调用加载Excel数据的函数
    loadPathwayData(category);
}

// 处理分类标题点击 - 返回到图表视图
const handleTaxonomyTitleClick = () => {
    currentCategory.value = ''
    showSpeciesDetail.value = false;
    selectedSpecies.value = '';
    
    // 移除选中样式
    const selected = document.querySelector('.q-tree__node-header.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
    
    if (chart) {
        // 完全清除图表并重新初始化
        chart.clear();
        chart.setOption(getDefaultChartOption(), true);
    }
    currentCategoryDetails.value = 'Select a category to view details.'
}

// 添加窗口大小变化监听
const handleResize = () => {
  if (chart) {
    chart.resize();
    
    // 根据当前状态决定显示哪种图表
    if (currentCategory.value && categoryChartDataMap.value[currentCategory.value]) {
      // 如果有选中的分类，显示该分类的柱状图
      updateCategoryChart(currentCategory.value, categoryChartDataMap.value[currentCategory.value]);
    } else {
      // 否则显示默认的矩形树图
      chart.clear();
      chart.setOption(getDefaultChartOption(), true);
    }
  }
}

// 生命周期钩子
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
    
    // 防止点击事件冒泡到document
    const chartEl = document.getElementById('chart');
    if (chartEl) {
        chartEl.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
    
    // 修改点击事件处理逻辑
    document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const protectedElements = [
            '.q-tree',
            '#chart',
            '.search-container',
            '.species-detail',
            '.row'
        ];
        
        // 检查点击目标是否在受保护区域内
        const isProtectedArea = protectedElements.some(selector => 
            target.closest(selector) !== null
        );
        
        // 如果点击的不是受保护区域，则重置状态
        if (!isProtectedArea) {
            // 移除选中样式
            const selected = document.querySelector('.q-tree__node-header.selected');
            if (selected) {
                selected.classList.remove('selected');
            }
            
            // 重置分类
            currentCategory.value = '';
            showSpeciesDetail.value = false;
            
            // 重置为默认图表
            if (chart) {
                // 完全清除图表并重新初始化，避免堆叠问题
                chart.clear();
                chart.setOption(getDefaultChartOption(), true);
            }
        }
    });
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
</script>

<style scoped>
/* Main container styles */
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
    align-items: stretch;
}

.col-auto {
    flex: 0 0 auto;
    width: 490px;
    display: flex;
    flex-direction: column;
}

.col {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.q-col-gutter-md {
    gap: 10px;
}

/* Left taxonomy sidebar card styles */
.col-auto .ui-card {
    border-radius: 40px 0  0 40px ;
    background-color: #86c1bd;  /* Light green background */
    height: 800px;  /* Fixed height, shows about 15 rows */
    overflow-y: auto;  /* Add vertical scrollbar */
    overflow-x: hidden;  /* Hide horizontal scrollbar */
    direction: rtl;  /* Set content direction to right-to-left */
    width: 500px;
    
    /* Custom scrollbar styles */
    &::-webkit-scrollbar {
        width: 6px;
        background-color: transparent;
        margin-right: auto;  /* Push scrollbar to the left */
    }
    
    &::-webkit-scrollbar-thumb {
        background-color: #86c1bd;
        border-radius: 3px 0 0 3px;
    }
    
    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}

/* Restore normal content direction */
.q-tree {
    direction: ltr;  /* Restore tree menu content direction to left-to-right */
}

.full-height {
    height: 100%;
}

.ui-left-bordered-title {
    border-left: 7px solid #159989;
    padding-left: 5px;
    font-size: 20px;
    font-weight: bold;
    padding-top: 10px;
}

.taxonomy-title {
  cursor: pointer; /* Show hand pointer on hover */
  transition: color 0.3s; /* Color transition effect */
  text-align: auto;
  margin-left: 30px;
  color: #ffffff;
  font-size: 26px;
  font-weight: 700; /* Set font weight */
}

.taxonomy-title:hover {
  color: #075f2c; /* Change color on hover */
}

/* Taxonomy tree styles */
/* Left taxonomy styles */
.taxonomy-card {
    padding: 32px;
    width: 500px;
    min-height: 584px;
}

.taxonomy-title {
    margin-bottom: 64px;
}

.q-tree {
    font-size: 22px;
    line-height: 2.4;
    margin:  0;  /* Adjust spacing for each item */
    padding:  0;
    font-weight: bold;
}
/* Left taxonomy vertical spacing */
.q-tree__node {
    list-style: none;
    margin: 14px 0;  /* Adjust spacing for each item */
    padding: 4px 0;
}

.q-tree__node--parent {
    cursor: pointer;/* Mouse becomes pointer */
}

.q-tree__node-header {
    padding: 5px 1px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 500px;
    border-radius: 10px;
}

/* Left taxonomy hover styles */
.q-tree__node-header:hover {
    background-color: #ffffff;
}

/* Left taxonomy selected styles */
.q-tree__node-header.selected {
    background-color: #ffffff;
}

/* Left taxonomy arrow styles */
.q-tree__arrow {
    margin-right: 4px;
    transform: rotate(0deg);
    transition: transform 0.3s;
}

/* Chart container styles */
#chart {
    width: 100%;
    height: 650px; 
    margin-top: 20px;
    background-color: #ffffff;
    border-radius: 16px;
    padding: 20px;
    transition: all 0.3s ease;
    flex: 1;
}

/* Right content area card styles */
.col .ui-card {
    border-radius: 0 40px 40px 0;
    background-color: #fff;
    min-height: 800px;
}

/* Content card styles */
.content-card {
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 800px;
}

/* Content card title styles */
.content-title {
    margin-bottom: 20px;
    font-size: 24px;
}

/* Species detail styles */
.species-detail {
    width: 100%;
    margin-top: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    padding: 20px;
}

.detail-panel-enter-active,
.detail-panel-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.detail-panel-enter-from,
.detail-panel-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.detail-header h3 {
    margin: 0;
    font-size: 22px;
    color: #159989;
}

.back-btn {
    padding: 8px 16px;
    background-color: #86c1bd;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

.back-btn:hover {
    background-color: #159989;
}

/* Species table styles */
.species-table {
    width: 100%;
    margin-top: 20px;
    max-height: 500px;
    overflow-y: auto;
    overflow-x: auto; 
}

.species-table table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 16px;
}

.species-table th, 
.species-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
}

.species-table th {
    background-color: #e6f8f1;
    font-weight: bold;
    position: sticky;
    top: 0;
    z-index: 10;
}

.species-table tr:hover {
    background-color: #f5f5f5;
}

/* Export button styles */
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

/* Search box styles */
.search-container {
    margin: 20px 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
}

.search-example {
    color: #86c1bd;
    font-size: 14px;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.search-example:hover {
    background-color: #e6f8f1;
    color: #159989;
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

.search-btn {
    padding: 8px 16px;
    background-color: #86c1bd;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

.search-btn:hover {
    background-color: #159989;
}

/* Alternating row colors */
.even-row {
    background-color: #e6f8f1;
}

/* Responsive design */
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

/* Smaller phone screens */
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
}


/* 为所有单元格设置一个基础样式，防止内容撑破布局 */
.species-table td,
.species-table th {
    white-space: nowrap;
}

/* --- 这里是您控制特定列样式的核心区域 --- */

/* 为 Function 和 Description 列设置样式 */
.species-table .col-function,
.species-table .col-description {
    white-space: nowrap;      /* 强制文本不换行 */
}
</style>
