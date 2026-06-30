<template>
    <footer>
        <div class="footer-inner-header flex"></div>
        <div>
            <!-- 波浪效果的 SVG -->
            <svg
                class="footer-waves"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shape-rendering="auto"
            >
                <defs>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                    />
                </defs>
                <g class="footer-parallax">
                    <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                    <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                    <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                    <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
                </g>
            </svg>
        </div>
        <div class="footer-content flex">
            <div class="footer-info">
                <div class="footer-logo-row">
                    <a
                        class="footer-logo-link"
                        href="https://www.gxu.edu.cn/"
                        target="_blank"
                        rel="noreferrer"
                        title="Guangxi University"
                    >
                        <img :src="gxuLogo" alt="Guangxi University logo" />
                    </a>
                    <a
                        class="footer-logo-link"
                        href="https://sklcusa.gxu.edu.cn/"
                        target="_blank"
                        rel="noreferrer"
                        title="State Key Laboratory for Conservation and Utilization of Subtropical Agro-bioresources"
                    >
                        <img :src="labLogo" alt="State Key Laboratory logo" />
                    </a>
                </div>
                <p>Developed by the Chen LL's Lab at Guangxi University</p>
                <p>
                    Contact:
                    <button
                        type="button"
                        class="email-copy-button"
                        title="Click to copy"
                        @click="copyEmail"
                    >
                        {{ copied ? 'Copied!' : contactEmail }}
                    </button>
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import gxuLogo from '../assets/GXU_logo.f7e82857.png'
import labLogo from '../assets/GuoZhong.d90a2ad6.png'

defineOptions({
  name: 'Footer'
})

const contactEmail = '2408391061@st.gxu.edu.cn'
const copied = ref(false)
let copiedTimer: number | null = null

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(contactEmail)
    copied.value = true

    if (copiedTimer) {
      window.clearTimeout(copiedTimer)
    }

    copiedTimer = window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch (error) {
    console.error('Failed to copy email:', error)
  }
}
</script>

<style scoped>
/* 页脚基础样式 */
footer * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

footer h1 {
    font-weight: 300;
    letter-spacing: 2px;
    font-size: 48px;
}

footer p {
    font-family: 'Lato', sans-serif;
    letter-spacing: 1px;
    font-size: 20px;
    color: #333333;
    line-height: 1.35;
}

/* 页脚内部的波浪效果 */
.footer-inner-header {
    height: 20vh;
    width: 100%;
    margin: 0;
    padding: 0;
}

.flex {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

/* 波浪 SVG 样式 */
.footer-waves {
    position: relative;
    width: 100%;
    height: 15vh;
    margin-bottom: -7px;
    min-height: 100px;
    max-height: 150px;
}

/* 页脚文本部分 */
.footer-content {
    position: relative;
    height: 20vh;
    width: 100%;
    text-align: center;
    background-color: #fff;
}

.footer-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 6px 20px;
}

.footer-info p {
    font-size: 16px;
    line-height: 1.3;
}

.footer-logo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    width: 100%;
    margin-bottom: 2px;
}

.footer-logo-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    transition: transform 0.2s ease, filter 0.2s ease;
}

.footer-logo-link:hover {
    transform: translateY(-3px);
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.18));
}

.footer-logo-link img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.footer-logo-link:nth-child(2) img {
    transform: scale(1.08);
}

.email-copy-button {
    display: inline;
    border: 0;
    background: transparent;
    color: #333333;
    font: inherit;
    letter-spacing: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease, text-decoration-color 0.2s ease;
}

.email-copy-button:hover {
    color: #0b6b3a;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
}

/* 波浪效果的动画 */
.footer-parallax > use {
    animation: footer-move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
}

.footer-parallax > use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
}

.footer-parallax > use:nth-child(2) {
    animation-delay: -3s;
    animation-duration: 10s;
}

.footer-parallax > use:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
}

.footer-parallax > use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
}

/* 波浪效果的移动动画 */
@keyframes footer-move-forever {
    0% {
        transform: translate3d(-90px, 0, 0);
    }
    100% {
        transform: translate3d(85px, 0, 0);
    }
}

/* 小屏幕设备的自适应调整 */
/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .footer-waves {
    height: 60px;
    min-height: 60px;
  }

  .footer-content {
    height: 25vh;
    padding: 15px;
  }

  footer p {
    font-size: 18px;
    line-height: 1.4;
  }

  .footer-inner-header {
    height: 15vh;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .footer-waves {
    height: 40px;
    min-height: 40px;
  }

  .footer-content {
    height: 30vh;
    padding: 10px;
    flex-direction: column;
    gap: 10px;
  }

  footer p {
    font-size: 16px;
    line-height: 1.3;
    text-align: center;
    margin: 5px 0;
  }

  .footer-inner-header {
    height: 10vh;
  }

  .footer-logo-row {
    gap: 24px;
  }

  .footer-logo-link {
    width: 58px;
    height: 58px;
  }

  /* 优化波浪动画性能 */
  .footer-parallax > use {
    animation-duration: 15s;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .footer-waves {
    height: 30px;
    min-height: 30px;
  }

  .footer-content {
    height: 25vh;
    padding: 8px;
  }

  footer p {
    font-size: 14px;
    line-height: 1.2;
    margin: 3px 0;
  }

  .footer-inner-header {
    height: 8vh;
  }

  .footer-logo-link {
    width: 50px;
    height: 50px;
  }

  /* 简化波浪动画以提升性能 */
  .footer-parallax > use:nth-child(3),
  .footer-parallax > use:nth-child(4) {
    display: none;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .footer-waves {
    height: 25px;
    min-height: 25px;
  }

  .footer-content {
    height: 20vh;
    padding: 5px;
  }

  footer p {
    font-size: 13px;
  }

  .footer-logo-link {
    width: 44px;
    height: 44px;
  }

  .footer-inner-header {
    height: 5vh;
  }
}

/* 高对比度和可访问性优化 */
@media (prefers-reduced-motion: reduce) {
  .footer-parallax > use,
  .footer-logo-link,
  .email-copy-button {
    animation: none;
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .footer-waves {
    display: none;
  }

  .footer-content {
    background-color: white !important;
    color: black !important;
    height: auto;
  }

  footer p {
    font-size: 12px;
  }
}
</style>
