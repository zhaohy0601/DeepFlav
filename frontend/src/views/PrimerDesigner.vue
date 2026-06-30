<template>
  <div class="primer-designer-page">
    <Header />
    
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">Primer Design Tool</h1>
        <p class="page-description">
          A simple and efficient tool for designing and optimizing primer sequences used in PCR experiments. This tool is based on the Primer3 core algorithm and can automatically design primers that meet specific conditions based on the provided DNA sequence.
        </p>
      </div>
      
      <!-- 导航切换 -->
      <div class="tab-navigation">
        <button 
          @click="activeTab = 'form'" 
          class="tab-button" 
          :class="{ active: activeTab === 'form' }"
        >
          Design Primers
        </button>
        <button 
          @click="activeTab = 'history'" 
          class="tab-button" 
          :class="{ active: activeTab === 'history' }"
        >
          History
        </button>
      </div>
      
      <!-- 组件内容区域 -->
      <div class="tab-content">
        <transition name="fade" mode="out-in">
          <Primer3Form v-if="activeTab === 'form'" />
          <Primer3History v-else-if="activeTab === 'history'" />
        </transition>
      </div>
      
      <!-- 使用说明 -->
      <div class="usage-guidelines">
        <h2 class="section-title">Usage Guidelines</h2>
        
        <div class="guidelines-grid">
          <div class="guideline-card">
            <div class="guideline-icon">1</div>
            <h3 class="guideline-title">Enter DNA Sequence</h3>
            <p class="guideline-description">
              Enter the DNA sequence you want to design primers in the text box. You can directly paste the sequence or use the example sequence for testing. Supports FASTA format.
            </p>
          </div>
          
          <div class="guideline-card">
            <div class="guideline-icon">2</div>
            <h3 class="guideline-title">Configure Parameters</h3>
            <p class="guideline-description">
              Adjust the primer design parameters according to your experimental needs, such as primer length and melting temperature. The default parameters are suitable for most standard PCR experiments.
            </p>
          </div>
          
          <div class="guideline-card">
            <div class="guideline-icon">3</div>
            <h3 class="guideline-title">Run Analysis</h3>
            <p class="guideline-description">
              Click the "Design Primers" button to start the analysis. The system will design the optimal primer pairs based on the provided sequence and parameters.
            </p>
          </div>
          
          <div class="guideline-card">
            <div class="guideline-icon">4</div>
            <h3 class="guideline-title">View Results</h3>
            <p class="guideline-description">
              After the analysis is complete, you will see the designed primer sequences and their characteristic parameters. You can view all previous design results in the "History" tab.
            </p>
          </div>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Primer3Form from '@/components/Primer3Form.vue';
import Primer3History from '@/components/Primer3History.vue';

// 当前活动标签
const activeTab = ref('form');

defineOptions({
  name: 'PrimerDesigner'
})
</script>

