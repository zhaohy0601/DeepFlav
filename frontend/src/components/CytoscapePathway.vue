<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineEmits } from 'vue';
import cytoscape from 'cytoscape';
import type { ElementDefinition, StylesheetJson } from 'cytoscape';

// 定义 Props
const props = defineProps<{
  elements: ElementDefinition[];
  styles?: StylesheetJson;
  containerClass?: string;
  height?: string; // 新增：自定义高度
  width?: string;  // 新增：自定义宽度
}>();

// 定义事件
const emit = defineEmits<{
  'node-click': [nodeData: any];
  'node-hover': [nodeData: any];
  'node-leave': [nodeData: any];
}>();

// 默认样式
const defaultStyles = [
  {
    selector: 'node',
    style: {
      'background-color': '#86c1bd',
      'label': 'data(label)',
      'width': '10px',
      'height': '10px',
      'shape': 'circle',
      'font-size': '5px',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '55px',
      'border-width': 1,
      'border-color': '#777',
    },
  },
  {
    selector: 'node[type="Metabolite"]',
    style: {
      'background-color': '#addec0',
      'shape': 'ellipse',
      'width': '10px',
      'height': '10px',
      'text-valign': 'bottom',
      'text-margin-y': '20px',
    },
  },
  {
    selector: 'node[type="Protein"], node[type="GeneProduct"]',
    style: {
      'background-color': '#f0e68c',
      'shape': 'rectangle',
    },
  },
  {
    selector: 'node[gpmlType="Label"]',
    style: {
      'background-opacity': 0,
      'border-width': 0,
      'shape': 'rectangle',
      'font-size': '10px',
      'color': '#555',
      'text-valign': 'center',
      'text-halign': 'center',
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5,
      'line-color': '#bbb',
      'target-arrow-shape': 'data(arrow)',
      'target-arrow-color': '#bbb',
      'curve-style': 'bezier',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#e74c3c',
    },
  },
  {
    selector: 'node.hover',
    style: {
      'border-width': 3,
      'border-color': '#3498db',
    },
  },
] as unknown as StylesheetJson;

// 容器 Ref
const containerRef = ref<HTMLDivElement | null>(null);
const cyInstance = ref<cytoscape.Core | null>(null);

// 预处理元素函数以正确处理坐标
function preprocessElements(elements: ElementDefinition[]) {
  // 收集所有节点ID
  const nodeIds = new Set();
  const validElements: ElementDefinition[] = [];
  
  // 第一步：找出所有有效节点并收集坐标范围
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let hasNegativeX = false;
  
  elements.forEach(el => {
    if (el.group === 'nodes' && el.data && el.data.id) {
      nodeIds.add(el.data.id);
      
      // 收集坐标范围
      if (el.position) {
        minX = Math.min(minX, el.position.x);
        maxX = Math.max(maxX, el.position.x);
        minY = Math.min(minY, el.position.y);
        maxY = Math.max(maxY, el.position.y);
        
        // 检查是否有负X坐标
        if (el.position.x < 0) {
          hasNegativeX = true;
        }
      }
      
      // 添加到有效元素
      validElements.push(el);
    }
  });
  
  // 计算坐标调整量（如果有负坐标则需要平移）
  const offsetX = hasNegativeX ? Math.abs(minX) + 50 : 0;
  
  // 如果有负X坐标，调整所有节点
  if (hasNegativeX) {
    console.log(`检测到负X坐标，调整所有节点位置，偏移量: ${offsetX}`);
    validElements.forEach(el => {
      if (el.group === 'nodes' && el.position) {
        el.position.x += offsetX;
      }
    });
  }
  
  // 添加有效边缘
  elements.forEach(el => {
    if (el.group === 'edges' && el.data) {
      const sourceExists = el.data.source && nodeIds.has(el.data.source);
      const targetExists = el.data.target && nodeIds.has(el.data.target);
      
      if (sourceExists && targetExists) {
        validElements.push(el);
      } else {
        console.warn(`过滤无效边缘: ${el.data.id}, source: ${el.data.source}, target: ${el.data.target}`);
      }
    }
  });
  
  return validElements;
}

// 视图调整辅助函数
function adjustPathwayView() {
  if (!cyInstance.value) return;
  
  // 获取当前边界
  const bounds = cyInstance.value.elements().boundingBox();
  const width = cyInstance.value.width();
  const height = cyInstance.value.height();
  
  // 计算总宽度和高度
  const graphWidth = bounds.x2 - bounds.x1;
  const graphHeight = bounds.y2 - bounds.y1;
  
  // 计算合适的缩放级别
  const widthRatio = width / (graphWidth + 100);
  const heightRatio = height / (graphHeight + 100);
  const zoomLevel = Math.min(widthRatio, heightRatio) * 0.9; // 稍微缩小以确保完全可见
  
  // 计算视图中心
  const centerX = (bounds.x1 + bounds.x2) / 2;
  const centerY = (bounds.y1 + bounds.y2) / 2;
  
  // 调整视图
  cyInstance.value.zoom({
    level: zoomLevel,
    position: { x: centerX, y: centerY }
  });
  
  // 调整平移
  cyInstance.value.pan({
    x: width / 2 - centerX * zoomLevel,
    y: height / 2 - centerY * zoomLevel
  });
}

