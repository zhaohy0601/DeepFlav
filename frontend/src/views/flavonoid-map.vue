<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const mapTabs = [
    {
        id: 'GT',
        label: 'GT',
        title: 'Glycosyltransferase (GT) Map',
        subtitle: 'Visualize glycosyltransferase-centered reactions across the flavonoid pathway.',
        description: 'GT enzymes transfer sugar molecules to flavonoid skeletons to diversify their structures.',
        svgFile: 'fla-pathway-gt.svg'
    },
    {
        id: 'AT',
        label: 'AT',
        title: 'Acyltransferase (AT) Map',
        subtitle: 'Highlight acylation modules impacting stability and solubility.',
        description: 'AT enzymes modify flavonoids with acyl groups to fine-tune activity and transport.',
        svgFile: 'fla-pathway-at.svg'
    },
    {
        id: 'MT',
        label: 'MT',
        title: 'Methyltransferase (MT) Map',
        subtitle: 'Examine methylation events that modulate signaling capacity.',
        description: 'MT enzymes methylate flavonoid rings, affecting coloration and biological function.',
        svgFile: 'fla-pathway-mt.svg'
    }
]

const activeTabId = ref(mapTabs[0].id)

const activeMap = computed(() => {
    return mapTabs.find((tab) => tab.id === activeTabId.value) ?? mapTabs[0]
})

const selectTab = (tabId: string) => {
    if (activeTabId.value !== tabId) {
        activeTabId.value = tabId
        // Close viewer to prevent stale zoom state when switching maps
        if (isViewerOpen.value) {
            closeViewer()
        }
    }
}

const getImageUrl = (name: string) => {
    return new URL(`../assets/${name}`, import.meta.url).href
}

const svgUrl = computed(() => getImageUrl(activeMap.value.svgFile))
const svgContent = ref<string>('')

const loadSvgContent = async (url: string) => {
    try {
        svgContent.value = ''
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to load SVG')
        const content = await response.text()
        if (url !== svgUrl.value) return
        svgContent.value = content

        const viewBoxMatch = content.match(/viewBox="([^"]*)"/)
        if (viewBoxMatch) {
            svgViewBox.value = viewBoxMatch[1]
        }
    } catch (error) {
        console.error('Error loading SVG:', error)
    }
}

const isViewerOpen = ref(false)
const scale = ref(1)
const translate = reactive({ x: 0, y: 0 })
const minScale = 0.5
const maxScale = 3
const zoomStep = 0.2
let lastPointer: { x: number; y: number } | null = null
const isDragging = ref(false)
const viewerWrapperRef = ref<HTMLElement | null>(null)
const svgViewBox = ref<string>('0 0 1333.3 750')
let dragStartPosition = { x: 0, y: 0 }
const dragThreshold = 25
let hasDragged = false
let clickStartTime = 0
const clickTimeThreshold = 300

watch(
    svgUrl,
    (newUrl) => {
        if (!newUrl) return
        loadSvgContent(newUrl)
    },
    { immediate: true }
)

const computedViewBox = computed(() => {
    if (!viewerWrapperRef.value) return svgViewBox.value

    const [x, y, width, height] = svgViewBox.value.split(' ').map(Number)
    const scaledWidth = width / scale.value
    const scaledHeight = height / scale.value
    const newX = x - translate.x / scale.value
    const newY = y - translate.y / scale.value

    return `${newX} ${newY} ${scaledWidth} ${scaledHeight}`
})

const processedSvgContent = computed(() => {
    if (!svgContent.value) return ''

    return svgContent.value.replace(/viewBox="[^"]*"/, `viewBox="${computedViewBox.value}"`)
})

const handleSvgLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const linkElement = target.closest('a')

    if (linkElement && !hasDragged) {
        const href = linkElement.getAttribute('href')
        const targetAttr = linkElement.getAttribute('target')

        if (href) {
            e.preventDefault()
            e.stopPropagation()
            window.open(href, targetAttr || '_blank')
        }
    }
}

const openViewer = () => {
    isViewerOpen.value = true
    document.addEventListener('keydown', handleKeyDown)
    resetView()
}

const closeViewer = () => {
    isViewerOpen.value = false
    resetView()
    document.removeEventListener('keydown', handleKeyDown)
}

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        closeViewer()
    }
}

const zoomIn = () => {
    const newScale = Math.min(maxScale, scale.value + zoomStep)

    if (newScale !== scale.value && viewerWrapperRef.value) {
        const rect = viewerWrapperRef.value.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const scaleDiff = newScale / scale.value

        requestAnimationFrame(() => {
            scale.value = newScale
            translate.x = centerX - (centerX - translate.x) * scaleDiff
            translate.y = centerY - (centerY - translate.y) * scaleDiff
        })
    }
}

const zoomOut = () => {
    const newScale = Math.max(minScale, scale.value - zoomStep)

    if (newScale !== scale.value && viewerWrapperRef.value) {
        const rect = viewerWrapperRef.value.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const scaleDiff = newScale / scale.value

        requestAnimationFrame(() => {
            scale.value = newScale
            translate.x = centerX - (centerX - translate.x) * scaleDiff
            translate.y = centerY - (centerY - translate.y) * scaleDiff
        })
    }
}

