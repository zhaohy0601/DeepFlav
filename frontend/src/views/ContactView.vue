<template>
  <div class="contact-page">
    <Header />
    
    <main class="contact-container">
      <section class="contact-header">
        <div class="contact-title-container">
          <h1 class="contact-title">Contact Us</h1>
          <p class="contact-subtitle">Should there be any question, please let us know without hesitation!</p>
        </div>
      </section>
      
      <section class="contact-content">
        <div class="contact-section">
          <div class="section-header">
            <i class="section-icon">💻</i>
            <h2 class="section-title">Web Development</h2>
          </div>
          <div class="contact-cards">
            <button class="email-button" @click="copyEmail('13557989515wyc@gmail.com')">
              <p>Hongyun Zhao</p>
              <span class="copy-tooltip" :class="{ 'show': copiedEmail === '13557989515wyc@gmail.com' }">Copied!</span>
            </button>
          </div>
        </div>
        
        <div class="contact-section">
          <div class="section-header">
            <i class="section-icon">🌐</i>
            <h2 class="section-title">Analysis</h2>
          </div>
          <div class="contact-cards">
            <button class="email-button" @click="copyEmail('13557989515wyc@gmail.com')">
              <p>Xuemeng Zhao</p>
              <span class="copy-tooltip" :class="{ 'show': copiedEmail === '13557989515wyc@gmail.com' }">Copied!</span>
            </button>
          </div>
        </div>
        
        <div class="contact-section">
          <div class="section-header">
            <i class="section-icon">🎓</i>
            <h2 class="section-title">Professor</h2>
          </div>
          <div class="contact-cards">
            <button class="email-button" @click="copyEmail(' llchen@gxu.edu.cn')">
              <p>Ling-Ling Chen</p>
              <span class="copy-tooltip" :class="{ 'show': copiedEmail === 'llchen@gxu.edu.cn' }">Copied!</span>
            </button>
            <button class="email-button" @click="copyEmail('hao.guo@gxu.edu.cn')">
              <p>Hao Guo</p>
              <span class="copy-tooltip" :class="{ 'show': copiedEmail === 'hao.guo@gxu.edu.cn' }">Copied!</span>
            </button>
          </div>
        </div>
        
        <div class="github-section">
          <h2 class="section-title">Project Repository</h2>
          <a href="https://github.com/your-repo-link" target="_blank" class="github-button">
            <svg width="40" height="40" fill="#0092E4" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="github">
              <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"></path>
            </svg>
          </a>
        </div>
      </section>
    </main>
    
    <Footer />
    
    <!-- 添加复制成功弹窗 -->
    <div class="copy-alert" :class="{ 'show-alert': showAlert }">
      <div class="alert-content">
        <i class="success-icon">✓</i>
        <span>Email copied successfully!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const copiedEmail = ref('')
const showAlert = ref(false)

