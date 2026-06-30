<script setup lang="ts">
import { ref } from 'vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import CytoscapePathway from '../components/CytoscapePathway.vue';
import type { ElementDefinition } from 'cytoscape';

// 引用组件实例
const cytoscapeRef = ref<InstanceType<typeof CytoscapePathway> | null>(null);

// 示例数据 - 简单的网络
const sampleElements: ElementDefinition[] = [
  // 节点
  { 
    data: { id: 'node1', label: '节点1', type: 'Metabolite' }, 
    group: 'nodes',
    position: { x: 100, y: 100 }
  },
  { 
    data: { id: 'node2', label: '节点2', type: 'GeneProduct' }, 
    group: 'nodes',
    position: { x: 200, y: 100 }
  },
  { 
    data: { id: 'node3', label: '节点3', type: 'Metabolite' }, 
    group: 'nodes',
    position: { x: 150, y: 200 }
  },
  // 边
  { 
    data: { id: 'edge1', source: 'node1', target: 'node2', arrow: 'triangle' }, 
    group: 'edges'
  },
  { 
    data: { id: 'edge2', source: 'node2', target: 'node3', arrow: 'triangle' }, 
    group: 'edges'
  },
  { 
    data: { id: 'edge3', source: 'node3', target: 'node1', arrow: 'triangle' }, 
    group: 'edges'
  }
];

// 处理节点点击事件
const handleNodeClick = (nodeData: any) => {
  console.log('节点被点击:', nodeData);
  alert(`点击了节点: ${nodeData.label}`);
};

// 处理节点悬停事件
const handleNodeHover = (nodeData: any) => {
  console.log('鼠标悬停在节点上:', nodeData);
};

// 处理节点离开事件
const handleNodeLeave = (nodeData: any) => {
  console.log('鼠标离开节点:', nodeData);
};

// 重置视图
const resetView = () => {
  cytoscapeRef.value?.resetView();
};

// 放大
const zoomIn = () => {
  cytoscapeRef.value?.zoomIn();
};

// 缩小
const zoomOut = () => {
  cytoscapeRef.value?.zoomOut();
};

// 调整视图
const adjustView = () => {
  cytoscapeRef.value?.adjustPathwayView();
};
</script>

<template>
  <div class="cytoscape-example">
    <Header />
    
    <main>
      <section class="example-section">
        <h1>Cytoscape组件示例</h1>
        <p>这个页面展示了如何在其他视图中使用CytoscapePathway组件</p>
        
        <div class="controls">
          <button @click="resetView" class="control-btn">重置视图</button>
          <button @click="zoomIn" class="control-btn">放大</button>
          <button @click="zoomOut" class="control-btn">缩小</button>
          <button @click="adjustView" class="control-btn">适应视图</button>
        </div>
        
        <div class="cytoscape-container">
          <CytoscapePathway
            ref="cytoscapeRef"
            :elements="sampleElements"
            height="500px"
            width="100%"
            @node-click="handleNodeClick"
            @node-hover="handleNodeHover"
            @node-leave="handleNodeLeave"
          />
        </div>
        
        <div class="usage-guide">
          <h2>使用指南</h2>
          <pre class="code-block">
import CytoscapePathway from '../components/CytoscapePathway.vue';
import type { ElementDefinition } from 'cytoscape';

// 引用组件实例
const cytoscapeRef = ref&lt;InstanceType&lt;typeof CytoscapePathway&gt; | null&gt;(null);

// 准备数据
const elements: ElementDefinition[] = [...];

// 在模板中使用
&lt;CytoscapePathway
  ref="cytoscapeRef"
  :elements="elements"
  height="500px"
  width="100%"
  @node-click="handleNodeClick"
/&gt;
          </pre>
          
          <h3>可用属性</h3>
          <ul>
            <li><code>elements</code>: Cytoscape元素数组 (必需)</li>
            <li><code>styles</code>: 自定义样式 (可选)</li>
            <li><code>containerClass</code>: 容器CSS类名 (可选)</li>
            <li><code>height</code>: 容器高度 (可选, 默认: '600px')</li>
            <li><code>width</code>: 容器宽度 (可选, 默认: '100%')</li>
          </ul>
          
          <h3>可用事件</h3>
          <ul>
            <li><code>@node-click</code>: 节点点击事件</li>
            <li><code>@node-hover</code>: 节点悬停事件</li>
            <li><code>@node-leave</code>: 节点离开事件</li>
          </ul>
          
          <h3>可用方法</h3>
          <ul>
            <li><code>resetView()</code>: 重置视图</li>
            <li><code>zoomIn()</code>: 放大</li>
            <li><code>zoomOut()</code>: 缩小</li>
            <li><code>adjustPathwayView()</code>: 调整视图以适应所有元素</li>
            <li><code>cyInstance</code>: 访问原始Cytoscape实例</li>
          </ul>
        </div>
      </section>
    </main>
    
    <Footer />
  </div>
</template>

<style scoped>
.cytoscape-example {
  font-family: 'Arial', sans-serif;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.example-section {
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.control-btn {
  background-color: #86c1bd;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.control-btn:hover {
  background-color: #6ba8a4;
}

.cytoscape-container {
  margin-bottom: 30px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.usage-guide {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.code-block {
  background-color: #f1f1f1;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: monospace;
  white-space: pre-wrap;
}

h2, h3 {
  margin-top: 20px;
  color: #444;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

code {
  background-color: #f1f1f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
</style> 