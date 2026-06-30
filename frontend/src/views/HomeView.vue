<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import * as echarts from 'echarts'

// 使用 URL 构造函数处理图片路径
const getImageUrl = (name: string) => {
  return new URL(`../assets/${name}`, import.meta.url).href
}

const pathwayMaps = [
    {
        id: 'GT',
        label: 'GT',
        title: 'Glycosyltransferase (GT) Map',
        description: 'GT enzymes transfer sugar molecules to flavonoid skeletons.',
        svgFile: 'fla-pathway-gt.svg'
    },
    {
        id: 'AT',
        label: 'AT',
        title: 'Acyltransferase (AT) Map',
        description: 'AT enzymes modify flavonoids with acyl groups.',
        svgFile: 'fla-pathway-at.svg'
    },
    {
        id: 'MT',
        label: 'MT',
        title: 'Methyltransferase (MT) Map',
        description: 'MT enzymes methylate flavonoid rings.',
        svgFile: 'fla-pathway-mt.svg'
    }
]

const activePathwayId = ref(pathwayMaps[0].id)
const activePathwayMap = computed(() => {
    return pathwayMaps.find((map) => map.id === activePathwayId.value) ?? pathwayMaps[0]
})

// SVG通路图路径
const svgUrl = computed(() => getImageUrl(activePathwayMap.value.svgFile));
// 用于存储SVG内容的变量
const svgContent = ref<string>('');

// 加载SVG内容
const loadSvgContent = async (url = svgUrl.value) => {
  try {
    svgContent.value = '';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load SVG');
    const content = await response.text();
    if (url !== svgUrl.value) return;
    svgContent.value = content;
    
    // 提取原始viewBox
    const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
    if (viewBoxMatch) {
      svgViewBox.value = viewBoxMatch[1];
    }
  } catch (error) {
    console.error('Error loading SVG:', error);
  }
};

const selectPathwayMap = (mapId: string) => {
    if (activePathwayId.value === mapId) return;

    activePathwayId.value = mapId;
    if (isViewerOpen.value) {
        closeViewer();
    }
    loadSvgContent();
};

// 轮播图数据
const carouselImages = [
    { src: getImageUrl('fla-fuction2.png'), alt: 'fla-fuction3' },
    { src: getImageUrl('liuchengtu2-01.png'), alt: 'simplified-flavonid-pathway2' },
    { src: getImageUrl('deepflav-introduce2.png'), alt: 'deepflv-fuction' },
    //{ src: getImageUrl('breadth-depth-fla.png'), alt: 'breadth-depth-fla' },
    //{ src: getImageUrl('liuchengtu-01.png'), alt: 'simplified-flavonid-pathway2' },
    //{ src: getImageUrl('paddy-wsm.png'), alt: 'Paddy' },
    //{ src: getImageUrl('Solanum-wsm.jpg'), alt: 'Solanum' },
    //{ src: getImageUrl('pea-wsm.png'), alt: 'Glycine max' }
]

// 模式植物数据
const medicinalPlants = [
    {
        name: 'Arabidopsis thaliana',
        description: 'Arabidopsis thaliana, a small flowering plant in the Brassicaceae family, is a globally recognized model plant organism.',
        image: getImageUrl('arabidoppsis-thaliana2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Arabidopsis+thaliana'
    },
    {
        name: 'Oryza sativa',
        description: 'Cucurbitaceae family, Siraitia grosvenorii genus climbing herbaceous plant',
        image: getImageUrl('oryza-sativa2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Oryza+sativa'
    },
    {
        name: 'Nicotiana tabacum.',
        description: 'A plant of the Acacia genus, commonly found in southern China.',
        image: getImageUrl('nicotiana-tabacum2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Nicotiana+spp.'
    },
    {
        name: 'Solanum lycopersicum',
        description: 'It is a member of the nightshade family, and its fruit is an edible berry that is eaten as a vegetable.',
        image: getImageUrl('solanum-lycopersicum2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Solanum+lycopersicum'
    },
    {
        name: 'Zea mays',
        description: 'It is an annual herbaceous plant of the genus Zea mays in the Poaceae family and is an important food crop with the highest total output in the world.',
        image: getImageUrl('zea-mays2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Zea+mays'
    },
    {
        name: 'Glycine max',
        description: 'Glycine max, also known as soybean, is a legume crop that is widely cultivated for its high protein content and various health benefits.',
        image: getImageUrl('glycine-max2.jpg'),
        link: 'https://cbi.gxu.edu.cn/KPGF/html/#/species-table?species=Glycine+max'
    }
]

// 物种统计数据
const speciesData = [
    { name: 'Core Eudicots/Rosids', value: 331 },
    { name: 'Core Eudicots/Asterids', value: 289 },
    { name: 'Monocots', value: 194 },
    { name: 'Basal Eudicots', value: 153 },
    { name: 'Chlorophyceae', value: 24 },
    { name: 'Bangiophyceae', value: 7 },
    { name: 'Pinopsida', value: 7 },
    { name: 'Bryopsida', value: 5 },
    { name: 'Mamiellophyceae', value: 5 },
    { name: 'Lycopodiopsida', value: 3 },
    { name: 'Zygnematophyceae', value: 3 },
    { name: 'Florideophyceae', value: 3 },
    { name: 'Gnetopsida', value: 2 },
    { name: 'Marchantiopsida', value: 2 },
    { name: 'Polypodiopsida', value: 2 },
    { name: 'Eudicotyledoneae', value: 2 },
    { name: 'Trebouxiophyceae', value: 12 },
    { name: 'Ulvophyceae', value: 1 },
    { name: 'Pyramimonadophyceae', value: 1 },
    { name: 'Mesostigmatophyceae', value: 1 },
    { name: 'Glaucocystophyceae', value: 1 },
    { name: 'Ginkgoopsida', value: 1 },
    { name: 'Chloropicophyceae', value: 1 },
    { name: 'Chlorokybophyceae', value: 1 },
    { name: 'Charophyceae', value: 1 },
    { name: 'Anthocerotopsida', value: 1 }
].sort((a, b) => b.value - a.value); // 按数量从大到小排序

// 代谢基因统计数据（Flavonoid genes）
const metabolitesData = [
    { name: 'Anthocyanins', value: 463795 },
    { name: 'Flavonols', value: 421810 },
    { name: 'Flavanones', value: 396675 },
    { name: 'Isoflavones', value: 360611 },
    { name: 'Flavanols', value: 278059 },
    { name: 'Flavones', value: 268172 },
    { name: 'Phenylpropanoid', value: 285704 }, 
];
// 计算总数
const totalSpecies = speciesData.reduce((sum, item) => sum + item.value, 0);
const totalMetabolites = 630951;
//const totalMetabolites = metabolitesData.reduce((sum, item) => sum + item.value, 0);

// ECharts 图表引用
const chartSpeciesRef = ref<HTMLElement | null>(null);
const chartMetabolitesRef = ref<HTMLElement | null>(null);
let speciesChart: echarts.ECharts | null = null;
let metabolitesChart: echarts.ECharts | null = null;

// 颜色数组
const colorPalette = ['#86c1bd', '#3c9a76', '#1d4d4f', '#7a72b4', '#dbaf3d', '#127b6e'];
const metabolitesColorPalette = ['#368B6A', '#1D4D4F', '#86C1BD', '#7A72B4', '#b98b56', '#127B6E', '#DBAF3D'];

// 轮播图逻辑
const currentImageIndex = ref(0)
let carouselInterval: number | null = null

const startCarousel = () => {
    stopCarousel()
    carouselInterval = window.setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value + 1) % carouselImages.length
    }, 6000)
}

const stopCarousel = () => {
    if (carouselInterval) {
        clearInterval(carouselInterval)
        carouselInterval = null
    }
}

const setCurrentImage = (index: number) => {
    currentImageIndex.value = index
    startCarousel()
}

// SVG查看器状态
const isViewerOpen = ref(false);
const scale = ref(1);
const translate = reactive({ x: 0, y: 0 });
const minScale = 0.5;
const maxScale = 3;
const zoomStep = 0.2; // 缩放步长
let lastPointer: { x: number; y: number } | null = null;
let isDragging = ref(false);
let viewerWrapperRef = ref<HTMLElement | null>(null);
let svgViewBox = ref<string>('0 0 1333.3 750'); // 默认SVG viewBox
let dragStartPosition = { x: 0, y: 0 }; // 拖拽开始位置
let dragThreshold = 25; // 拖拽阈值，增加到25像素，使小幅度移动被识别为点击
let hasDragged = false; // 是否已经拖拽超过阈值
let clickStartTime = 0; // 记录点击开始时间
const clickTimeThreshold = 300; // 点击时间阈值（毫秒）

// 计算SVG的viewBox
const computedViewBox = computed(() => {
  if (!viewerWrapperRef.value) return svgViewBox.value;
  
  // 解析原始viewBox
  const [x, y, width, height] = svgViewBox.value.split(' ').map(Number);
  
  // 计算缩放后的viewBox
  const scaledWidth = width / scale.value;
  const scaledHeight = height / scale.value;
  
  // 计算平移后的viewBox位置
  const newX = x - translate.x / scale.value;
  const newY = y - translate.y / scale.value;
  
  return `${newX} ${newY} ${scaledWidth} ${scaledHeight}`;
});

// 处理SVG内容的计算属性
const processedSvgContent = computed(() => {
  if (!svgContent.value) return '';
  
  // 使用正则表达式替换viewBox属性
  return svgContent.value.replace(
    /viewBox="[^"]*"/,
    `viewBox="${computedViewBox.value}"`
  );
});

// 添加方法处理SVG中的链接点击
const handleSvgLinkClick = (e: MouseEvent) => {
  // 检查点击的元素是否是链接或链接内的元素
  const target = e.target as HTMLElement;
  const linkElement = target.closest('a');
  
  // 如果是链接且没有拖拽或拖拽距离很小，则允许链接点击
  if (linkElement && !hasDragged) {
    console.log('链接被点击:', linkElement.getAttribute('href'));
    const href = linkElement.getAttribute('href');
    const target = linkElement.getAttribute('target');
    
    if (href) {
      e.preventDefault(); // 阻止默认事件
      e.stopPropagation(); // 阻止事件冒泡
      
      // 在新窗口打开链接
      window.open(href, target || '_blank');
    }
  }
};

// SVG查看器方法
const openViewer = () => {
  isViewerOpen.value = true;
  // 添加键盘事件监听，按ESC键关闭查看器
  document.addEventListener('keydown', handleKeyDown);
  // 重置状态
  resetView();
};

const closeViewer = () => {
  isViewerOpen.value = false;
  // 重置状态
  resetView();
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeViewer();
  }
};

