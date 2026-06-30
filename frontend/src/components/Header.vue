<!-- src/components/Header.vue -->
<template>
    <div class="header__outer">  
        <div class="header__inner js-header-line-context"> 
            <div class="header__level-one js-header-level-one" aria-hidden="false"> 
                <div class="nav container"> 
                    <ul class="nav-left nav-left-one"></ul> 
                    <div class="nav-center">
                        <img 
                            class="logo_header" 
                            role="img" 
                            alt="SOLANACEAE Logo" 
                            src="../assets/logo6.png"
                        >
                        <!-- <div class="search-box" @click="showSearchPopup">
                            <input 
                                class="search-txt" 
                                type="text" 
                                placeholder="Search for what you need"
                                aria-label="Search input"
                            >
                            <button 
                                type="submit" 
                                class="search-btn" 
                                title="Search"
                                aria-label="Submit search"
                            >
                                <span class="search_icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                    </svg>
                                </span>
                            </button>
                        </div> -->
                    </div>
                </div> 
            </div>
        </div> 
    </div>     

    <header @mouseleave="handleHeaderMouseLeave" @mouseenter="handleHeaderMouseEnter">
        <ul id="nav">
            <div class="slide1" :style="slide1Style"></div>
            <li v-for="(item, index) in navItems" 
                :key="index"
                :class="{ 'show-dropdown': activeDropdownIndex === index, 'active': activeNavItemIndex === index }"
            >
                <a 
                    :href="item.href || '#'" 
                    @click="(e) => handleNavClick(e, index)"
                    @mouseover="(e) => handleMouseOver(e, index)"
                    @mouseout="handleMouseOut"
                >
                    {{ item.label }}
                </a>
                <div class="dropdown" v-if="item.dropdown">
                    <ul>
                        <li v-for="(subItem, subIndex) in item.dropdown" :key="subIndex">
                            <a 
                                :href="subItem.href"
                                @click.prevent="handleDropdownItemClick($event, index, subIndex)"
                            >
                                {{ subItem.label }}
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </header>
    
    <SearchPopup 
        :is-visible="isSearchPopupVisible" 
        @close="hideSearchPopup"
        @search="handleSearch"
    />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, watch, nextTick } from 'vue'
import SearchPopup from './SearchPopup.vue'
import { useRouter, useRoute } from 'vue-router'

// 搜索弹窗逻辑
const isSearchPopupVisible = ref(false)

const showSearchPopup = () => {
    isSearchPopupVisible.value = true
}

const hideSearchPopup = () => {
    isSearchPopupVisible.value = false
}

const handleSearch = (searchData: any) => {
    console.log('Search data:', searchData)
    hideSearchPopup()
}

// 修改导航菜单数据
const navData = reactive([
    { label: 'Home', href: '/', external: false },
    {
        label: 'AIpredictor',
        dropdown: [
            { label: 'GT Prediction', href: '/MLprediction/GT', external: false },
            { label: 'AT Prediction', href: '/MLprediction/AT', external: false },
            { label: 'MT Prediction', href: '/MLprediction/MT', external: false },
        ],
    },
    {
        label: 'Genome',
        dropdown: [
            { label: 'Species Genome', href: '/species-genome', external: false },
            { label: 'Gene Search', href: '/gene-search', external: false },
        ],
    },
    {
        label: 'Flavonoid',
        dropdown: [
            { label: 'Pathway', href: '/pathway', external: false },
            { label: 'Species', href: '/species-table', external: false },
            { label: 'Map', href: '/flavonoid-map', external: false },
        ],
    },
    /*{
        label: 'Protein',
        dropdown: [
            { label: 'Protein Data', href: '/protein-data', external: false },
            { label: 'Protein Search', href: '/protein-search', external: false },
        ],
    },*/
    {
        label: ' Tools ',
        dropdown: [
            { label: 'Blast', href: '/BlastView', external: false },
            { label: 'JBrowser', href: 'https://cbi.gxu.edu.cn/KPGF/html/jbrowse2/?config=config.json', external: true },
            { label: 'Primer Designer', href: '/PrimerDesigner', external: false },
            // { label: 'Cytoscape Example', href: '/cytoscape-example', external: false },
        ],
    },

    { label: 'Contact', href: '/contact', external: false },
])

