<template>
  <div class="primer3-form">
    <div class="form-card">
      <h2 class="section-title">Primer3</h2>
      <p class="section-description">one of the most popular primer design tools</p>
      
      <div class="form-group">
        <label for="job-name">Task Name</label>
        <input 
          id="job-name" 
          v-model="jobName" 
          type="text" 
          class="form-control" 
          placeholder="Enter Task Name"
        />
      </div>
      
      <div class="form-group">
        <label for="sequence">DNA Sequence</label>
        <div class="sequence-header">
          <span class="sequence-label">Please enter a valid DNA sequence (support FASTA format)</span>
          <button type="button" class="example-btn" @click="loadExample">
            Example Sequence
          </button>
        </div>
        <textarea 
          id="sequence" 
          v-model="sequence" 
          class="form-control sequence-textarea" 
          rows="6" 
          placeholder="Enter DNA Sequence"
        ></textarea>
      </div>
      
      <div class="form-group">
        <div class="advanced-header">
          <h3 class="advanced-title">Advanced Options</h3>
          <button type="button" class="toggle-btn" @click="toggleAdvanced">
            {{ showAdvanced ? ' Collapse' : 'Expand' }}
            <span class="toggle-icon" :class="{ 'expanded': showAdvanced }">▼</span>
          </button>
        </div>
        
        <div class="advanced-options" v-show="showAdvanced">
          <div class="options-grid">
            <div class="option">
              <label for="primer-size-min">
                <span class="option-label">Primer Minimum Length</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('min-size')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-size-min" 
                v-model="config.PRIMER_MIN_SIZE" 
                type="number" 
                class="form-control"
              />
            </div>
            
            <div class="option">
              <label for="primer-size-opt">
                <span class="option-label">Primer Optimal Length</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('opt-size')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-size-opt" 
                v-model="config.PRIMER_OPT_SIZE" 
                type="number" 
                class="form-control"
              />
            </div>
            
            <div class="option">
              <label for="primer-size-max">
                <span class="option-label">Primer Maximum Length</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('max-size')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-size-max" 
                v-model="config.PRIMER_MAX_SIZE" 
                type="number" 
                class="form-control"
              />
            </div>
            
            <div class="option">
              <label for="primer-tm-min">
                <span class="option-label">Minimum Tm Value</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('min-tm')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-tm-min" 
                v-model="config.PRIMER_MIN_TM" 
                type="number" 
                step="0.1" 
                class="form-control"
              />
            </div>
            
            <div class="option">
              <label for="primer-tm-opt">
                <span class="option-label">Optimal Tm Value</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('opt-tm')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-tm-opt" 
                v-model="config.PRIMER_OPT_TM" 
                type="number" 
                step="0.1" 
                class="form-control"
              />
            </div>
            
            <div class="option">
              <label for="primer-tm-max">
                <span class="option-label">Maximum Tm Value</span>
                <span class="tooltip-trigger" @mouseover="showTooltip('max-tm')" @mouseleave="hideTooltip">?</span>
              </label>
              <input 
                id="primer-tm-max" 
                v-model="config.PRIMER_MAX_TM" 
                type="number" 
                step="0.1" 
                class="form-control"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button 
          @click="resetForm" 
          class="btn btn-secondary" 
          :disabled="loading"
        >
          Reset
        </button>
        
        <button 
          @click="runPrimer3" 
          class="btn btn-primary" 
          :disabled="loading || !sequence"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>Design Primers</span>
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="tooltipVisible" class="tooltip-container" :style="tooltipStyle">
        <div class="tooltip-content">{{ tooltipText }}</div>
      </div>
    </div>
    
    <div v-if="result" class="result-card">
      <h3 class="result-title">Primer Design Results</h3>
      <div class="result-table-container">
        <table class="result-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in result" :key="key">
              <td>{{ key }}</td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';

// 表单数据
const jobName = ref('New Primer Design');
const sequence = ref('');
const config = reactive({
  PRIMER_MIN_SIZE: 18,
  PRIMER_OPT_SIZE: 20,
  PRIMER_MAX_SIZE: 27,
  PRIMER_MIN_TM: 57.0,
  PRIMER_OPT_TM: 60.0,
  PRIMER_MAX_TM: 63.0,
  PRIMER_PICK_LEFT_PRIMER: 1,
  PRIMER_PICK_RIGHT_PRIMER: 1,
  PRIMER_PICK_INTERNAL_OLIGO: 0
});

// 状态变量
const loading = ref(false);
const result = ref(null);
const error = ref(null);
const showAdvanced = ref(false);

// 工具提示相关
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipStyle = ref({
  top: '0px',
  left: '0px'
});

// 显示/隐藏高级选项
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value;
};