// 放大方法
const zoomIn = () => {
  const newScale = Math.min(maxScale, scale.value + zoomStep);
  
  if (newScale !== scale.value) {
    // 使用中心点缩放
    if (viewerWrapperRef.value) {
      const rect = viewerWrapperRef.value.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // 计算缩放前后的偏移调整
      const scaleDiff = newScale / scale.value;
      
      requestAnimationFrame(() => {
        scale.value = newScale;
        translate.x = centerX - (centerX - translate.x) * scaleDiff;
        translate.y = centerY - (centerY - translate.y) * scaleDiff;
      });
    }
  }
};

// 缩小方法
const zoomOut = () => {
  const newScale = Math.max(minScale, scale.value - zoomStep);
  
  if (newScale !== scale.value) {
    // 使用中心点缩放
    if (viewerWrapperRef.value) {
      const rect = viewerWrapperRef.value.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // 计算缩放前后的偏移调整
      const scaleDiff = newScale / scale.value;
      
      requestAnimationFrame(() => {
        scale.value = newScale;
        translate.x = centerX - (centerX - translate.x) * scaleDiff;
        translate.y = centerY - (centerY - translate.y) * scaleDiff;
      });
    }
  }
};

// 复原视图方法
const resetView = () => {
  // 使用requestAnimationFrame确保平滑的重置
  requestAnimationFrame(() => {
    scale.value = 1;
    translate.x = 0;
    translate.y = 0;
    
    // 重新加载SVG内容，确保viewBox被重置
    const viewBoxMatch = svgContent.value.match(/viewBox="([^"]*)"/);
    if (viewBoxMatch) {
      svgViewBox.value = viewBoxMatch[1];
    }
  });
};

const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
  const newScale = Math.max(minScale, Math.min(maxScale, scale.value + delta));
  
  if (newScale !== scale.value) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 计算缩放前后的偏移调整
    const scaleDiff = newScale / scale.value;
    
    requestAnimationFrame(() => {
      scale.value = newScale;
      translate.x = mouseX - (mouseX - translate.x) * scaleDiff;
      translate.y = mouseY - (mouseY - translate.y) * scaleDiff;
    });
  }
};

const onPointerDown = (e: PointerEvent) => {
  const target = e.currentTarget as HTMLElement;
  lastPointer = { x: e.clientX, y: e.clientY };
  dragStartPosition = { x: e.clientX, y: e.clientY };
  hasDragged = false;
  clickStartTime = Date.now(); // 记录点击开始时间
  
  // 检查是否点击在链接上
  const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
  const isLink = clickedElement?.closest('a') || clickedElement?.tagName === 'A';
  
  // 如果点击在链接上，不立即捕获指针，给链接点击一个机会
  if (!isLink) {
    // 捕获指针以确保即使鼠标移出元素也能继续跟踪
    target.setPointerCapture(e.pointerId);
    // 更改光标样式
    target.style.cursor = 'grabbing';
  }
};