const navItems = computed(() => navData)
const aiPredictionIndex = computed(() => navItems.value.findIndex(item => item.label === 'AI Prediction'))

// 导航动画状态
const activeNavItemIndex = ref(-1)
const activeDropdownIndex = ref(-1)
const slideLeft = ref(0)
const slideWidth = ref(0)

// 添加 slide1 的显示状态
const isSlideVisible = ref(true)

// 修改计算样式
const slide1Style = computed(() => ({
    opacity: isSlideVisible.value ? 1 : 0,
    left: `${slideLeft.value}px`,
    width: `${slideWidth.value}px`,
    transition: 'all 0.3s ease'
}))

// 修改点击处理函数，使用 router 进行导航
const router = useRouter()
const route = useRoute()

const updateSlidePositionForIndex = (index: number) => {
    if (index < 0) return
    const navRect = document.querySelector('#nav')?.getBoundingClientRect()
    const navItem = document.querySelector(`#nav > li:nth-child(${index + 1})`) as HTMLLIElement
    if (!navRect || !navItem) return

    const position = navItem.getBoundingClientRect()
    slideLeft.value = position.left - navRect.left
    slideWidth.value = position.width
}

const setActiveNavForRoute = async () => {
    if (!route.path.startsWith('/MLprediction')) {
        return
    }

    const aiIndex = aiPredictionIndex.value
    if (aiIndex === -1) return

    activeNavItemIndex.value = aiIndex
    activeDropdownIndex.value = -1
    await nextTick()
    updateSlidePositionForIndex(aiIndex)
}

watch(
    () => route.path,
    () => {
        void setActiveNavForRoute()
    },
    { immediate: true }
)

// 添加点击外部关闭下拉菜单的处理函数
const handleClickOutside = (event: MouseEvent) => {
    // 检查点击是否在导航菜单外部
    const nav = document.querySelector('#nav')
    if (nav && !nav.contains(event.target as Node)) {
        // 关闭所有下拉菜单
        activeDropdownIndex.value = -1
    }
}

const handleNavClick = (event: Event, index: number) => {
    event.preventDefault()
    event.stopPropagation()
    const item = navItems.value[index]
    
    if (item.href && item.external) {  // 使用 external 标志判断
        // 外部链接：直接在新标签页打开
        window.open(item.href, '_blank')
    } else if (item.href && !item.dropdown) {
        // 内部路由：使用 Vue Router
        router.push(item.href)
    } else {
        // 处理下拉菜单的显示/隐藏
        if (navItems.value[index].dropdown) {
            if (activeDropdownIndex.value === index) {
                activeDropdownIndex.value = -1
            } else {
                activeDropdownIndex.value = index
            }
        } else {
            activeDropdownIndex.value = -1
        }
    }
    
    activeNavItemIndex.value = index
    
    // 更新滑块位置
    const parentLi = (event.target as HTMLElement).closest('li') as HTMLLIElement
    if (!parentLi) return

    const navRect = document.querySelector('#nav')?.getBoundingClientRect()
    if (!navRect) return

    const position = parentLi.getBoundingClientRect()
    slideLeft.value = position.left - navRect.left
    slideWidth.value = position.width
}

const handleMouseOver = (event: Event, index: number) => {
    const parentLi = (event.target as HTMLElement).closest('li') as HTMLLIElement
    if (!parentLi) return
    
    // 获取导航项的位置
    const position = parentLi.getBoundingClientRect()
    const navRect = document.querySelector('#nav')?.getBoundingClientRect()
    if (!navRect) return

    // 计算相对于导航栏的位置
    slideLeft.value = position.left - navRect.left
    slideWidth.value = position.width
}