// 显示工具提示
const showTooltip = (type: string, event?: MouseEvent) => {
  tooltipVisible.value = true;
  
  // 设置工具提示内容
  switch(type) {
    case 'min-size':
      tooltipText.value = 'The shortest length of primers, usually recommended between 18-22bp';
      break;
    case 'opt-size':
      tooltipText.value = 'The ideal length of primers, usually best at around 20bp';
      break;
    case 'max-size':
      tooltipText.value = 'The longest length of primers, too long may cause primer specificity issues';
      break;
    case 'min-tm':
      tooltipText.value = 'The lowest melting temperature of primers, below this temperature may affect binding efficiency';
      break;
    case 'opt-tm':
      tooltipText.value = 'The ideal melting temperature of primers, usually recommended around 60℃';
      break;
    case 'max-tm':
      tooltipText.value = 'The highest melting temperature of primers, too high may cause non-specific binding';
      break;
    default:
      tooltipText.value = '';
  }
  
  // 如果有事件对象，设置工具提示位置
  if (event) {
    const targetElement = event.target as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    tooltipStyle.value = {
      top: `${rect.bottom + window.scrollY + 5}px`,
      left: `${rect.left + window.scrollX - 100}px`
    };
  }
};

// 隐藏工具提示
const hideTooltip = () => {
  tooltipVisible.value = false;
};

// 加载示例序列
const loadExample = () => {
  sequence.value = '>example_sequence\nGATCACGATATCGGGCATGTTGCCGTGCCGCCATAGTCGCTAGCGCTCGAGCTAGCTCGACTAGCCTAGCGGCCGCTAGCCGCTAGCTCGAGCTCGATCGACTGCTACGTAGCTCGACTAGCCGCTCGACTTATCGGCTAGCTCGACTGCAGCGCGCTAGCTAGCTGCTAAACGTAGCTAGCTCGACCGATTGCTAGCTGATCCGATCGATCTACCGCGCGCTAGCGCTCGCGCTAGCTAGCTAGCTCGCTAGCTGACTGCTAGCTAGCGCTACGCGCGCGACCGATCGATCGATCGGCGCTCGCATTTCCCCGATCGCTCGAGCATGCGTCAGCGCGCGCGATTCGACTAGCTAGCTCGCGCGCTACGCGTACGGTACCGGATCCGCTAGCCGCGCTCGACTGCATG';
};