const onPointerMove = (e: PointerEvent) => {
  if (!lastPointer) return;
  
  const dx = e.clientX - lastPointer.x;
  const dy = e.clientY - lastPointer.y;
  
  // 计算从拖拽开始点的总移动距离
  const totalDx = e.clientX - dragStartPosition.x;
  const totalDy = e.clientY - dragStartPosition.y;
  const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
  
  // 如果移动超过阈值，标记为拖拽
  if (totalDistance > dragThreshold) {
    // 现在确认这是一个拖拽操作
    if (!hasDragged) {
      hasDragged = true;
      isDragging.value = true;
      
      // 确保捕获指针
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      target.style.cursor = 'grabbing';
    }
    
    // 使用requestAnimationFrame确保平滑的拖拽
    requestAnimationFrame(() => {
      translate.x += dx;
      translate.y += dy;
      lastPointer = { x: e.clientX, y: e.clientY };
    });
  }
};

const onPointerUp = (e: PointerEvent) => {
  const target = e.currentTarget as HTMLElement;
  const clickDuration = Date.now() - clickStartTime;
  
  if (e.pointerId !== undefined && target.hasPointerCapture(e.pointerId)) {
    target.releasePointerCapture(e.pointerId);
  }
  
  // 计算总移动距离
  const totalDx = e.clientX - dragStartPosition.x;
  const totalDy = e.clientY - dragStartPosition.y;
  const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
  
  // 如果移动距离小于阈值且点击时间短，认为是点击而非拖拽
  if (totalDistance <= dragThreshold && clickDuration < clickTimeThreshold) {
    hasDragged = false;
    isDragging.value = false;
    
    // 检查是否点击了链接
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    const linkElement = clickedElement?.closest('a');
    
    if (linkElement) {
      // 如果点击了链接，模拟点击事件
      const href = linkElement.getAttribute('href');
      const linkTarget = linkElement.getAttribute('target');
      
      if (href) {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, linkTarget || '_blank');
      }
    }
  } else if (hasDragged) {
    // 如果已拖拽，阻止点击事件
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
  }
  
  lastPointer = null;
  target.style.cursor = 'grab';
};

// 获取响应式图表配置
const getResponsiveChartConfig = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 检测设备类型
    const isIPhone = width === 430 && height === 932;
    const isIPadVertical = width === 1024 && height === 1366;
    const isIPadHorizontal = width === 1366 && height === 1024;
    const isSmallScreen = width < 480;
    const isMediumScreen = width >= 480 && width < 768;
    const isTablet = width >= 768 && width < 1200;
    
    if (isIPhone || isSmallScreen) {
        return {
            legendFontSize: 9,
            pieRadius: ['25%', '55%'],
            pieCenter: ['50%', '50%'],
            roseRadius: ['5%', '60%']
        };
    } else if (isMediumScreen) {
        return {
            legendFontSize: 10,
            pieRadius: ['30%', '60%'],
            pieCenter: ['55%', '50%'],
            roseRadius: ['5%', '65%']
        };
    } else if (isIPadVertical) {
        return {
            legendFontSize: 10,
            pieRadius: ['25%', '55%'],
            pieCenter: ['65%', '50%'],
            roseRadius: ['5%', '65%']
        };
    } else if (isTablet) {
        return {
            legendFontSize: 11,
            pieRadius: ['35%', '65%'],
            pieCenter: ['60%', '50%'],
            roseRadius: ['5%', '70%']
        };
    } else if (isIPadHorizontal) {
        return {
            legendFontSize: 10,
            pieRadius: ['30%', '55%'],
            pieCenter: ['65%', '50%'],
            roseRadius: ['5%', '60%']
        };
    } else {
        return {
            legendFontSize: 11,
            pieRadius: ['40%', '60%'],
            pieCenter: ['60%', '50%'],
            roseRadius: ['5%', '70%']
        };
    }
};

// 调试图表状态
const debugChartStatus = () => {
    console.log('=== Chart Debug Info ===');
    console.log('Species Chart:', speciesChart);
    console.log('Metabolites Chart:', metabolitesChart);
    
    if (chartSpeciesRef.value) {
        const speciesEl = chartSpeciesRef.value;
        console.log('Species Container:', {
            offsetWidth: speciesEl.offsetWidth,
            offsetHeight: speciesEl.offsetHeight,
            display: getComputedStyle(speciesEl).display,
            visibility: getComputedStyle(speciesEl).visibility
        });
    }
    
    if (chartMetabolitesRef.value) {
        const metabolitesEl = chartMetabolitesRef.value;
        console.log('Metabolites Container:', {
            offsetWidth: metabolitesEl.offsetWidth,
            offsetHeight: metabolitesEl.offsetHeight,
            display: getComputedStyle(metabolitesEl).display,
            visibility: getComputedStyle(metabolitesEl).visibility
        });
    }
    
    console.log('Window size:', window.innerWidth + 'x' + window.innerHeight);
};

// 强制重新初始化图表
const forceInitCharts = () => {
    console.log('Force reinitializing charts...');
    debugChartStatus();
    
    // 销毁现有图表
    if (speciesChart) {
        speciesChart.dispose();
        speciesChart = null;
    }
    if (metabolitesChart) {
        metabolitesChart.dispose();
        metabolitesChart = null;
    }
    
    // 等待一帧后重新初始化
    requestAnimationFrame(() => {
        initSpeciesChart();
        initMetabolitesChart();
        
        // 再次调试
        setTimeout(() => {
            debugChartStatus();
        }, 500);
    });
};

// 暴露调试函数到全局（仅开发环境）
if (process.env.NODE_ENV === 'development') {
    (window as any).debugCharts = debugChartStatus;
    (window as any).forceInitCharts = forceInitCharts;
}

// 初始化物种统计图表
const initSpeciesChart = () => {
    if (chartSpeciesRef.value) {
        // 确保容器有尺寸
        const container = chartSpeciesRef.value;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            setTimeout(() => initSpeciesChart(), 100);
            return;
        }
        
        speciesChart = echarts.init(chartSpeciesRef.value);
        
        // 为每个数据项分配颜色
        const dataWithColors = speciesData.map((item, index) => ({
            ...item,
            itemStyle: {
                color: colorPalette[index % colorPalette.length]
            }
        }));
        
        const config = getResponsiveChartConfig();
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'center',
                type: 'scroll',
                pageIconSize: 8,
                pageTextStyle: {
                    color: '#333',
                    fontSize: config.legendFontSize
                },
                textStyle: {
                    fontSize: config.legendFontSize,
                    width: 100,
                    overflow: 'truncate'
                },
                formatter: (name: string) => {
                    const item = speciesData.find(item => item.name === name);
                    const text = item ? `${name}: ${item.value}` : name;
                    return text.length > 15 ? text.substring(0, 15) + '...' : text;
                }
            },
            series: [
                {
                    name: 'Species',
                    type: 'pie',
                    radius: config.pieRadius,
                    center: config.pieCenter,
                    data: dataWithColors,
                    padAngle: 0,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 30,
                        },
                        label: {
                        show: true,
                        fontSize: 11,
                        fontWeight: 'bold'
                        }

                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    
                }
            ]
        };
        
        speciesChart.setOption(option);
        
        // 不在这里添加resize监听器，统一在全局处理
    }
};