const handleMouseOut = (event: Event) => {
    // 检查鼠标是否移动到了下拉菜单上
    const relatedTarget = (event as MouseEvent).relatedTarget as HTMLElement
    if (relatedTarget?.closest('.dropdown')) {
        return // 如果移动到下拉菜单上，不做任何处理
    }

    // 如果不是移动到下拉菜单，则恢复到当前激活的导航项
    if (activeNavItemIndex.value !== -1) {
        const activeNavItem = document.querySelector(`#nav > li:nth-child(${activeNavItemIndex.value + 1})`)
        const navRect = document.querySelector('#nav')?.getBoundingClientRect()
        if (activeNavItem && navRect) {
            const position = activeNavItem.getBoundingClientRect()
            slideLeft.value = position.left - navRect.left
            slideWidth.value = position.width
        }
    }
}

const handleDropdownItemClick = (event: Event, index: number, subIndex: number) => {
    event.preventDefault()
    event.stopPropagation()
    activeNavItemIndex.value = index
    activeDropdownIndex.value = -1

    // 获取下拉菜单项的 href
    const href = (navItems.value[index].dropdown as any[])[subIndex].href
    if (href?.startsWith('http')) {
        // 外部链接：直接在新标签页打开
        window.open(href, '_blank')
    } else if (href) {
        // 内部路由：使用 Vue Router
        router.push(href)
    }
}

// 添加 header 的鼠标事件处理函数
const handleHeaderMouseLeave = () => {
    isSlideVisible.value = false
}

const handleHeaderMouseEnter = () => {
    isSlideVisible.value = true
}

// 添加处理下拉菜单项点击的方法
const handleDropdownClick = (href: string) => {
    if (href.startsWith('http')) {
        window.open(href, '_blank')
    } else {
        router.push(href)
    }
    activeDropdownIndex.value = -1
}

onMounted(() => {
    const initialNavItem = document.querySelector('#nav > li:first-child')
    const navRect = document.querySelector('#nav')?.getBoundingClientRect()
    if (initialNavItem && navRect) {
        const position = initialNavItem.getBoundingClientRect()
        slideLeft.value = position.left - navRect.left
        slideWidth.value = position.width
    }
    
    // 添加点击事件监听器到 document
    document.addEventListener('click', handleClickOutside)
    void setActiveNavForRoute()
})

// 在组件卸载时移除事件监听器
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

defineOptions({
  name: 'Header'
})
</script>

<style scoped>
.nav-center {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 62px;
}

.logo_header {
    height: 65px;
    width: auto;
    padding: 6px;
}

.search-box {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 38px;
    background: #b4dbca;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    height: 40px;
    border-radius: 40px;
    z-index: 999;
    display: flex;
    align-items: center;
    transition: all 0.4s ease;
}

.search-txt {
    border: none;
    background: none;
    outline: none;
    float: left;
    padding: 0;
    color: rgb(15, 15, 15);
    font-size: 16px;
    line-height: 40px;
    width: 0;
    transition: 0.4s;
}

.search-btn {
    color: #1d1d1d;
    float: right;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgb(255, 255, 255);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.4s;
    border: 2px solid #1d1d1d;
    box-sizing: border-box;
}

.search-box:hover .search-txt {
    width: 200px;
    padding: 6px;
}

.search-box:hover .search-btn {
    background: #2d584b;
    color: white;
    border-color: #2d584b;
}

header {
    background: #abdfcb;
    padding: 10px 0;
    text-align: center;
    position: relative;
    width: 100%;
    z-index: 10;
}

#nav {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style-type: none;
    background: #fff;
    box-shadow: 1px 1px 1px #00000033;
    padding: 10px 20px;
    margin: 0 auto;
    border-radius: 40px;
    border: 1px solid rgba(32, 32, 32, 0.1);
    width: 70%;
    height: 50px;
    position: relative;
    box-sizing: border-box;
}

#nav li a {
    position: relative;
    padding: 10px 30px;
    font: 550 20px 'Gotham';
    color: rgb(35, 41, 58);
    text-decoration: none;
    transition: color 0.3s ease;
}

#nav li {
    display: inline-block;
    position: relative;
    z-index: 1;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    display: none;
    z-index: 2;
    min-width: 140px;
    width: max-content;
    max-width: 180px;
    padding: 8px 0;
    border-radius: 0px 0px 40px 40px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
}

