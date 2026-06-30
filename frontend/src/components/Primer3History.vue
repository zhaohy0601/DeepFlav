<template>
  <div class="primer3-history">
    <div class="history-card">
      <h2 class="section-title">History</h2>
      <p class="section-description">View previous primer design tasks and their results</p>
      
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="loading-text">Loading...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else-if="jobs.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <p class="empty-text">No history records</p>
        <p class="empty-subtext">After designing primers, you will see the history records here</p>
      </div>
      
      <div v-else class="table-container">
        <table class="jobs-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Created Time</th>
              <th>Status</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.job_name }}</td>
              <td>{{ formatDate(job.created_at) }}</td>
              <td>
                <span :class="'status status-' + job.status">{{ getStatusText(job.status) }}</span>
              </td>
              <td>
                <button 
                  @click="viewJobDetails(job)" 
                  class="action-btn"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 详情模态框 -->
    <div v-if="selectedJob" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedJob.job_name }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <h4 class="section-subtitle">Task Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Created Time</span>
                <span class="info-value">{{ formatDate(selectedJob.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span :class="'info-value status status-' + selectedJob.status">
                  {{ getStatusText(selectedJob.status) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-section">
            <h4 class="section-subtitle">Sequence</h4>
            <pre class="sequence-display">{{ selectedJob.sequence }}</pre>
          </div>
          
          <div class="modal-section">
            <h4 class="section-subtitle">Results</h4>
            <div v-if="!selectedJob.result" class="no-result">No result data</div>
            <table v-else class="result-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in selectedJob.result" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface Job {
  id: string;
  job_name: string;
  created_at: string;
  status: string;
  sequence: string;
  result: any;
}

// 任务列表
const jobs = ref<Job[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedJob = ref<Job | null>(null);

// 获取历史任务列表
const fetchJobs = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get('/KPGF_api/history/'); // <-- 这是正确的地址！
    jobs.value = response.data;
  } catch (err: any) {
    error.value = '获取历史记录失败，请稍后再试';
    console.error('获取任务失败:', err);
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '等待中',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '失败'
  };
  return statusMap[status] || status;
};

// 查看任务详情
const viewJobDetails = (job: Job) => {
  selectedJob.value = job;
};

// 关闭模态框
const closeModal = () => {
  selectedJob.value = null;
};

// 生命周期钩子
onMounted(() => {
  fetchJobs();
});
</script>

<style scoped>
.primer3-history {
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
}

/* 卡片样式 */
.history-card {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-height: 80vh; /* 添加最大高度限制 */
  overflow-y: auto; /* 添加垂直滚动条 */
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #86c1bd;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
}

.history-card:hover {
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

.section-subtitle {
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(134, 193, 189, 0.3);
  border-radius: 50%;
  border-top-color: #86c1bd;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #888;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 20px;
  margin-bottom: 10px;
  color: #555;
}

.empty-subtext {
  font-size: 14px;
}

/* 错误消息 */
.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 15px;
  border-radius: 15px;
  margin-top: 20px;
  font-size: 14px;
  border-left: 4px solid #d32f2f;
}

/* 表格容器 */
.table-container {
  overflow-x: auto;
  border-radius: 15px;
  border: 1px solid #eee;
}

/* 任务表格样式 */
.jobs-table {
  width: 100%;
  border-collapse: collapse;
}

.jobs-table th, .jobs-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.jobs-table th {
  background-color: #f8f8f8;
  color: #444;
  font-weight: 600;
  white-space: nowrap;
}

.jobs-table tr:hover td {
  background-color: #f9f9f9;
}

/* 状态标签 */
.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-processing, .status-pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status-failed {
  background-color: #ffebee;
  color: #c62828;
}

/* 操作按钮 */
.action-btn {
  background-color: #86c1bd;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #159989;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(21, 153, 137, 0.2);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background-color: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  color: #202020;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

.modal-section {
  margin-bottom: 25px;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
}

.info-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 序列显示 */
.sequence-display {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  line-height: 1.5;
  font-size: 14px;
  margin: 0;
}

.no-result {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}

/* 结果表格 */
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
}

.result-table tr:hover td {
  background-color: #f9f9f9;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #555;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .history-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px;
  }
  
  .search-container {
    max-width: 500px;
    margin: 0 auto 30px;
  }
  
  .search-input {
    font-size: 1.1rem;
    padding: 12px 20px;
  }
  
  .history-table {
    font-size: 1rem;
  }
  
  .history-table th,
  .history-table td {
    padding: 15px 20px;
  }
  
  .action-btn {
    padding: 8px 16px;
    font-size: 0.95rem;
    margin: 0 4px;
  }
  
  .pagination-controls {
    gap: 8px;
  }
  
  .page-btn {
    min-width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .history-container {
    padding: 20px;
    max-width: 100%;
  }
  
  .search-container {
    max-width: 400px;
    margin: 0 auto 20px;
  }
  
  .search-input {
    font-size: 1rem;
    padding: 10px 15px;
  }
  
  .history-table {
    font-size: 0.9rem;
    overflow-x: auto;
  }
  
  .history-table th,
  .history-table td {
    padding: 12px 15px;
    min-width: 120px;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    margin: 0 2px;
  }
  
  .pagination-controls {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .pagination-info {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .history-container {
    padding: 15px 10px;
  }
  
  .history-header h2 {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .search-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .search-input {
    font-size: 1rem;
    padding: 12px 15px;
    width: 100%;
    box-sizing: border-box;
  }
  
  /* 卡片式布局替代表格 */
  .history-table {
    display: none;
  }
  
  .mobile-history-list {
    display: block;
  }
  
  .history-item {
    background: white;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #159989;
  }
  
  .history-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  
  .history-item-title {
    font-weight: bold;
    color: #333;
    font-size: 1rem;
  }
  
  .history-item-date {
    font-size: 0.8rem;
    color: #666;
    white-space: nowrap;
  }
  
  .history-item-details {
    margin: 10px 0;
  }
  
  .history-item-detail {
    display: flex;
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
  
  .detail-label {
    font-weight: 600;
    color: #555;
    min-width: 80px;
  }
  
  .detail-value {
    color: #333;
    flex: 1;
    word-break: break-all;
  }
  
  .history-item-actions {
    display: flex;
    gap: 8px;
    margin-top: 15px;
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
    border-radius: 6px;
    flex: 1;
    min-width: 70px;
    text-align: center;
  }
  
  /* 分页控件移动端优化 */
  .pagination-container {
    margin-top: 20px;
  }
  
  .pagination-info {
    text-align: center;
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #666;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
    padding: 0;
  }
  
  .page-btn.prev-next {
    min-width: 40px;
    font-weight: bold;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .history-container {
    padding: 10px 5px;
  }
  
  .history-header h2 {
    font-size: 1.3rem;
  }
  
  .search-input {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
  
  .history-item {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
  
  .history-item-title {
    font-size: 0.9rem;
  }
  
  .history-item-date {
    font-size: 0.75rem;
  }
  
  .history-item-detail {
    font-size: 0.8rem;
    flex-direction: column;
    margin-bottom: 8px;
  }
  
  .detail-label {
    min-width: auto;
    margin-bottom: 2px;
  }
  
  .action-btn {
    padding: 6px 8px;
    font-size: 0.8rem;
    min-width: 60px;
  }
  
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .page-btn.prev-next {
    min-width: 36px;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .history-item {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .history-item-actions {
    margin-top: 10px;
  }
  
  .action-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

/* 桌面端显示表格，隐藏移动端列表 */
@media (min-width: 768px) {
  .mobile-history-list {
    display: none;
  }
  
  .history-table {
    display: table;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .action-btn,
  .page-btn {
    min-height: 44px;
  }
  
  .search-input {
    min-height: 44px;
  }
  
  .history-item {
    padding: 18px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .history-item {
    border: 2px solid #000;
    border-left: 6px solid #000;
  }
  
  .action-btn {
    border: 2px solid #000;
  }
  
  .search-input {
    border: 2px solid #000;
  }
  
  .search-input:focus {
    outline: 3px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .action-btn,
  .page-btn,
  .history-item {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .search-container,
  .pagination-container,
  .history-item-actions {
    display: none;
  }
  
  .history-container {
    box-shadow: none;
  }
  
  .history-item {
    border: 1px solid #000;
    box-shadow: none;
    break-inside: avoid;
  }
  
  .history-table {
    font-size: 0.8rem;
  }
  
  .history-table th,
  .history-table td {
    padding: 8px;
  }
}
</style>