// 初始化代谢物统计图表
const initMetabolitesChart = () => {
    if (chartMetabolitesRef.value) {
        // 确保容器有尺寸
        const container = chartMetabolitesRef.value;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            setTimeout(() => initMetabolitesChart(), 100);
            return;
        }
        
        metabolitesChart = echarts.init(chartMetabolitesRef.value);
        
        // 为每个数据项分配颜色
        const dataWithColors = metabolitesData.map((item, index) => ({
            ...item,
            itemStyle: {
                color: metabolitesColorPalette[index % metabolitesColorPalette.length]
            }
        }));
        
        const config = getResponsiveChartConfig();
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'center',
                textStyle: {
                    fontSize: config.legendFontSize,
                    width: 100,
                    overflow: 'truncate'
                },
                formatter: (name: string) => {
                    const item = metabolitesData.find(item => item.name === name);
                    const text = item ? `${name}: ${item.value}` : name;
                    return text.length > 15 ? text.substring(0, 15) + '...' : text;
                }
            },
            series: [
                {
                    name: 'Metabolites',
                    type: 'pie',
                    radius: config.roseRadius,
                    center: config.pieCenter,
                    roseType: 'area',
                    data: dataWithColors,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: false
                    }
                }
            ]
        };
        
        metabolitesChart.setOption(option);
        
        // 不在这里添加resize监听器，统一在全局处理
    }
};

// 统一的resize处理器
const handleChartResize = () => {
    // resize图表
    speciesChart?.resize();
            metabolitesChart?.resize();
    
    // 重新应用响应式配置
    setTimeout(() => {
        if (speciesChart) {
            const newConfig = getResponsiveChartConfig();
            speciesChart.setOption({
                legend: {
                    textStyle: {
                        fontSize: newConfig.legendFontSize
                    },
                    pageTextStyle: {
                        fontSize: newConfig.legendFontSize
                    }
                },
                series: [{
                    radius: newConfig.pieRadius,
                    center: newConfig.pieCenter
                }]
        });
    }
        
        if (metabolitesChart) {
            const newConfig = getResponsiveChartConfig();
            metabolitesChart.setOption({
                legend: {
                    textStyle: {
                        fontSize: newConfig.legendFontSize
                    }
                },
                series: [{
                    radius: newConfig.roseRadius,
                    center: newConfig.pieCenter
                }]
            });
        }
    }, 100);
};

// 生命周期钩子
onMounted(() => {
    startCarousel();
    
    // 延迟初始化图表，确保DOM完全渲染
    setTimeout(() => {
    initSpeciesChart();
    initMetabolitesChart();
    }, 200);
    
    loadSvgContent(); // 加载SVG内容
    
    // 添加resize监听器
    window.addEventListener('resize', handleChartResize);
})

onUnmounted(() => {
    // 清理图表实例
    if (speciesChart) {
        speciesChart.dispose();
        speciesChart = null;
    }
    if (metabolitesChart) {
        metabolitesChart.dispose();
        metabolitesChart = null;
    }
    
    // 清理事件监听器
    window.removeEventListener('resize', handleChartResize);
    stopCarousel();
})

onUnmounted(() => {
    stopCarousel();
    // 销毁ECharts实例
    if (speciesChart) {
        speciesChart.dispose();
        speciesChart = null;
    }
    if (metabolitesChart) {
        metabolitesChart.dispose();
        metabolitesChart = null;
    }
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeyDown);
})
</script>

<template>
    <div class="home">
        <Header />
        
        <main>
            <section class="p-5 text-center text-sm-start">
                <div class="introduction d-flex align-items-center">
                    <div class="col-md-6 text-box">
                        <h1 class="introduction_title">
                            <div class="title-line">DeepFlav:</div>
                            <div class="title-line">Flavonoid Resource</div>
                            <div class="title-line">AI-Powered Platform</div>
                        </h1>
                        <p class="introduction_text my-4">
                            Welcome to DeepFlav, a platform offering multi-omics data for 1,000+ plants, tools for flavonoid pathway mining, and access to our advanced AI tools.
                            <span style="font-weight:700">This is a placeholder for a more detailed introduction.</span>
                        </p>
                        <p class="citation_text">
                            If you used the data from the database, please cite the paper kindly! 
                            <!--<a href="https://zhy13471039578">https://doi.org/123456/123456</a>-->
                        </p>
                    </div>
                    
                    <!--轮播图-->
                    <div class="shell">
                        <div v-for="(image, index) in carouselImages" 
                             :key="index"
                             class="image-box"
                             :class="{ 'hover-effect': currentImageIndex === index }"
                             @mouseenter="stopCarousel"
                             @mouseleave="startCarousel"
                             @click="setCurrentImage(index)"
                        >
                            <img :src="image.src" :alt="image.alt">
                        </div>
                    </div>
                </div>
            </section>

            <!-- 统计部分  -->
            <section class="statistics-section">
                <div class="statistics-title-container">
                    <h2 class="statistics-title">Statistics</h2>
                </div>
                <div class="statistics-content">
                    <!-- 物种统计卡片 -->
                    <div class="statistics-echarts-card">
                        <div class="statistics-info">
                            <h3 class="statistics-info-title">Species</h3>
                            <p class="statistics-info-total">Total species: 1031</p>
                            <p class="statistics-info-desc">Distribution of species by class in the database.</p>
                        </div>
                        <div ref="chartSpeciesRef" class="chart-container"></div>
                    </div>
                    
                    <!-- 代谢物统计卡片 -->
                    <div class="statistics-echarts-card">
                        <div class="statistics-info">
                            <h3 class="statistics-info-title">Flavonoid Genes</h3>
                            <p class="statistics-info-total">Total flavonoid genes: {{ totalMetabolites.toLocaleString() }}</p>
                            <p class="statistics-info-desc">Distribution of flavonoid genes by category.</p>
                        </div>
                        <div ref="chartMetabolitesRef" class="chart-container"></div>
                    </div>
                </div>
            </section>

            <!-- 模型植物部分 -->
            <section class="h-scroll">
                <div class="model-plant-container">
                    <h2>model plant</h2>
                    <div class="plant-grid">
                        <div v-for="(plant, index) in medicinalPlants" 
                             :key="index"
                             class="col card-custom"
                        >
                            <a :href="plant.link" class="plant-link">
                                <div class="plant-image-container">
                                    <img :src="plant.image" class="plant-image" :alt="plant.name">
                                </div>
                            </a>
                            <h2 class="fw-normal">{{ plant.name }}</h2>
                            <p>{{ plant.description }}</p>
                            <p><a class="view-details-btn" :href="plant.link">View details</a></p>
                        </div>
                    </div>
                </div>
            </section>
                
            <!-- 通路图部分 -->
            <section class="pathway-section">
                <div class="pathway-title-container">
                    <h2 class="pathway-section-title">Flavonoid Biosynthesis Pathway</h2>
                </div>
                <div class="pathway-switcher" aria-label="Flavonoid pathway map switcher">
                    <button
                        v-for="map in pathwayMaps"
                        :key="map.id"
                        class="pathway-switch-button"
                        :class="{ active: map.id === activePathwayId }"
                        type="button"
                        @click="selectPathwayMap(map.id)"
                    >
                        <span class="pathway-switch-label">{{ map.label }}</span>
                        <span class="pathway-switch-description">{{ map.description }}</span>
                    </button>
                </div>
                <div class="pathway-display-area">
                    <div class="pathway-active-title">{{ activePathwayMap.title }}</div>
                    <!-- 使用SVG通路图 -->
                    <img 
                        :src="svgUrl" 
                        :alt="activePathwayMap.title" 
                        class="pathway-thumb" 
                        @click="openViewer"
                    />
                    <p class="pathway-caption">Click on the pathway image to view in full screen mode with zoom and pan capabilities.</p>
                </div>
            </section>
            
            <!-- SVG查看器弹层 -->
            <div v-if="isViewerOpen" class="svg-viewer-overlay">
                <button class="close-btn" @click="closeViewer">✕</button>
                <div 
                    ref="viewerWrapperRef"
                    class="svg-viewer-wrapper"
                    @wheel.prevent="onWheel"
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"
                >
                    <!-- 使用内联SVG替代img标签 -->
                    <div v-if="svgContent" 
                         class="svg-viewer-content"
                         v-html="processedSvgContent"
                         @click="handleSvgLinkClick"
                    ></div>
                    <!-- 加载中提示 -->
                    <div v-else class="svg-loading">
                        Loading pathway diagram...
                    </div>
                </div>
                
                <!-- 控制按钮 -->
                <div class="svg-viewer-controls">
                    <button class="control-btn zoom-in" @click="zoomIn" title="Zoom In">+</button>
                    <button class="control-btn zoom-out" @click="zoomOut" title="Zoom Out">−</button>
                    <button class="control-btn reset-view" @click="resetView" title="Reset View">⟳</button>
                </div>
            </div>
        </main>

        <Footer />
    </div>
