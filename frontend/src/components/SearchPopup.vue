<template>
    <div class="popup-overlay" :class="{ 'show': isVisible }" @click="handleOverlayClick">
        <div class="popup-box">
            <div id="crispr"> 
                <div class="searchTitle">Search</div>
                <div class="box6a_search">Input Gene ID</div>
                <div class="box7_search">
                    <input 
                        name="Description" 
                        class="search_input" 
                        v-model="searchInput"
                        placeholder="Description"
                        aria-label="Search description"
                    >
                </div>
                
                <div class="box6a_search">Species</div>
                <div class="box7_search">
                    <input
                        name="search_species" 
                        id="search_species" 
                        class="search_input"
                        v-model="selectedSpecies"
                        title="Select species"
                    >  
                </input>
                </div>

                <div class="box6a_search">Flavonoid Pathway</div>
                <div class="box7_search">
                    <select 
                        name="search_genes" 
                        id="choose_gene" 
                        class="search_input"
                        v-model="selectedGene"
                        title="Select gene"
                    >
                        <option value="All" selected>All</option>
                        <option value="Flavones">Flavones</option>
                        <option value="Flavonols">Flavonols</option>
                        <option value="Flavanones">Flavanones</option>
                        <option value="isoflavones">isoflavones</option>  
                        <option value="Anthocyanins">Anthocyanins</option>
                        <option value="Flavanols">Flavanols</option>
                    </select>
                </div>

                <div class="box7_search">
                    <button class="btn" @click="handleSearch">Search</button>
                    <button class="btn" @click="handleClose">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    isVisible: boolean
}>()

const emit = defineEmits<{
    close: []
    search: [searchData: any]
}>()

const searchInput = ref('')
const selectedSpecies = ref('All')
const selectedGene = ref('All')

const handleOverlayClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
        emit('close')
    }
}

const handleSearch = () => {
    emit('search', {
        input: searchInput.value,
        species: selectedSpecies.value,
        gene: selectedGene.value
    })
}

const handleClose = () => {
    emit('close')
}
</script>

<style scoped>
/* 弹窗整体容器 */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-overlay.show {
    display: flex;
}

/* 弹窗内容框 */
.popup-box {
    background-color: white;
    width: 90%;
    max-width: 400px;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    text-align: center;
    margin: 20px;
}

/* 标题设置 */
.searchTitle {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 20px;
}

/* 方框标题 */
.box6a_search {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: left;
}

/* 输入框和选择框统一样式 */
.search_input {
    width: 100%;
    height: 40px;
    padding: 8px;
    font-size: 14px;
    border-radius: 5px;
    border: 2px solid #1d1d1d;
    margin-bottom: 10px;
    box-sizing: border-box;
    outline: none;
}

.search_input:focus {
    border-color: #448870;
}

/* 选择框样式 */
select.search_input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: rgb(255, 255, 255);
    padding-right: 20px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231d1d1d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
}

/* 提交按钮 */
.btn {
    padding: 10px 20px;
    background-color: #448870;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 10px;
}

.btn:hover {
    background-color: #2d584b;
}