.dropdown li a {
    display: block;
    padding: 8px 12px;
    font-size: 13px;
    text-align: center;
    color: rgb(35, 41, 58);
    text-decoration: none;
    font-family: 'Gotham';
    font-weight: 400;
    white-space: normal;
    word-wrap: break-word;
    line-height: 1.2;
    box-sizing: border-box;
    width: 100%;
}


.dropdown ul {
  padding: 0;
  margin: 0;
  width: 100%;
  list-style: none;
  display: flex;
  flex-direction: column;
}


.dropdown li a:hover {
    background-color: #f5f5f5;
    color: #2d584b;
}

.show-dropdown .dropdown {
    display: block;
    pointer-events: auto;
}

.show-dropdown .dropdown:hover {
    box-shadow: 0px 4px 8px #80d8b6d0;
}

.slide1 {
    position: absolute;
    height: 50px;
    border-radius: 40em;
    transition: all 0.3s ease; /* 修改过渡效果使其更平滑 */
    top: 0;
    z-index: 0;
    background-color: #448870;
}

#nav li.active > a {
    color: #000000;
}

#nav li a:hover {
    color: #000000;
}

#nav li.active > a:hover {
    color: #ffffff;
}

/* 移动设备适配 */

/* iPad Pro 12.9" (1366x1024) 和类似大屏平板 */
@media (min-width: 1300px) and (max-width: 1400px) {
  #nav {
    padding: 10px 20px;
    width: 78%;
    height: 52px;
  }
  
  #nav li a {
    padding: 10px 28px;
    font-size: 19px;
    white-space: nowrap;
  }
  
  .dropdown {
    min-width: 140px;
    width: max-content;
    max-width: 170px;
  }
  
  .dropdown li a {
    font-size: 12px;
    padding: 6px 10px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .search-box {
    right: 35px;
  }
  
  .search-box:hover .search-txt {
    width: 200px;
  }
  
  .slide1 {
    height: 52px;
  }
}

/* 中大屏平板 (1024px-1299px) */
@media (min-width: 1024px) and (max-width: 1299px) {
  #nav {
    padding: 10px 16px;
    width: 80%;
    height: 48px;
  }
  
  #nav li a {
    padding: 10px 22px;
    font-size: 17px;
    white-space: nowrap;
  }
  
  .dropdown {
    min-width: 120px;
    width: max-content;
    max-width: 150px;
  }
  
  .dropdown li a {
    font-size: 11px;
    padding: 6px 8px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .search-box {
    right: 25px;
  }
  
  .search-box:hover .search-txt {
    width: 170px;
  }
  
  .slide1 {
    height: 48px;
  }
}

/* 中等平板端 (768px-1199px) */
@media (min-width: 768px) and (max-width: 1199px) {
  #nav {
    padding: 8px 15px;
    width: 80%;
    height: 45px;
  }
  
  #nav li a {
    padding: 8px 18px;
    font-size: 16px;
  }
  
  .dropdown {
    min-width: 110px;
    width: max-content;
    max-width: 130px;
  }
  
  .dropdown li a {
    font-size: 10px;
    padding: 5px 6px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .search-box {
    right: 20px;
  }
  
  .search-box:hover .search-txt {
    width: 160px;
  }
  
  .slide1 {
    height: 45px;
  }
}