const resetView = () => {
    requestAnimationFrame(() => {
        scale.value = 1
        translate.x = 0
        translate.y = 0

        const viewBoxMatch = svgContent.value.match(/viewBox="([^"]*)"/)
        if (viewBoxMatch) {
            svgViewBox.value = viewBoxMatch[1]
        }
    })
}

const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep
    const newScale = Math.max(minScale, Math.min(maxScale, scale.value + delta))

    if (newScale !== scale.value) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const scaleDiff = newScale / scale.value

        requestAnimationFrame(() => {
            scale.value = newScale
            translate.x = mouseX - (mouseX - translate.x) * scaleDiff
            translate.y = mouseY - (mouseY - translate.y) * scaleDiff
        })
    }
}

const onPointerDown = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLElement
    lastPointer = { x: e.clientX, y: e.clientY }
    dragStartPosition = { x: e.clientX, y: e.clientY }
    hasDragged = false
    clickStartTime = Date.now()

    const clickedElement = document.elementFromPoint(e.clientX, e.clientY)
    const isLink = clickedElement?.closest('a') || clickedElement?.tagName === 'A'

    if (!isLink) {
        target.setPointerCapture(e.pointerId)
        target.style.cursor = 'grabbing'
    }
}

const onPointerMove = (e: PointerEvent) => {
    if (!lastPointer) return

    const dx = e.clientX - lastPointer.x
    const dy = e.clientY - lastPointer.y
    const totalDx = e.clientX - dragStartPosition.x
    const totalDy = e.clientY - dragStartPosition.y
    const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy)

    if (totalDistance > dragThreshold) {
        if (!hasDragged) {
            hasDragged = true
            isDragging.value = true

            const target = e.currentTarget as HTMLElement
            target.setPointerCapture(e.pointerId)
            target.style.cursor = 'grabbing'
        }

        requestAnimationFrame(() => {
            translate.x += dx
            translate.y += dy
            lastPointer = { x: e.clientX, y: e.clientY }
        })
    }
}

const onPointerUp = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLElement
    const clickDuration = Date.now() - clickStartTime

    if (e.pointerId !== undefined && target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId)
    }

    const totalDx = e.clientX - dragStartPosition.x
    const totalDy = e.clientY - dragStartPosition.y
    const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy)

    if (totalDistance <= dragThreshold && clickDuration < clickTimeThreshold) {
        hasDragged = false
        isDragging.value = false

        const clickedElement = document.elementFromPoint(e.clientX, e.clientY)
        const linkElement = clickedElement?.closest('a')

        if (linkElement) {
            const href = linkElement.getAttribute('href')
            const targetAttr = linkElement.getAttribute('target')

            if (href) {
                e.preventDefault()
                e.stopPropagation()
                window.open(href, targetAttr || '_blank')
            }
        }
    } else if (hasDragged) {
        e.preventDefault()
        e.stopPropagation()
        isDragging.value = false
    }

    lastPointer = null
    target.style.cursor = 'grab'
}

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
    <div class="flavonoid-map">
        <Header />

        <main class="map-main">
            <div class="map-container">
                <aside class="map-sidebar">
                    <div class="sidebar-card">
                        <h2 class="sidebar-title">Flavonoid Map</h2>
                        <p class="sidebar-subtitle">
                            Switch between enzymatic modules to explore identical map interactions from different perspectives.
                        </p>
                        <ul class="map-tabs">
                            <li v-for="tab in mapTabs" :key="tab.id">
                                <button
                                    class="map-tab-button"
                                    :class="{ active: tab.id === activeTabId }"
                                    type="button"
                                    @click="selectTab(tab.id)"
                                >
                                    <span class="tab-label">{{ tab.label }}</span>
                                    <span class="tab-description">{{ tab.description }}</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                <section class="map-content">
                    <div class="map-header">
                        <div class="map-header-title">
                            <h1>{{ activeMap.title }}</h1>
                            <p>{{ activeMap.subtitle }}</p>
                        </div>
                        <div class="map-status-pill">
                            Map Mode
                        </div>
                    </div>

                    <div class="pathway-section">
                        <div class="pathway-section-title">Interactive Pathway Map</div>
                        <div class="pathway-display-area">
                            <img
                                :src="svgUrl"
                                alt="Flavonoid Pathway"
                                class="pathway-thumb"
                                @click="openViewer"
                            />
                            <p class="pathway-caption">
                                Click the pathway image to open the responsive viewer with zoom & pan controls.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <div
            v-if="isViewerOpen"
            class="svg-viewer-overlay"
        >
            <button class="close-btn" @click="closeViewer" type="button">✕</button>
            <div
                ref="viewerWrapperRef"
                class="svg-viewer-wrapper"
                @wheel.prevent="onWheel"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
            >
                <div
                    v-if="svgContent"
                    class="svg-viewer-content"
                    v-html="processedSvgContent"
                    @click="handleSvgLinkClick"
                ></div>
                <div v-else class="svg-loading">
                    Loading pathway diagram...
                </div>
            </div>
            <div class="svg-viewer-controls">
                <button class="control-btn zoom-in" @click="zoomIn" type="button">+</button>
                <button class="control-btn zoom-out" @click="zoomOut" type="button">−</button>
                <button class="control-btn reset-view" @click="resetView" type="button">⟳</button>
            </div>
        </div>

        <Footer />
    </div>