</template>

<style scoped>
/* 页面基本样式 */
.home {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-image: linear-gradient(20deg,#fafafa,#abdfcb,#86c1bd,#e6f8f1,#faf5f0,#ffffff);
}

/* 主体内容样式 */
main {
    padding: 20px;
    max-width: 2000px;
    margin: 0 auto;
    background-color: #e6f8f1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    border-radius: 20px;
}

/* 引言部分样式 */
.introduction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 10px;
    border-radius: 40px;
}

.text-box {
    flex: 1;
    padding-right: 40px;
}

.introduction_title {
    color: #202020;
    font-family: 'Times New Roman', Times, serif;
    font-weight: bold;
    margin: 50px;
    text-align: left;
    font-size: 90px;
    line-height: 1.2;
}

.title-line {
    white-space: nowrap;
    display: block;
    margin-bottom: 10px;
    min-height: 1.2em;
}

.introduction p {
    font-size: 18px;
    color: #666;
    line-height: 1.2;
}

/* 轮播图容器样式 */
.shell {
    width: 52%;
    height: 700px;
    display: flex;
    position: relative;
    justify-content: space-between;
}

.image-box {
    flex: 1;
    text-align: right;
    overflow: hidden;
    transition: .4s;
    margin: 0 5px;
    border-radius: 40px;
    background-color: #fff;
}

.image-box > img {
    width: 110%;
    height: 100%;
    object-fit: cover;
    transition: .5s;
}

.image-box.hover-effect {
    flex: 8;
}

.image-box:not(.hover-effect) {
    flex: 0.5;
}

.image-box.hover-effect > img {
    width: 100%;
    height: 100%;
}

/* 模型植物容器样式 */
.model-plant-container {
    /* 大盒子样式 */
    background-color: #D4EFE4; /* 不同的背景颜色区分背景 */
    border-radius: 20px; /* 圆角设置20度 */
    padding: 30px;
    margin: 30px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 使用CSS Grid布局植物卡片 */
.plant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 10px;
    font-style: italic;
    font-family: 'Times New Roman', Gotham, serif;
}

/* 植物图片容器 */
.plant-image-container {
    /* 图片容器样式，可以控制图片的显示区域 */
    width: 350px; /* 默认宽度 */
    height: 200px; /* 默认高度 */
    margin: 0 auto 15px;
    overflow: hidden;
    border-radius: 10%; /* 圆形图片 */
    cursor: pointer;
}

/* 植物图片样式 */
.plant-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 保持图片比例填充容器 */
    transition: transform 0.3s ease;
}

/* 植物链接样式 */
.plant-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

/* 卡片悬停时图片效果 */
.card-custom:hover .plant-image {
    transform: scale(1.1);
}

/* 新的View details按钮样式 */
.view-details-btn {
    display: inline-block;
    background: linear-gradient(135deg, #3c9a76, #89c8ca);
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    border: none;
    position: relative;
    overflow: hidden;
}

.view-details-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
}

.view-details-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(29, 77, 79, 0.4);
}

.view-details-btn:hover::before {
    left: 100%;
}