const copyEmail = (email: string) => {
  navigator.clipboard.writeText(email)
    .then(() => {
      copiedEmail.value = email
      showAlert.value = true
      setTimeout(() => {
        copiedEmail.value = ''
        showAlert.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('Failed to copy: ', err)
    })
}
</script>

<style scoped>
.contact-page {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-image: linear-gradient(20deg, #fafafa, #abdfcb, #86c1bd, #e6f8f1, #faf5f0, #ffffff);
  min-height: 100vh;
}

.contact-container {
  padding: 40px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #e6f8f1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.contact-header {
  flex: 1;
  display: flex;
  align-items: center;
}

.contact-title-container {
  background-color: #86c1bd;
  border-radius: 20px;
  padding: 40px 20px;
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.contact-title {
  color: #000000;
  font-size: 36px;
  margin: 0 0 10px 0;
  font-weight: 600;
  font-family: 'Times New Roman', Times, serif;
}

.contact-subtitle {
  color: #fff;
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

.contact-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.contact-section {
  flex: 1;
  background: white;
  border-radius: 0px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.contact-form {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #e0e0e0;
}

.contact-info {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e0e0e0;
}

.map-container {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  height: 300px;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1rem;
}


.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-left: none;
  padding-left: 0;
  flex-direction: column;
  gap: 10px;
}

.section-icon {
  font-size: 32px;
  margin-right: 0;
}

.section-title {
  color: #2d584b;
  font-size: 24px;
  margin: 0;
  text-align: center;
}

.contact-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

/* Email Button Styles */
.email-button {
  all: unset;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.6em 2em;
  border: #86c1bd solid 0.15em;
  border-radius: 0.25em;
  color: #86c1bd;  
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: border 300ms, color 300ms;
  user-select: none;
}

.email-button p {
  z-index: 1;
  margin: 0;
}

.email-button:hover {
  color: #212121;
}

.email-button:active {
  border-color: teal;
}

.email-button::after, .email-button::before {
  content: "";
  position: absolute;
  width: 9em;
  aspect-ratio: 1;
  background: #86c1bd;
  opacity: 50%;
  border-radius: 50%;
  transition: transform 500ms, background 300ms;
}

.email-button::before {
  left: 0;
  transform: translateX(-8em);
}

.email-button::after {
  right: 0;
  transform: translateX(8em);
}

.email-button:hover:before {
  transform: translateX(-1em);
}

.email-button:hover:after {
  transform: translateX(1em);
}

.email-button:active:before,
.email-button:active:after {
  background: teal;
}

.copy-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.copy-tooltip.show {
  opacity: 1;
}

/* GitHub Button Styles */
.github-section {
  display: flex;
  background-color: #ffffff;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.github-button {
  display: grid;
  place-items: center;
  background: #e3edf7;
  padding: 0.5em;
  border-radius: 10px;
  box-shadow: 6px 6px 10px -1px rgba(0,0,0,0.15),
        -6px -6px 10px -1px rgba(255,255,255,0.7);
  border: 1px solid rgba(0,0,0,0);
  cursor: pointer;
  transition: transform 0.5s;
  text-decoration: none;
}

.github-button:hover {
  box-shadow: inset 4px 4px 6px -1px rgba(0,0,0,0.2),
        inset -4px -4px 6px -1px rgba(255,255,255,0.7),
        -0.5px -0.5px 0px rgba(255,255,255,1),
        0.5px 0.5px 0px rgba(0,0,0,0.15),
        0px 12px 10px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  transform: translateY(0.5em);
}

.github-button svg {
  transition: transform 0.5s;
}

.github-button:hover svg {
  transform: scale(0.9);
  fill: #333333;
}

/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .contact-page {
    padding: 0 2rem;
  }
  
  .contact-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: stretch;
  }
  
  .contact-header {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .contact-title-container {
    width: 100%;
    min-height: 800px;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .contact-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0px;
  }

  .main-content {
    padding: 40px 30px;
    max-width: 100%;
  }

  .contact-form {
    padding: 30px;
  }

  .form-group {
    margin-bottom: 25px;
  }

  .form-input,
  .form-textarea {
    font-size: 1rem;
    padding: 12px 15px;
  }

  .form-textarea {
    min-height: 140px;
  }

  .submit-btn {
    padding: 15px 40px;
    font-size: 1.1rem;
  }

  .contact-info {
    padding: 30px;
  }

  .info-item {
    margin-bottom: 25px;
    font-size: 1rem;
  }

  .map-container {
    height: 350px;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .contact-page {
    padding: 0 1rem;
  }
  
  .contact-container {
    flex-direction: column;
    gap: 20px;
    padding: 30px 20px;
  }
  
  .contact-header {
    flex: none;
  }
  
  .contact-title-container {
    min-height: 200px;
    padding: 30px 20px;
  }
  
  .contact-content {
    flex: none;
  }
  
  .main-content {
    padding: 30px 20px;
    max-width: 100%;
  }
  
  .contact-form {
    padding: 25px;
    order: 1;
  }
  
  .contact-info {
    padding: 25px;
    order: 2;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-input,
  .form-textarea {
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
  
  .info-item {
    margin-bottom: 20px;
    font-size: 0.95rem;
  }
  
  .map-container {
    height: 350px;
    border-radius: 10px;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .contact-page {
    padding: 0 0.5rem;
  }
  
  .contact-container {
    flex-direction: column;
    gap: 15px;
    padding: 20px 10px;
  }
  
  .contact-header {
    flex: none;
  }
  
  .contact-title-container {
    min-height: 150px;
    padding: 25px 15px;
  }
  
  .contact-title {
    font-size: 28px;
  }
  
  .contact-subtitle {
    font-size: 16px;
  }
  
  .contact-content {
    flex: none;
  }
  
  .main-content {
    padding: 20px 10px;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 25px;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
  
  .page-subtitle {
    font-size: 1rem;
    line-height: 1.4;
    color: #666;
  }
  
  .contact-form {
    padding: 20px 15px;
    border-radius: 12px;
    order: 1;
  }
  
  .form-title {
    font-size: 1.4rem;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-label {
    font-size: 0.95rem;
    margin-bottom: 6px;
    display: block;
  }
  
  .form-input,
  .form-textarea {
    font-size: 1rem;
    padding: 12px 15px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 8px;
  }
  
  .form-textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .submit-btn {
    width: 100%;
    padding: 15px;
    font-size: 1.1rem;
    border-radius: 8px;
  }
  
  .contact-info {
    padding: 20px 15px;
    border-radius: 12px;
    order: 2;
  }
  
  .info-title {
    font-size: 1.4rem;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .info-item {
    margin-bottom: 18px;
    font-size: 0.9rem;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  
  .info-icon {
    font-size: 1.2rem;
    color: #159989;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  .info-content {
    flex: 1;
  }
  
  .info-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 3px;
  }
  
  .info-value {
    color: #666;
    line-height: 1.4;
    word-break: break-all;
  }
  
  .map-container {
    height: 250px;
    border-radius: 10px;
    margin-top: 20px;
    order: 3;
  }
  
  /* 社交媒体链接 */
  .social-links {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  
  .social-link {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #159989;
    color: white;
    text-decoration: none;
    font-size: 1.2rem;
    transition: background-color 0.3s ease;
  }
  
  .social-link:hover {
    background-color: #0c8c42;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .contact-page {
    padding: 0 0.25rem;
  }
  
  .main-content {
    padding: 15px 8px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .contact-form,
  .contact-info {
    padding: 15px 12px;
  }
  
  .form-title,
  .info-title {
    font-size: 1.3rem;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .form-input,
  .form-textarea {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
  
  .form-textarea {
    min-height: 80px;
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 1rem;
  }
  
  .info-item {
    margin-bottom: 15px;
    font-size: 0.85rem;
    gap: 8px;
  }
  
  .info-icon {
    font-size: 1.1rem;
  }
  
  .map-container {
    height: 200px;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .main-content {
    padding: 15px 10px;
  }
  
  .contact-container {
    gap: 15px;
  }
  
  .contact-form,
  .contact-info {
    padding: 15px;
  }
  
  .form-textarea {
    min-height: 60px;
  }
  
  .map-container {
    height: 180px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .form-input,
  .form-textarea,
  .submit-btn {
    min-height: 44px;
  }
  
  .social-link {
    min-width: 44px;
    min-height: 44px;
  }
  
  .info-item {
    padding: 8px 0;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .contact-form,
  .contact-info {
    border: 2px solid #000;
  }
  
  .form-input,
  .form-textarea {
    border: 2px solid #000;
  }
  
  .form-input:focus,
  .form-textarea:focus {
    outline: 3px solid #000;
  }
  
  .submit-btn {
    border: 2px solid #000;
  }
  
  .social-link {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .submit-btn,
  .social-link,
  .form-input,
  .form-textarea {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .contact-page {
    background: white;
  }
  
  .submit-btn,
  .social-links,
  .map-container {
    display: none;
  }
  
  .contact-form,
  .contact-info {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
  }
  
  .contact-container {
    display: block;
  }
  
  .info-item {
    margin-bottom: 10px;
    font-size: 0.9rem;
  }
}
</style> 