/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .search-popup {
    padding: 40px;
  }
  
  .popup-content {
    max-width: 600px;
    min-height: 400px;
    border-radius: 16px;
    padding: 30px;
  }
  
  .popup-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
  
  .search-input {
    font-size: 1.1rem;
    padding: 15px 20px;
    height: 50px;
  }
  
  .search-results {
    max-height: 300px;
  }
  
  .result-item {
    padding: 15px 20px;
    font-size: 1rem;
  }
  
  .close-btn {
    width: 35px;
    height: 35px;
    font-size: 1.5rem;
    top: 20px;
    right: 20px;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-popup {
    padding: 30px 20px;
  }
  
  .popup-content {
    max-width: 500px;
    min-height: 350px;
    border-radius: 12px;
    padding: 25px;
  }
  
  .popup-title {
    font-size: 1.6rem;
    margin-bottom: 20px;
  }
  
  .search-input {
    font-size: 1rem;
    padding: 12px 16px;
    height: 45px;
  }
  
  .search-results {
    max-height: 250px;
  }
  
  .result-item {
    padding: 12px 16px;
    font-size: 0.95rem;
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    font-size: 1.3rem;
    top: 15px;
    right: 15px;
  }
  
  .no-results {
    padding: 30px;
    font-size: 1rem;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .search-popup {
    padding: 20px 10px;
    align-items: flex-start;
    padding-top: 60px; /* 为移动端状态栏留出空间 */
  }
  
  .popup-content {
    width: calc(100% - 20px);
    max-width: none;
    min-height: 300px;
    border-radius: 10px;
    padding: 20px;
    margin: 0;
    position: relative;
  }
  
  .popup-title {
    font-size: 1.4rem;
    margin-bottom: 15px;
    text-align: center;
    padding-right: 40px; /* 为关闭按钮留出空间 */
  }
  
  .search-input {
    font-size: 1rem;
    padding: 12px 15px;
    height: 48px; /* 符合移动端触摸标准 */
    width: 100%;
    box-sizing: border-box;
  }
  
  .search-results {
    max-height: 200px;
    margin-top: 15px;
  }
  
  .result-item {
    padding: 15px;
    font-size: 0.9rem;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
  }
  
  .result-item:last-child {
    border-bottom: none;
  }
  
  .result-item:active {
    background-color: #e6f8f1;
  }
  
  .close-btn {
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
    top: 12px;
    right: 12px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
  }
  
  .close-btn:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .no-results {
    padding: 25px 15px;
    font-size: 0.9rem;
    text-align: center;
  }
  
  /* 移动端滚动优化 */
  .search-results {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  
  .search-results::-webkit-scrollbar {
    width: 4px;
  }
  
  .search-results::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .search-popup {
    padding: 15px 5px;
    padding-top: 50px;
  }
  
  .popup-content {
    width: calc(100% - 10px);
    min-height: 280px;
    padding: 15px;
    border-radius: 8px;
  }
  
  .popup-title {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  
  .search-input {
    font-size: 0.9rem;
    padding: 10px 12px;
    height: 44px;
  }
  
  .search-results {
    max-height: 180px;
  }
  
  .result-item {
    padding: 12px;
    font-size: 0.85rem;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 1.1rem;
    top: 10px;
    right: 10px;
  }
  
  .no-results {
    padding: 20px 10px;
    font-size: 0.85rem;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .search-popup {
    padding-top: 20px;
  }
  
  .popup-content {
    min-height: 250px;
  }
  
  .search-results {
    max-height: 150px;
  }
  
  .popup-title {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }
}

/* 全屏模式适配 */
@media (max-width: 479px) and (max-height: 600px) {
  .search-popup {
    padding: 10px 5px;
    padding-top: 30px;
  }
  
  .popup-content {
    min-height: auto;
    max-height: 90vh;
    padding: 12px;
  }
  
  .popup-title {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  
  .search-results {
    max-height: 120px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .search-input {
    min-height: 44px;
  }
  
  .result-item {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .close-btn {
    min-width: 44px;
    min-height: 44px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .popup-content {
    border: 3px solid #000;
  }
  
  .search-input {
    border: 2px solid #000;
  }
  
  .search-input:focus {
    outline: 3px solid #000;
    outline-offset: 2px;
  }
  
  .result-item {
    border-bottom: 2px solid #000;
  }
  
  .close-btn {
    border: 2px solid #000;
    background-color: #fff;
    color: #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .search-popup,
  .popup-content,
  .result-item,
  .close-btn {
    transition: none;
    animation: none;
  }
}

/* 打印时隐藏弹窗 */
@media print {
  .search-popup {
    display: none;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .popup-content {
    background-color: #2d3748;
    color: #e2e8f0;
  }
  
  .search-input {
    background-color: #4a5568;
    color: #e2e8f0;
    border-color: #718096;
  }
  
  .result-item:hover {
    background-color: #4a5568;
  }
  
  .close-btn {
    color: #e2e8f0;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