/* 响应式布局调整 */
/* 大屏桌面端 (>1600px) */
@media (min-width: 1601px) {
    .introduction {
        flex-direction: row;
    }
    
    .introduction_title {
        font-size: 90px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    
    .plant-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .card-custom {
        max-width: none;
    }
}

/* 中大屏桌面端 (1200px-1600px) */
@media (min-width: 1200px) and (max-width: 1600px) {
    .introduction {
        flex-direction: row;
    }
    
    .introduction_title {
        font-size: 75px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    
    .plant-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .card-custom {
        max-width: none;
    }
}

/* 中屏桌面端 (1024px-1199px) - 排除iPad竖屏 */
@media (min-width: 1024px) and (max-width: 1199px) and (max-height: 1200px) {
    .introduction {
        flex-direction: row;
    }
    
    .introduction_title {
        font-size: 65px;
        margin: 35px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    
    .plant-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .card-custom {
        max-width: none;
    }
}

/* 特殊尺寸处理 (1600px-1750px) */
@media (min-width: 1600px) and (max-width: 1750px) {
    .introduction_title {
        font-size: 80px;
        margin: 40px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
}

/* 特殊尺寸处理 (1100px-1300px) */
@media (min-width: 1100px) and (max-width: 1300px) {
    .introduction_title {
        font-size: 58px;
        margin: 30px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
}

@media (min-width: 768px) and (max-width: 1023px) and (max-height: 1300px) {
    .introduction {
        flex-direction: column;
        align-items: center;
    }
    
    .text-box, .shell {
        width: 100%;
        max-width: 1000px;
    }
    
    .introduction_title {
        margin: 38px;
        text-align: center;
        font-size: 60px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .plant-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .card-custom {
        max-width: 370px;
        margin: 0 auto;
    }

    .plant-image-container {
        width: 300px; /* 默认宽度 */
        height: 150px; /* 默认高度 */
        margin: 0 auto 15px;
        overflow: hidden;
        border-radius: 5%; /* 圆形图片 */
    }
    
    .statistics-echarts-card {
        flex-direction: column;
        height: auto;
        padding: 25px;
        min-height: 280px;
    }
    
    .statistics-info {
        position: relative;
        transform: none;
        background-color: #CEE6E4;
        width: 100%;
        margin-bottom: 20px;
        text-align: center;
        border-radius: 12px;
        padding: 15px;
    }
    
    .statistics-info-title {
        font-size: 26px;
    }
    
    .statistics-info-total {
        font-size: 18px;
    }
    
    .statistics-info-desc {
        font-size: 14px;
    }
    
    .chart-container {
        width: 100% !important;
        height: 220px !important;
        min-width: 200px !important;
        min-height: 200px !important;
        border-radius: 12px !important;
        display: block !important;
        position: relative !important;
    }
    
    .svg-viewer-controls {
        bottom: 20px;
        top: auto;
        right: 50%;
        transform: translateX(50%);
    }
}

@media (max-width: 767px) {
    .introduction {
        flex-direction: column;
        padding: 10px;
    }
    
    .introduction_title {
        margin: 8px;
        text-align: center;
        font-size: 50px;
    }
    
    .title-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .text-box, .shell {
        width: 100%;
    }
    
    .plant-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 10px;
    }
    
    .card-custom {
        max-width: 350px;
        margin: 0 auto;
    }

    .plant-image-container {
        width: 300px; /* 默认宽度 */
        height: 150px; /* 默认高度 */
        margin: 0 auto 15px;
        overflow: hidden;
        border-radius: 5%; /* 圆形图片 */
    }
    
    .statistics-section {
        padding: 20px;
    }
    
    .statistics-content {
        flex-direction: column;
        gap: 30px;
    }
    
    .statistics-echarts-card {
        flex-direction: column;
        height: auto;
        padding: 20px;
    }
    
    .statistics-info {
        position: relative;
        transform: none;
        background-color: transparent;
        width: 100%;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .statistics-info-title {
        font-size: 28px;
    }
    
    .statistics-info-total {
        font-size: 16px;
    }
    
    .statistics-info-desc {
        font-size: 13px;
    }
    
    .chart-container {
        width: 100% !important;
        height: 200px !important;
        min-width: 180px !important;
        min-height: 180px !important;
        border-radius: 12px !important;
        display: block !important;
        position: relative !important;
    }
    
    .svg-viewer-controls {
        bottom: 20px;
        top: auto;
        right: 50%;
        transform: translateX(50%);
    }
}

/* iPad Pro 横屏优化 (1366×1024) */
@media (width: 1366px) and (height: 1024px), 
       (min-width: 1300px) and (max-width: 1400px) and (min-height: 1000px) and (max-height: 1100px) {
    .statistics-section {
        padding: 30px 60px;
        margin: 30px 0;
    }
    
    .statistics-content {
        flex-direction: row;
        gap: 40px;
        justify-content: space-between;
    }
    
    .statistics-echarts-card {
        flex: 1;
        height: 350px;
        padding: 15px;
        min-width: 0;
    }
    
    .statistics-info {
        width: 35%;
        padding: 15px;
        border-radius: 12px 0 0 12px;
    }
    
    .statistics-info-title {
        font-size: 24px;
    }
    
    .statistics-info-total {
        font-size: 16px;
        margin: 10px 0;
    }
    
    .statistics-info-desc {
        font-size: 13px;
        line-height: 1.3;
    }
    
    .chart-container {
        width: 65%;
        height: 100%;
    }
}

/* iPad Pro 竖屏优化 (1024×1366) - 最高优先级 */
@media (width: 1024px) and (height: 1366px),
       (min-width: 1000px) and (max-width: 1100px) and (min-height: 1300px),
       (min-width: 1024px) and (max-width: 1024px) and (min-height: 1366px) {
    .statistics-section {
        padding: 25px 30px !important;
        margin: 25px 0 !important;
    }
    
    .statistics-content {
        flex-direction: column !important;
        gap: 25px !important;
    }
    
    .statistics-echarts-card {
        flex-direction: row !important;
        height: 260px !important;
        padding: 18px !important;
        width: 100% !important;
        min-height: 260px !important;
        min-width: 280px !important;
        display: flex !important;
    }
    
    .statistics-info {
        width: 35% !important;
        padding: 15px !important;
        border-radius: 12px 0 0 12px !important;
        background-color: #CEE6E4 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
    }
    
    .statistics-info-title {
        font-size: 22px !important;
        margin: 0 !important;
        text-align: center !important;
    }
    
    .statistics-info-total {
        font-size: 16px !important;
        margin: 10px 0 !important;
        text-align: center !important;
    }
    
    .statistics-info-desc {
        font-size: 13px !important;
        line-height: 1.3 !important;
        text-align: center !important;
    }
    
    .chart-container {
        width: 65% !important;
        height: 100% !important;
        min-height: 220px !important;
        border-radius: 0 12px 12px 0 !important;
        display: block !important;
        visibility: visible !important;
        overflow: visible !important;
    }
    
    /* 模式植物区域优化 */
    .model-plant-container {
        padding: 20px 25px !important;
        margin: 25px 0 !important;
    }
    
    .plant-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 20px !important;
        padding: 15px !important;
        max-width: 100% !important;
        overflow: hidden !important;
    }
    
    .card-custom {
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }
}

/* iPhone 14 Pro Max 优化 (430×932) */
@media (width: 430px) and (height: 932px),
       (min-width: 400px) and (max-width: 460px) and (min-height: 900px) {
    .statistics-section {
        padding: 20px 15px;
        margin: 20px 0;
    }
    
    .statistics-content {
        flex-direction: column;
        gap: 20px;
    }
    
    .statistics-echarts-card {
        flex-direction: column;
        height: auto;
        padding: 15px;
        min-height: 280px;
    }
    
    .statistics-info {
        width: 100%;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 12px;
        background-color: #CEE6E4;
    }
    
    .statistics-info-title {
        font-size: 22px;
    }
    
    .statistics-info-total {
        font-size: 16px;
        margin: 8px 0;
    }
    
    .statistics-info-desc {
        font-size: 13px;
        line-height: 1.3;
    }
    
    .chart-container {
        width: 100%;
        height: 200px;
        border-radius: 12px;
    }
}

/* 中等屏幕通用优化 (768px-1023px, 1025px-1200px) */
@media (min-width: 768px) and (max-width: 1023px), (min-width: 1025px) and (max-width: 1200px) {
    .statistics-section {
        padding: 25px 30px;
        margin: 25px 0;
    }
    
    .statistics-content {
        flex-direction: column;
        gap: 25px;
    }
    
    .statistics-echarts-card {
        flex-direction: row;
        height: 300px;
        padding: 18px;
        width: 100%;
        min-width: 280px;
    }
    
    .statistics-info {
        width: 38%;
        padding: 15px;
        border-radius: 12px 0 0 12px;
        min-width: 120px;
    }
    
    .statistics-info-title {
        font-size: 24px;
    }
    
    .statistics-info-total {
        font-size: 16px;
        margin: 10px 0;
    }
    
    .statistics-info-desc {
        font-size: 13px;
        line-height: 1.3;
    }
    
    .chart-container {
        width: 62% !important;
        height: 100% !important;
        min-width: 160px !important;
        min-height: 200px !important;
        display: block !important;
        position: relative !important;
    }
}

/* 小屏幕通用优化 (480px-767px) */
@media (min-width: 480px) and (max-width: 767px) {
    .statistics-section {
        padding: 20px 20px;
        margin: 20px 0;
    }
    
    .statistics-content {
        flex-direction: column;
        gap: 20px;
    }
    
    .statistics-echarts-card {
        flex-direction: column;
        height: auto;
        padding: 16px;
        min-height: 260px;
    }
    
    .statistics-info {
        width: 100%;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 12px;
        background-color: #CEE6E4;
    }
    
    .statistics-info-title {
        font-size: 20px;
    }
    
    .statistics-info-total {
        font-size: 15px;
        margin: 8px 0;
    }
    
    .statistics-info-desc {
        font-size: 12px;
        line-height: 1.3;
    }
    
    .chart-container {
        width: 100% !important;
        height: 180px !important;
        min-width: 160px !important;
        min-height: 160px !important;
        border-radius: 12px !important;
        display: block !important;
        position: relative !important;
    }
}

/* 超小屏幕优化 (<480px) */
@media (max-width: 479px) {
    .statistics-section {
        padding: 15px 10px;
        margin: 15px 0;
        min-width: 280px;
    }
    
    .statistics-content {
        flex-direction: column;
        gap: 15px;
    }
    
    .statistics-echarts-card {
        flex-direction: column;
        height: auto;
        padding: 12px;
        min-height: 240px;
        min-width: 260px;
    }
    
    .statistics-info {
        width: 100%;
        padding: 12px;
        margin-bottom: 12px;
        border-radius: 10px;
        background-color: #CEE6E4;
    }
    
    .statistics-info-title {
        font-size: 18px;
    }
    
    .statistics-info-total {
        font-size: 14px;
        margin: 6px 0;
    }
    
    .statistics-info-desc {
        font-size: 11px;
        line-height: 1.2;
    }
    
    .chart-container {
        width: 100% !important;
        height: 160px !important;
        min-width: 150px !important;
        min-height: 150px !important;
        border-radius: 10px !important;
        display: block !important;
        position: relative !important;
    }
}

/* 修改卡片样式，移除min-width限制以适应网格布局 */
.card-custom {
    background-color: #fff;
    padding: 20px;
    border-radius: 40px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.5s ease, box-shadow 0.5s ease;
}

/* 统计区域样式 */
.statistics-section {
    background-color: #86c1bd;
    border-radius: 30px;
    padding: 40px 150px;
    margin: 40px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    min-width: 300px; /* 确保最小宽度 */
    box-sizing: border-box;
}

.statistics-title-container {
    background-color: #CEE6E4;
    border-radius: 20px;
    padding: 15px 30px;
    display: inline-block;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    text-align: center;
    width: 100%;
}

.statistics-title {
    color: #2d584b;
    font-size: 28px;
    margin: 0;
    font-weight: 600;
    letter-spacing: 1px;
}

.statistics-content {
    display: flex;
    justify-content: space-between;
    gap: 70px;
    margin-top: 20px;
}

/* ECharts 统计卡片样式 */
.statistics-echarts-card {
    position: relative;
    flex: 1;
    background-color: #fff;
    border-radius: 20px;
    padding: 20px;
    height: 400px;
    min-height: 300px; /* 防止被压缩过小 */
    min-width: 280px; /* 确保最小宽度 */
    display: flex;
    align-items: center;
    overflow: hidden;
    perspective: 1000px;
    box-sizing: border-box;
}


/* 统计信息样式 */
.statistics-info {
    width: 30%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    background-color: #CEE6E4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 15px 0 0 15px;
}

.statistics-info-title {
    margin: 0;
    font-size: 32px;
    color: #333333;
    font-weight: 700;
    text-align: center;
}

.statistics-info-total {
    margin: 15px 0;
    font-size: 20px;
    color: #555;
    font-weight: 600;
}

.statistics-info-desc {
    margin: 10px 0 0;
    font-size: 16px;
    color: #777;
    line-height: 1.4;
    text-align: center;
}

/* 图表容器样式 */
.chart-container {
    width: 70%;
    height: 100%;
    min-width: 200px;
    min-height: 200px;
    border-radius: 0 15px 15px 0;
    display: block;
    position: relative;
}

/*   通路图区域样式   */
.pathway-section {
    background-color: #e6f5f0;
    border-radius: 30px;
    padding: 40px;
    margin: 40px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.pathway-title-container {
    background-color: #CEE6E4;
    border-radius: 20px;
    padding: 15px 30px;
    display: inline-block;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    text-align: center;
    width: 100%;
}

.pathway-section-title {
    color: #2d584b;
    font-size: 28px;
    margin: 0;
    font-weight: 600;
    letter-spacing: 1px;
}

.pathway-switcher {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 24px;
}

.pathway-switch-button {
    border: 2px solid rgba(171, 223, 203, 0.9);
    border-radius: 12px;
    padding: 14px 18px;
    background: #abdfcb;
    color: #0f2f24;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-height: 96px;
}

.pathway-switch-button:hover {
    border-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(134, 193, 189, 0.18);
}

.pathway-switch-button.active {
    background: #ffffff;
    color: #1c5948;
    border-color: transparent;
    box-shadow: 0 12px 24px rgba(77, 147, 129, 0.2);
    cursor: default;
}

.pathway-switch-button.active:hover {
    transform: none;
    box-shadow: 0 12px 24px rgba(77, 147, 129, 0.2);
}

.pathway-switch-label {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 1px;
}

.pathway-switch-description {
    font-size: 0.9rem;
    line-height: 1.35;
}

.pathway-display-area {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: center;
    overflow: hidden; /* 防止内容溢出 */
}

.pathway-active-title {
    color: #1c5948;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
}

.pathway-thumb {
    width: 100%;
    height: auto;
    cursor: pointer;
    transition: transform 0.3s ease;
    border-radius: 8px;
}

.pathway-thumb:hover {
    transform: scale(1.02);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.pathway-caption {
    margin-top: 15px;
    font-size: 0.95em;
    color: #555;
    font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .pathway-section {
        padding: 25px;
    }

    .pathway-switcher {
        grid-template-columns: 1fr;
    }
    
    .pathway-section-title {
        font-size: 24px;
    }
    
    .pathway-thumb {
        width: 100%;
    }
    
    .pathway-caption {
        font-size: 0.9em;
    }
}

/* SVG查看器样式 */
.svg-viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    font-size: 24px;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
}

.svg-viewer-wrapper {
    width: 90%;
    height: 90%;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.svg-viewer-content {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
    will-change: transform;
    transition: transform 0.05s linear;
    user-select: none;
    -webkit-user-select: none;
}

.svg-viewer-content :deep(svg) {
    width: 100%;
    height: 100%;
}

.svg-viewer-content :deep(a) {
    cursor: pointer !important;
    pointer-events: all !important; /* 确保链接可点击 */
}

.svg-viewer-content :deep(a:hover) {
    opacity: 0.8;
}

.svg-viewer-content :deep(a:hover text) {
    text-decoration: underline;
    fill: #0066cc !important; /* 悬停时改变文字颜色 */
}

.svg-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 18px;
    color: #333;
}

/* 控制按钮样式 */
.svg-viewer-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 1001;
}

.control-btn {
    background: linear-gradient(135deg, #3c9a76, #86c1bd);
    border: none;
    font-size: 22px;
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.control-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.control-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.zoom-in {
    font-weight: bold;
}

.zoom-out {
    font-weight: bold;
}

.reset-view {
    font-size: 20px;
}

/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .home-page {
    padding: 0 2rem;
  }
  
  .hero-section {
    padding: 60px 40px;
    min-height: 500px;
  }
  
  .hero-title {
    font-size: 3.5rem;
    margin-bottom: 25px;
  }
  
  .hero-subtitle {
    font-size: 1.3rem;
    max-width: 800px;
  }
  
  .hero-buttons {
    gap: 25px;
    margin-top: 40px;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 15px 35px;
    font-size: 1.1rem;
  }
  
  .features-section {
    padding: 80px 40px;
  }
  
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }
  
  .feature-card {
    padding: 35px 30px;
  }
  
  .feature-icon {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }
  
  .feature-title {
    font-size: 1.4rem;
  }
  
  .stats-section {
    padding: 60px 40px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
  }
  
  .stat-card {
    padding: 30px 25px;
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
  
  .stat-label {
    font-size: 1rem;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .home-page {
    padding: 0 1rem;
  }
  
  .hero-section {
    padding: 50px 30px;
    min-height: 400px;
  }
  
  .hero-title {
    font-size: 2.8rem;
    margin-bottom: 20px;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
    max-width: 700px;
  }
  
  .hero-buttons {
    gap: 20px;
    margin-top: 30px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 12px 28px;
    font-size: 1rem;
  }
  
  .features-section {
    padding: 60px 30px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .feature-card {
    padding: 30px 25px;
  }
  
  .feature-icon {
    width: 70px;
    height: 70px;
    font-size: 2.2rem;
  }
  
  .feature-title {
    font-size: 1.3rem;
  }
  
  .feature-description {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .stats-section {
    padding: 50px 30px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  .stat-card {
    padding: 25px 20px;
  }
  
  .stat-number {
    font-size: 2.2rem;
  }
  
  .stat-label {
    font-size: 0.95rem;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .home-page {
    padding: 0 0.5rem;
  }
  
  .hero-section {
    padding: 40px 20px;
    min-height: 350px;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.2rem;
    margin-bottom: 15px;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1rem;
    line-height: 1.5;
    max-width: 100%;
    margin: 0 auto;
  }
  
  .hero-buttons {
    flex-direction: column;
    gap: 15px;
    margin-top: 25px;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 280px;
    padding: 14px 20px;
    font-size: 1rem;
    text-align: center;
  }
  
  .features-section {
    padding: 50px 20px;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .section-subtitle {
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 30px;
    color: #666;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .feature-card {
    padding: 25px 20px;
    text-align: center;
    border-radius: 15px;
  }
  
  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
    margin: 0 auto 15px;
  }
  
  .feature-title {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  
  .feature-description {
    font-size: 0.9rem;
  }
  
  .stats-section {
    padding: 40px 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stat-card {
    padding: 20px;
    text-align: center;
    border-radius: 12px;
  }
  
  .stat-number {
    font-size: 2rem;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 0.9rem;
  }
  
  /* 图片/媒体优化 */
  .hero-image,
  .feature-image {
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
  
  /* CTA区域优化 */
  .cta-section {
    padding: 40px 20px;
    text-align: center;
  }
  
  .cta-title {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }
  
  .cta-description {
    font-size: 0.9rem;
    margin-bottom: 25px;
    line-height: 1.5;
  }
  
  .cta-button {
    width: 100%;
    max-width: 280px;
    padding: 15px 20px;
    font-size: 1.1rem;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .home-page {
    padding: 0 0.25rem;
  }
  
  .hero-section {
    padding: 30px 15px;
    min-height: 300px;
  }
  
  .hero-title {
    font-size: 1.9rem;
    margin-bottom: 12px;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .hero-buttons {
    margin-top: 20px;
    gap: 12px;
  }
  
  .btn-primary,
  .btn-secondary {
    max-width: 250px;
    padding: 12px 18px;
    font-size: 0.95rem;
  }
  
  .features-section,
  .stats-section,
  .cta-section {
    padding: 35px 15px;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .section-subtitle {
    font-size: 0.85rem;
  }
  
  .feature-card {
    padding: 20px 15px;
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }
  
  .feature-title {
    font-size: 1.1rem;
  }
  
  .feature-description {
    font-size: 0.85rem;
  }
  
  .stat-card {
    padding: 18px 15px;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
  
  .cta-title {
    font-size: 1.4rem;
  }
  
  .cta-description {
    font-size: 0.85rem;
  }
  
  .cta-button {
    max-width: 250px;
    padding: 12px 18px;
    font-size: 1rem;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .hero-section {
    padding: 25px 20px;
    min-height: 250px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: row;
    justify-content: center;
    margin-top: 20px;
  }
  
  .features-section,
  .stats-section {
    padding: 35px 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .btn-primary,
  .btn-secondary,
  .cta-button {
    min-height: 44px;
    padding: 12px 20px;
  }
  
  .feature-card,
  .stat-card {
    padding: 20px;
  }
  
  /* 增加可点击区域 */
  .feature-card:hover,
  .stat-card:hover {
    transform: none; /* 移除hover效果，避免触摸设备的问题 */
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .hero-section,
  .features-section,
  .stats-section,
  .cta-section {
    border: 2px solid #000;
  }
  
  .feature-card,
  .stat-card {
    border: 2px solid #000;
  }
  
  .btn-primary,
  .btn-secondary,
  .cta-button {
    border: 2px solid #000;
  }
  
  .feature-icon {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .btn-primary,
  .btn-secondary,
  .cta-button,
  .feature-card,
  .stat-card {
    transition: none;
    animation: none;
  }
  
  /* 移除滚动动画 */
  .hero-section,
  .features-section,
  .stats-section {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .home-page {
    background: white;
    color: black;
  }
  
  .hero-buttons,
  .cta-button {
    display: none;
  }
  
  .hero-section,
  .features-section,
  .stats-section,
  .cta-section {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
  }
  
  .feature-card,
  .stat-card {
    border: 1px solid #000;
    box-shadow: none;
  }
  
  .section-title,
  .hero-title {
    color: black;
  }
}
</style>