</template>

<style scoped>
.flavonoid-map {
    background-image: linear-gradient(140deg, #ffffff, #e6f8f1, #abdfcb, #f5fffa);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.map-main {
    flex: 1;
    padding: 30px 20px 60px;
}

.map-container {
    max-width: 1800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 320px 1fr;
    column-gap: 0;
    row-gap: 24px;
    align-items: stretch;
}

.map-sidebar {
    position: relative;
    display: flex;
}

.sidebar-card {
    background: #abdfcb;
    border-radius: 24px;
    padding: 24px 0;
    box-shadow: 0 10px 30px rgba(134, 193, 189, 0.25);
    border: 1px solid rgba(171, 223, 203, 0.7);
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #0f2f24;
    overflow: hidden;
}

.sidebar-title {
    font-size: 24px;
    margin: 0;
    color: #13362e;
    font-weight: 600;
}

.sidebar-title,
.sidebar-subtitle {
    padding: 0 24px;
}

.sidebar-subtitle {
    margin: 10px 0 20px;
    color: #4b6b5e;
    font-size: 0.95rem;
    line-height: 1.5;
}

.map-tabs {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.map-tab-button {
    width: 100%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 0;
    padding: 16px 24px;
    background: #abdfcb;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #0f2f24;
}

.map-tab-button:hover {
    border-color: rgba(255, 255, 255, 0.9);
    transform: translateX(4px);
    box-shadow: 0 10px 20px rgba(134, 193, 189, 0.15);
}

.map-tab-button.active {
    background: #ffffff;
    color: #1c5948;
    border-color: transparent;
    box-shadow: 0 12px 24px rgba(77, 147, 129, 0.25);
    cursor: default;
}

.map-tab-button.active:hover {
    transform: none;
    box-shadow: 0 12px 24px rgba(77, 147, 129, 0.25);
    border-color: transparent;
}

.map-tab-button.active .tab-label {
    color: #1c5948;
}

.tab-label {
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: 1px;
}

.tab-description {
    font-size: 0.9rem;
    color: inherit;
}

.map-content {
    background: #ffffff;
    border-radius: 24px;
    padding: 30px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.map-header-title h1 {
    margin: 0;
    font-size: 28px;
    color: #1c5948;
}

.map-header-title p {
    margin: 6px 0 0;
    color: #4e6f63;
}

.map-status-pill {
    background: #abdfcb;
    color: #19483b;
    border-radius: 999px;
    padding: 8px 20px;
    font-weight: 600;
}

.pathway-section {
    background: #f5fffa;
    border-radius: 20px;
    padding: 25px;
    border: 1px dashed rgba(134, 193, 189, 0.5);
}

.pathway-section-title {
    color: #2d584b;
    font-size: 22px;
    margin-bottom: 16px;
    font-weight: 600;
    text-align: center;
}

.pathway-display-area {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: center;
    overflow: hidden;
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
    font-size: 0.95rem;
    color: #4a5c57;
    font-style: italic;
}

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
}

.svg-viewer-content {
    width: 100%;
    height: 100%;
    transform-origin: 0 0;
    will-change: transform;
    transition: transform 0.05s linear;
    user-select: none;
}

.svg-viewer-content :deep(svg) {
    width: 100%;
    height: 100%;
}

.svg-viewer-content :deep(a) {
    cursor: pointer !important;
    pointer-events: all !important;
}

.svg-viewer-content :deep(a:hover) {
    opacity: 0.8;
}

.svg-viewer-content :deep(a:hover text) {
    text-decoration: underline;
    fill: #0066cc !important;
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

.zoom-in,
.zoom-out {
    font-weight: bold;
}

.reset-view {
    font-size: 20px;
}

@media (max-width: 1024px) {
    .map-container {
        grid-template-columns: 1fr;
    }

    .map-sidebar {
        order: 2;
    }

    .map-content {
        order: 1;
    }
}

@media (max-width: 768px) {
    .map-main {
        padding: 20px 12px 40px;
    }

    .map-content {
        padding: 20px;
    }

    .map-header-title h1 {
        font-size: 24px;
    }

    .sidebar-card {
        padding: 20px 0;
    }
}

@media (max-width: 480px) {
    .map-status-pill {
        width: 100%;
        text-align: center;
    }

    .map-tab-button {
        padding: 12px 20px;
    }

    .tab-label {
        font-size: 1.1rem;
    }
}
</style>