/* 手机端 (<768px) */
@media (max-width: 767px) {
  .nav-center {
    flex-direction: column;
    padding: 10px 0;
  }
  
  .logo_header {
    height: 50px;
  }
  
  #nav {
    padding: 5px 10px;
    width: 95%;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  #nav li {
    margin: 2px;
  }
  
  #nav li a {
    padding: 6px 15px;
    font-size: 16px;
  }
  
  .dropdown {
    min-width: 100px;
    width: max-content;
    max-width: 120px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .dropdown li a {
    font-size: 9px;
    padding: 4px 6px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .search-box {
    position: absolute;
    margin:  auto;
  }
  
  .search-box:hover .search-txt {
    width: 140px;
  }
  
  .slide1 {
    height: 36px;
  }
}

/* 更小的手机屏幕 */
@media (max-width: 480px) {
  .nav-center {
    height: auto;
    flex-direction: column;
    padding: 10px 0;
  }
  
  .logo_header {
    height: 48px;
    margin-bottom: 5px;
  }
  
  .search-box {
    position: relative;
    right: auto;
    transform: none;
    margin: 5px auto;
  }
  
  #nav li a {
    padding: 8px 10px;
    font-size: 14px;
  }
  
  .dropdown {
    min-width: 90px;
    width: max-content;
    max-width: 110px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .dropdown li a {
    font-size: 8px;
    padding: 3px 5px;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .slide1 {
    height: 36px;
  }
}

/* 调试区 */

/* 响应式设计 */
/* 桌面端优化 (>1400px) */
@media (min-width: 1401px) {
  .header-container {
    padding: 0 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .logo img {
    width: 120px;
    height: 60px;
  }
  
  .nav-item {
    padding: 0 1.5rem;
    font-size: 1.1rem;
  }
  
  .dropdown-content {
    min-width: 220px;
    font-size: 1rem;
  }
  
  #nav {
    padding: 10px 20px;
    width: 70%;
    height: 55px;
  }
  
  #nav li a {
    padding: 10px 40px;
    font-size: 23px;
  }
  
  .slide1 {
    height: 55px;
  }
  
  .dropdown {
    min-width: 160px;
    width: max-content;
    max-width: 200px;
  }
  
  .dropdown li a {
    font-size: 14px;
    padding: 8px 12px;
    white-space: normal;
    word-wrap: break-word;
  }
}

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .header-container {
    padding: 0 1.5rem;
  }
  
  .logo img {
    width: 100px;
    height: 50px;
  }
  
  .nav-item {
    padding: 0 1rem;
    font-size: 1rem;
  }
  
  .dropdown-content {
    min-width: 180px;
    font-size: 0.95rem;
  }
  
  .dropdown-content a {
    padding: 8px 12px;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .header-container {
    padding: 0 1rem;
    flex-wrap: wrap;
  }
  
  .logo img {
    width: 80px;
    height: 40px;
  }
  
  .nav {
    display: none;
    width: 100%;
    flex-direction: column;
    background-color: #abdfcb;
    margin-top: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .nav.mobile-active {
    display: flex;
  }
  
  .nav-item {
    width: 100%;
    text-align: center;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1rem;
  }
  
  .nav-item:last-child {
    border-bottom: none;
  }
  
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  /* 移动端下拉菜单 */
  .dropdown {
    position: relative;
  }
  
  .dropdown-content {
    position: static;
    display: none;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: none;
    border-radius: 4px;
    margin: 8px 0;
    width: 100%;
  }
  
  .dropdown.active .dropdown-content {
    display: block;
  }
  
  .dropdown-content a {
    padding: 10px 15px;
    font-size: 0.9rem;
    color: #333;
  }
  
  /* 汉堡菜单按钮 */
  .mobile-menu-toggle {
    display: block;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .mobile-menu-toggle:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .header-container {
    padding: 0 0.5rem;
  }
  
  .logo img {
    width: 70px;
    height: 35px;
  }
  
  .nav-item {
    padding: 10px;
    font-size: 0.9rem;
  }
  
  .dropdown-content a {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .mobile-menu-toggle {
    font-size: 1.3rem;
    padding: 6px;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .header {
    min-height: 50px;
  }
  
  .header-container {
    min-height: 50px;
  }
  
  .logo img {
    width: 65px;
    height: 32px;
  }
  
  .nav-item {
    padding: 8px;
    font-size: 0.85rem;
  }
}

/* 隐藏桌面端不需要的移动菜单按钮 */
@media (min-width: 768px) {
  .mobile-menu-toggle {
    display: none;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item {
    padding: 15px;
  }
  
  .dropdown-content a {
    padding: 12px 15px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .header {
    border-bottom: 2px solid #000;
  }
  
  .nav-item {
    border: 1px solid transparent;
  }
  
  .nav-item:hover,
  .nav-item:focus {
    border-color: #fff;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .dropdown-content,
  .mobile-menu-toggle {
    transition: none;
  }
}
</style>