// 初始化 Cytoscape
const initializePathwayMap = () => {
  if (!containerRef.value) return;

  try {
    // 预处理元素，确保所有边缘都有有效的源和目标节点
    const validElements = preprocessElements(props.elements);
    
    cyInstance.value = cytoscape({
      container: containerRef.value,
      elements: validElements,
      style: props.styles || defaultStyles,
      layout: {
        name: 'preset',
        fit: true,
        padding: 50,
        animate: false,
      },
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 4,
      boxSelectionEnabled: false,
      userPanningEnabled: true,
    });

    // 添加事件监听
    cyInstance.value.on('tap', 'node', (event) => {
      const nodeData = event.target.data();
      console.log('点击节点:', nodeData.label, nodeData);
      // 发射节点点击事件
      emit('node-click', nodeData);
    });

    cyInstance.value.on('mouseover', 'node', (event) => {
      event.target.addClass('hover');
      // 发射节点悬停事件
      emit('node-hover', event.target.data());
    });

    cyInstance.value.on('mouseout', 'node', (event) => {
      event.target.removeClass('hover');
      // 发射节点离开事件
      emit('node-leave', event.target.data());
    });

    cyInstance.value.ready(() => {
      setTimeout(() => {
        if (cyInstance.value) {
          // 重置视图以确保所有元素可见
          cyInstance.value.reset();
          
          // 首先尝试适应所有元素
          cyInstance.value.fit(undefined, 50);
          
          // 获取当前视图中心
          const center = cyInstance.value.pan();
          const width = cyInstance.value.width();
          
          // 如果左侧元素不可见，调整视图中心
          cyInstance.value.pan({
            x: center.x - width * 0.1, // 稍微向左移动视图
            y: center.y
          });
          
          // 调整缩放比例
          cyInstance.value.zoom({
            level: cyInstance.value.zoom() * 0.9,
            renderedPosition: { 
              x: cyInstance.value.width() / 2, 
              y: cyInstance.value.height() / 2 
            }
          });
        }
      }, 300);
    });
  } catch (error) {
    console.error('初始化 Cytoscape 错误:', error);
  }
};

// 暴露方法给父组件
const resetView = () => {
  if (cyInstance.value) {
    cyInstance.value.reset();
    cyInstance.value.fit(undefined, 50);
  }
};

const zoomIn = () => {
  if (cyInstance.value) {
    const currentZoom = cyInstance.value.zoom();
    cyInstance.value.zoom({
      level: currentZoom * 1.2,
      renderedPosition: { 
        x: cyInstance.value.width() / 2, 
        y: cyInstance.value.height() / 2 
      }
    });
  }
};

const zoomOut = () => {
  if (cyInstance.value) {
    const currentZoom = cyInstance.value.zoom();
    cyInstance.value.zoom({
      level: currentZoom * 0.8,
      renderedPosition: { 
        x: cyInstance.value.width() / 2, 
        y: cyInstance.value.height() / 2 
      }
    });
  }
};

// 将方法暴露给父组件
defineExpose({
  resetView,
  zoomIn,
  zoomOut,
  adjustPathwayView,
  cyInstance
});

// 生命周期钩子
onMounted(() => {
  initializePathwayMap();
});

onUnmounted(() => {
  if (cyInstance.value) {
    cyInstance.value.destroy();
    cyInstance.value = null;
  }
});
</script>

<template>
  <div ref="containerRef" :class="containerClass || 'pathway-map-container'" :style="{ 
    height: height || '600px',
    width: width || '100%'
  }"></div>
</template>

<style scoped>
.pathway-map-container {
  border: 1px solid #ddd;
  background-color: #e6f8f1;
  position: relative;
  overflow: visible;
  margin: 0 auto;
}

/* 确保Cytoscape容器内部的元素正确显示 */
:deep(.cytoscape-container) {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

:deep(canvas) {
  /* 确保canvas能显示全部内容 */
  left: 0 !important;
  width: 100% !important;
}

/* 响应式设计 - 桌面端 (>1024px) */
@media (min-width: 1025px) {
  .pathway-map-container {
    max-width: 1200px;
    border-radius: 12px;
  }
}

/* 响应式设计 - 平板端 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .pathway-map-container {
    height: 500px;
    max-width: 100%;
    margin: 0 10px;
    border-radius: 8px;
  }
  
  /* 调整工具提示字体大小 */
  :deep(.cytoscape-tooltip) {
    font-size: 12px;
  }
  
  /* 调整节点标签字体大小 */
  :deep(.cy-node-label) {
    font-size: 10px;
  }
}

/* 响应式设计 - 手机端 (<768px) */
@media (max-width: 767px) {
  .pathway-map-container {
    height: 350px;
    width: 100%;
    margin: 0 5px;
    border-radius: 6px;
    border-width: 1px;
  }
  
  /* 手机端优化节点和边的显示 */
  :deep(.cytoscape-tooltip) {
    font-size: 10px;
    padding: 4px 6px;
  }
  
  :deep(.cy-node-label) {
    font-size: 8px;
  }
  
  /* 优化触摸交互 */
  :deep(.cytoscape-container) {
    touch-action: manipulation;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .pathway-map-container {
    height: 280px;
    margin: 0 2px;
    border-radius: 4px;
  }
  
  :deep(.cytoscape-tooltip) {
    font-size: 9px;
    padding: 3px 5px;
  }
  
  :deep(.cy-node-label) {
    font-size: 7px;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .pathway-map-container {
    height: 250px;
  }
}

/* 高DPI屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  :deep(canvas) {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style> 