<style scoped>
.primer-designer-page {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-image: linear-gradient(20deg, #fafafa, #abdfcb, #86c1bd, #e6f8f1, #faf5f0, #ffffff);
  min-height: 100vh;
}

/* 主体内容样式 */
.main-content {
  padding: 20px;
  max-width: 2000px;
  margin: 0 auto 30px;
  background-color: #e6f8f1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

/* 页面标题区域 */
.page-header {
  text-align: center;
  padding: 30px 20px;
  background-color: #ffffff;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-title {
  color: #202020;
  font-size: 42px;
  margin-bottom: 15px;
  font-weight: 600;
  font-family: 'Times New Roman', Times, serif;
}

.page-description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  background-color: #fff;
  padding: 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.tab-button:hover {
  color: #159989;
  background-color: #f8f8f8;
}

.tab-button.active {
  background-color: #86c1bd;
  color: white;
  box-shadow: 0 4px 8px rgba(21, 153, 137, 0.2);
}

/* 内容区域 */
.tab-content {
  margin-bottom: 40px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 使用指南区域 */
.usage-guidelines {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 30px;
  margin-top: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.usage-guidelines:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

.section-title {
  color: #202020;
  font-size: 28px;
  margin-bottom: 25px;
  font-weight: 600;
  text-align: center;
  font-family: 'Times New Roman', Times, serif;
}

.guidelines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.guideline-card {
  background-color: #f8f8f8;
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}



.guideline-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #86c1bd;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 50%;
  margin: 0 auto 15px;
}

.guideline-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.guideline-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 响应式调整增强 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .main-content {
    max-width: 2000px;
    padding: 40px;
  }
  
  .page-title {
    font-size: 48px;
  }
  
  .page-description {
    font-size: 18px;
    max-width: 900px;
  }
  
  .tab-navigation {
    max-width: 600px;
    margin: 0 auto 40px;
  }
  
  .tab-button {
    padding: 15px 40px;
    font-size: 18px;
  }
  
  .guidelines-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 35px;
  }
  
  .guideline-card {
    padding: 35px 30px;
  }
  
  .guideline-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .guideline-title {
    font-size: 20px;
  }
  
  .guideline-description {
    font-size: 16px;
  }
}

/* 平板端适配增强 */
@media (min-width: 768px) and (max-width: 1024px) {
  .main-content {
    padding: 30px 25px;
  }
  
  .page-title {
    font-size: 38px;
  }
  
  .page-description {
    font-size: 16px;
    max-width: 700px;
  }
  
  .tab-navigation {
    max-width: 500px;
    margin: 0 auto 30px;
  }
  
  .tab-button {
    padding: 12px 25px;
    font-size: 16px;
  }
  
  .guidelines-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
  
  .guideline-card {
    padding: 25px 20px;
  }
  
  .guideline-icon {
    width: 45px;
    height: 45px;
    font-size: 22px;
  }
  
  .guideline-title {
    font-size: 18px;
  }
  
  .guideline-description {
    font-size: 14px;
  }
}

/* 手机端适配增强 */
@media (max-width: 767px) {
  .primer-designer-page {
    padding: 0 0.5rem;
  }
  
  .main-content {
    padding: 20px 15px;
    margin: 0 auto 20px;
  }
  
  .page-header {
    padding: 25px 15px;
    text-align: center;
  }
  
  .page-title {
    font-size: 28px;
    margin-bottom: 12px;
    line-height: 1.3;
  }
  
  .page-description {
    font-size: 14px;
    line-height: 1.5;
    max-width: 100%;
  }
  
  /* 标签导航移动端优化 */
  .tab-navigation {
    flex-direction: column;
    padding: 6px;
    margin-bottom: 25px;
    max-width: 100%;
  }
  
  .tab-button {
    width: 100%;
    padding: 15px 20px;
    font-size: 16px;
    margin: 3px 0;
    border-radius: 10px;
  }
  
  .tab-button:first-child {
    margin-top: 0;
  }
  
  .tab-button:last-child {
    margin-bottom: 0;
  }
  
  /* 使用指南移动端优化 */
  .usage-guidelines {
    padding: 25px 15px;
    margin-top: 25px;
    border-radius: 20px;
  }
  
  .section-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .guidelines-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 25px;
  }
  
  .guideline-card {
    padding: 20px 15px;
    border-radius: 15px;
    text-align: left;
  }
  
  .guideline-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin: 0 0 12px 0;
    float: left;
    margin-right: 15px;
  }
  
  .guideline-title {
    font-size: 16px;
    margin-bottom: 8px;
    padding-left: 55px;
  }
  
  .guideline-description {
    font-size: 13px;
    line-height: 1.4;
    clear: both;
    padding-left: 0;
  }
}

/* 超小屏幕适配 */
@media (max-width: 479px) {
  .primer-designer-page {
    padding: 0 0.25rem;
  }
  
  .main-content {
    padding: 15px 10px;
    margin: 0 auto 15px;
  }
  
  .page-header {
    padding: 20px 10px;
  }
  
  .page-title {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .page-description {
    font-size: 13px;
  }
  
  .tab-navigation {
    padding: 4px;
    margin-bottom: 20px;
  }
  
  .tab-button {
    padding: 12px 15px;
    font-size: 14px;
  }
  
  .usage-guidelines {
    padding: 20px 12px;
    margin-top: 20px;
  }
  
  .section-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
  
  .guidelines-grid {
    gap: 15px;
    margin-top: 20px;
  }
  
  .guideline-card {
    padding: 15px 12px;
  }
  
  .guideline-icon {
    width: 35px;
    height: 35px;
    font-size: 16px;
    margin-right: 12px;
  }
  
  .guideline-title {
    font-size: 14px;
    padding-left: 47px;
  }
  
  .guideline-description {
    font-size: 12px;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .page-header {
    padding: 15px;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .tab-navigation {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .tab-button {
    width: auto;
    min-width: 140px;
    margin: 3px;
  }
  
  .guidelines-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .tab-button {
    min-height: 44px;
    padding: 12px 20px;
  }
  
  .guideline-card {
    padding: 20px 15px;
  }
  
  /* 移除hover效果，使用active状态 */
  .guideline-card:hover {
    transform: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  
  .guideline-card:active {
    transform: translateY(1px);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .main-content,
  .usage-guidelines {
    border: 2px solid #000;
  }
  
  .tab-navigation {
    border: 2px solid #000;
  }
  
  .tab-button {
    border: 1px solid #000;
  }
  
  .tab-button.active {
    border: 2px solid #000;
  }
  
  .guideline-card {
    border: 2px solid #000;
  }
  
  .guideline-icon {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .tab-button,
  .guideline-card,
  .usage-guidelines {
    transition: none;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .primer-designer-page {
    background: white;
  }
  
  .tab-navigation {
    display: none;
  }
  
  .main-content,
  .usage-guidelines {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
  }
  
  .guideline-card {
    border: 1px solid #000;
    box-shadow: none;
    break-inside: avoid;
  }
  
  .page-title,
  .section-title {
    color: black;
  }
}
</style> 