// 提交表单
const runPrimer3 = async () => {
  if (!sequence.value) {
    error.value = 'Please enter a DNA sequence' as any;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // 发送请求到后端API
    const response = await axios.post('/KPGF_api/design/', {
      sequence: sequence.value,
      config: config,
      job_name: jobName.value
    });
    
    result.value = response.data.result;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'An error occurred while processing the request';
    console.error('Primer3 API 错误:', err);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  jobName.value = 'New Primer Design';
  sequence.value = '';
  result.value = null;
  error.value = null;
  
  // 重置为默认配置
  Object.assign(config, {
    PRIMER_MIN_SIZE: 18,
    PRIMER_OPT_SIZE: 20,
    PRIMER_MAX_SIZE: 27,
    PRIMER_MIN_TM: 57.0,
    PRIMER_OPT_TM: 60.0,
    PRIMER_MAX_TM: 63.0,
    PRIMER_PICK_LEFT_PRIMER: 1,
    PRIMER_PICK_RIGHT_PRIMER: 1,
    PRIMER_PICK_INTERNAL_OLIGO: 0
  });
};
</script>

<style scoped>
.primer3-form {
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
}

/* 卡片样式 */
.form-card, .result-card {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.form-card:hover, .result-card:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

/* 标题样式 */
.section-title {
  color: #202020;
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: left;
  font-family: 'Times New Roman', Times, serif;
}

.section-description {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
  text-align: left;
}

.result-title {
  color: #202020;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: left;
  border-left: 5px solid #86c1bd;
  padding-left: 15px;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #444;
  font-weight: 500;
  font-size: 16px;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 15px;
  background-color: #f8f8f8;
  font-size: 15px;
  transition: all 0.3s ease;
  color: #333;
}

.form-control:focus {
  outline: none;
  border-color: #86c1bd;
  box-shadow: 0 0 0 2px rgba(134, 193, 189, 0.2);
}

.form-control:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 序列输入区域样式 */
.sequence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sequence-label {
  color: #666;
  font-size: 14px;
}

.sequence-textarea {
  height: 200px;
  resize: vertical;
  font-family: monospace;
  line-height: 1.5;
}

/* 高级选项区域 */
.advanced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.advanced-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.toggle-btn {
  background: none;
  border: none;
  color: #86c1bd;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-icon {
  margin-left: 5px;
  font-size: 10px;
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.option {
  position: relative;
}

.option-label {
  margin-right: 5px;
}

/* 示例按钮样式 */
.example-btn {
  background-color: transparent;
  color: #159989;
  border: 1px solid #159989;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-btn:hover {
  background-color: #159989;
  color: white;
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #86c1bd;
  color: white;
  min-width: 120px;
}

.btn-primary:hover {
  background-color: #159989;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(21, 153, 137, 0.2);
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #555;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 加载动画 */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 工具提示样式 */
.tooltip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: #86c1bd;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  cursor: help;
  margin-left: 5px;
}

.tooltip-container {
  position: absolute;
  z-index: 1000;
}

.tooltip-content {
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  max-width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  white-space: normal;
}

/* 错误消息样式 */
.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 15px;
  border-radius: 15px;
  margin-top: 20px;
  font-size: 14px;
  border-left: 4px solid #d32f2f;
}

/* 结果表格样式 */
.result-table-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 15px;
  border: 1px solid #eee;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th, .result-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.result-table th {
  background-color: #f8f8f8;
  color: #444;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.result-table tr:hover td {
  background-color: #f9f9f9;
}

/* 自定义滚动条 */
.result-table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.result-table-container::-webkit-scrollbar-thumb {
  background-color: #86c1bd;
  border-radius: 3px;
}

.result-table-container::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .form-card, .result-card {
    padding: 20px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
}

/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .primer-form-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
  }
  
  .form-section {
    padding: 25px;
    margin-bottom: 25px;
  }
  
  .form-row {
    gap: 25px;
  }
  
  .form-group {
    min-width: 250px;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    font-size: 1rem;
    padding: 12px 15px;
  }
  
  .form-textarea {
    min-height: 150px;
  }
  
  .submit-btn {
    padding: 15px 40px;
    font-size: 1.1rem;
  }
  
  .results-table {
    font-size: 1rem;
  }
  
  .results-table th,
  .results-table td {
    padding: 12px 15px;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .primer-form-container {
    padding: 20px;
    max-width: 100%;
  }
  
  .form-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .form-row {
    gap: 15px;
    flex-wrap: wrap;
  }
  
  .form-group {
    min-width: 200px;
    flex: 1;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    font-size: 0.95rem;
    padding: 10px 12px;
  }
  
  .form-textarea {
    min-height: 120px;
  }
  
  .submit-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
  
  .results-table {
    font-size: 0.9rem;
    overflow-x: auto;
  }
  
  .results-table th,
  .results-table td {
    padding: 10px 12px;
    min-width: 100px;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .primer-form-container {
    padding: 15px 10px;
  }
  
  .form-section {
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
  }
  
  .section-title {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-group {
    width: 100%;
    min-width: auto;
  }
  
  .form-label {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    font-size: 0.9rem;
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .submit-btn {
    width: 100%;
    padding: 15px;
    font-size: 1rem;
    margin-top: 20px;
  }
  
  /* 结果表格移动端优化 */
  .results-section {
    padding: 15px;
  }
  
  .results-table {
    font-size: 0.8rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .results-table thead,
  .results-table tbody,
  .results-table th,
  .results-table td,
  .results-table tr {
    display: block;
  }
  
  .results-table thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }
  
  .results-table tr {
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  .results-table td {
    border: none;
    position: relative;
    padding: 8px 0 8px 30%;
    text-align: left;
  }
  
  .results-table td:before {
    content: attr(data-label) ": ";
    position: absolute;
    left: 6px;
    width: 25%;
    font-weight: bold;
    color: #333;
    text-align: left;
  }
  
  /* 为表格添加数据标签 */
  .results-table td:nth-child(1):before { content: "Name: "; }
  .results-table td:nth-child(2):before { content: "Sequence: "; }
  .results-table td:nth-child(3):before { content: "Length: "; }
  .results-table td:nth-child(4):before { content: "Tm: "; }
  .results-table td:nth-child(5):before { content: "GC%: "; }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .primer-form-container {
    padding: 10px 5px;
  }
  
  .form-section {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .form-label {
    font-size: 0.85rem;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    font-size: 0.85rem;
    padding: 10px;
  }
  
  .form-textarea {
    min-height: 80px;
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 0.95rem;
  }
  
  .results-table {
    font-size: 0.75rem;
  }
  
  .results-table td {
    padding: 6px 0 6px 35%;
  }
  
  .results-table td:before {
    width: 30%;
    font-size: 0.75rem;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .form-textarea {
    min-height: 60px;
  }
  
  .form-section {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .submit-btn {
    padding: 10px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .form-input,
  .form-textarea,
  .form-select,
  .submit-btn {
    min-height: 44px; /* Apple推荐的最小触摸目标 */
  }
  
  .submit-btn {
    padding: 15px 20px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .form-input,
  .form-textarea,
  .form-select {
    border: 2px solid #000;
  }
  
  .form-input:focus,
  .form-textarea:focus,
  .form-select:focus {
    outline: 3px solid #000;
  }
  
  .submit-btn {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .submit-btn,
  .form-input,
  .form-textarea,
  .form-select {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .primer-form-container {
    box-shadow: none;
  }
  
  .submit-btn {
    display: none;
  }
  
  .form-section {
    break-inside: avoid;
  }
  
  .results-table {
    font-size: 0.8rem;
  }
}
</style> 