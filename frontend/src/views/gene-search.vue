<template>
  <div class="gene-search-page">
    <Header />
    
    <main>
      <!-- 顶部标题区域 -->
      <div class="search-heading-container">
        <h1 class="search-heading">Flavonoid Gene Search</h1>
        <p class="search-subtitle">Search and explore flavonoid biosynthesis genes across species</p>
      </div>
      
      <!-- 搜索表单区域 -->
      <div class="search-form-container">
        <div class="search-form-card">
          <div class="card-title-bar">
            <span>Search Criteria</span>
          </div>

          <!-- 两列紧凑布局 -->
          <div class="form-row-compact">
            <!-- Gene ID 搜索 -->
            <div class="form-group">
              <label class="form-label">Gene ID</label>
              <div class="input-with-help">
                <input 
                  name="geneId" 
                  class="form-control" 
                  v-model="searchInput"
                  placeholder="e.g., LOC_Os06g41070.1"
                  aria-label="Gene ID"
                  @input="handleQuickSearch"
                >
                <button class="help-icon" @click="toggleHelp('geneId')" title="Help">
                  <span>?</span>
                </button>
              </div>
              <div v-if="showHelp.geneId" class="help-text">
                Supports Arabidopsis (AT) and Brassica napus (Bna) IDs.
              </div>
            </div>
          
            <!-- Species -->
            <div class="form-group">
              <label class="form-label">Species</label>
              
              <!-- 物种搜索输入框（带下拉列表） -->
              <div class="species-autocomplete-wrapper">
                <input
                  type="text"
                  class="form-control species-autocomplete-input"
                  v-model="speciesSearchQuery"
                  @input="filterSpecies"
                  @focus="showSpeciesDropdown = true"
                  @blur="handleSpeciesBlur"
                  placeholder="Search species..."
                  :disabled="isLoadingSpecies"
                >
                <span class="species-count-badge" v-if="!isLoadingSpecies && speciesSearchQuery">
                  {{ filteredSpeciesList.length }}
                </span>
                
                <!-- 下拉列表 -->
                <div 
                  v-if="showSpeciesDropdown && filteredSpeciesList.length > 0" 
                  class="species-dropdown"
                >
                  <div class="species-dropdown-header" v-if="filteredSpeciesList.length > 1">
                    Found {{ filteredSpeciesList.length }} species
                  </div>
                  <div 
                    v-for="species in filteredSpeciesList" 
                    :key="species"
                    class="species-dropdown-item"
                    @mousedown.prevent="selectSpeciesFromDropdown(species)"
                  >
                    {{ species }}
                  </div>
                </div>
              </div>

              <!-- 选中的物种提示 -->
              <div v-if="selectedSpecies" class="selected-species-tag">
                {{ selectedSpecies }}
                <button 
                  type="button" 
                  class="clear-species-btn" 
                  @click="clearSpeciesSelection"
                  title="Clear"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="form-buttons">
            <button class="submit-btn" @click="handleSubmit" :disabled="isSearching">
              <span v-if="!isSearching">Search</span>
              <span v-else>
                <span class="loading-spinner"></span> Searching...
              </span>
            </button>
            <button class="reset-btn" @click="handleReset">Reset</button>
            <button class="example-btn" @click="loadExample">Example</button>
          </div>
        </div>
      </div>
      
      <!-- 搜索结果表格 -->
      <div v-if="hasSearched" class="search-results">
        <div class="results-header">
          <h2 class="results-title">Search Results</h2>
          <div v-if="geneResults.length > 0" class="results-info">
            Found <strong>{{ geneResults.length }}</strong> gene(s)
          </div>
        </div>
        
        <div class="table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th class="col-select">
                  <input type="checkbox" @change="toggleSelectAll" v-model="selectAll">
                </th>
                <th class="col-id">Gene ID</th>
                <th class="col-species">Species</th>
                <th class="col-chr">Chr</th>
                <th class="col-start">Start</th>
                <th class="col-end">End</th>
                <th class="col-strand">Strand</th>
                <th class="col-function">Function</th>
                <th class="col-description">Description</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="geneResults.length === 0">
                <td colspan="10" class="no-results">
                  <div class="empty-state">
                    <p>No genes found matching your search criteria</p>
                    <button class="reset-btn" @click="handleReset">Try Another Search</button>
                  </div>
                </td>
              </tr>
              <tr v-for="gene in geneResults" :key="gene.id" class="data-row">
                <td class="col-select">
                  <input type="checkbox" :value="gene.id" v-model="selectedGenes">
                </td>
                <td class="col-id">
                  <a href="#" @click.prevent="viewGeneDetail(gene)" class="gene-link">
                    {{ gene.id }}
                  </a>
                </td>
                <td class="col-species">
                  <span class="species-badge">{{ gene.species }}</span>
                </td>
                <td class="col-chr">
                  <span class="position-text">{{ gene.chr || '-' }}</span>
                </td>
                <td class="col-start">
                  <span class="position-text">{{ formatCoordinate(gene.start) }}</span>
                </td>
                <td class="col-end">
                  <span class="position-text">{{ formatCoordinate(gene.end) }}</span>
                </td>
                <td class="col-strand">
                  <span class="position-text">{{ gene.strand || '-' }}</span>
                </td>
                <td class="col-function">
                  <span class="description-text" :title="gene.function">
                    {{ truncateText(gene.function, 40) }}
                  </span>
                </td>
                <td class="col-description">
                  <span class="description-text" :title="gene.description">
                    {{ truncateText(gene.description, 60) }}
                  </span>
                </td>
                <td class="col-actions">
                  <button class="action-btn btn-view" @click="viewGeneDetail(gene)" title="View Details">
                    View
                  </button>
                  <button class="action-btn btn-homology" @click="showHomology(gene)" title="Homologs">
                    Homology
                  </button>
                  <!-- <button class="action-btn btn-structure" @click="showStructure(gene)" title="Gene Structure">
                    Structure
                  </button> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 批量操作按钮 -->
        <div v-if="selectedGenes.length > 0" class="batch-actions">
          <span class="batch-info">{{ selectedGenes.length }} gene(s) selected</span>
          <button class="batch-btn" @click="exportSelected">Export Selected</button>
          <button class="batch-btn" @click="compareSelected">Compare</button>
        </div>
      </div>

      <!-- 基因详情和分析面板 -->
      <div v-if="selectedGeneForDetail" class="detail-panels">
        <div class="detail-row single-column">
          <!-- 同源基因关系 -->
          <div class="detail-card">
            <div class="detail-card-header">
              <h3>Homologous Genes</h3>
            </div>
            <div class="detail-card-body">
              <div v-if="homologyData.length === 0" class="empty-detail">
                <p>Select a gene to view homology information</p>
              </div>
              <div v-else class="homology-table-wrapper">
                <table class="homology-table">
                  <thead>
                    <tr>
                      <th class="col-homology-gene">Gene ID</th>
                      <th class="col-homology-species">Species</th>
                      <th class="col-homology-sim">Similarity</th>
                      <th class="col-homology-desc">Description</th>
                      <!-- <th class="col-homology-structure">Gene Structure</th> -->
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="homolog in homologyData" :key="homolog.id">
                      <td class="col-homology-gene">
                        <a href="#" @click.prevent="viewGeneDetailByGeneId(homolog.geneId)" class="gene-link">
                          {{ homolog.geneId }}
                        </a>
                      </td>
                      <td class="col-homology-species">
                        {{ homolog.species }}
                      </td>
                      <td class="col-homology-sim">
                        {{ homolog.similarity !== null ? `${homolog.similarity}%` : 'N/A' }}
                      </td>
                      <td class="col-homology-desc">
                        {{ truncateText(homolog.description, 60) }}
                      </td>
                      <!--
                      <td class="col-homology-structure">
                        <button class="action-btn btn-structure" @click="showStructurePlaceholder(homolog.geneId)">
                          Structure
                        </button>
                      </td>
                      -->
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 基因结构可视化（已注释，后续需要可恢复） -->
          <!--
          <div class="detail-card">
            <div class="detail-card-header">
              <h3>Gene Structure</h3>
            </div>
            <div class="detail-card-body">
              <div v-if="!structureData" class="empty-detail">
                <p>Select a gene to view structure information</p>
              </div>
              <div v-else class="structure-view">
                <div class="structure-info">
                  <span><strong>Gene:</strong> {{ structureData.geneId }}</span>
                  <span>
                    <strong>Length:</strong>
                    {{ structureData.length != null ? `${structureData.length} bp` : 'N/A' }}
                  </span>
                  <span>
                    <strong>Exons:</strong>
                    {{ structureData.exonCount != null ? structureData.exonCount : 'N/A' }}
                  </span>
                </div>
                <div class="structure-diagram">
                  <div class="structure-placeholder">
                    Gene structure visualization will be rendered here
                  </div>
                </div>
              </div>
            </div>
          </div>
          -->
        </div>
      </div>
    </main>
    
    <Footer />
    
    <!-- 基因详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Gene Details: {{ detailGene?.id }}</h2>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailGene" class="gene-detail-content">
            <div class="detail-section">
              <h4>Basic Information</h4>
              <table class="info-table">
                <tr>
                  <td class="info-label">Gene ID:</td>
                  <td class="info-value">{{ detailGene.id }}</td>
                </tr>
                <tr>
                  <td class="info-label">Species:</td>
                  <td class="info-value">{{ detailGene.species }}</td>
                </tr>
                <tr>
                  <td class="info-label">Chr:</td>
                  <td class="info-value">{{ detailGene.chr || '-' }}</td>
                </tr>
                <tr>
                  <td class="info-label">Start:</td>
                  <td class="info-value">{{ formatCoordinate(detailGene.start) }}</td>
                </tr>
                <tr>
                  <td class="info-label">End:</td>
                  <td class="info-value">{{ formatCoordinate(detailGene.end) }}</td>
                </tr>
                <tr>
                  <td class="info-label">Strand:</td>
                  <td class="info-value">{{ detailGene.strand || '-' }}</td>
                </tr>
              </table>
            </div>

            <div class="detail-section">
              <h4>Functional Annotation</h4>
              <p><strong>Function:</strong> {{ detailGene.function || 'N/A' }}</p>
              <p><strong>Description:</strong> {{ detailGene.description || 'N/A' }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="closeDetailModal">Close</button>
          <button class="primary-btn" @click="exportGeneData">Export Data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

type IndexHit = { s: string; k: string; b: string }
type SearchIndex = Record<string, IndexHit[]>

interface BucketHomolog {
  gene_id: string
  species?: string
  chr?: string
  start?: number
  end?: number
  strand?: string
  function?: string
  description?: string
  pid?: number
  score?: number
}

interface BucketGeneRecord {
  gene_id: string
  species?: string
  chr?: string
  start?: number
  end?: number
  strand?: string
  function?: string
  description?: string
  homologs?: BucketHomolog[]
  key: string
  bucket: string
}

interface GeneSearchResult {
  id: string
  species: string
  bucket: string
  key: string
  chr: string
  start: number | null
  end: number | null
  strand: string
  function: string
  description: string
}

interface DetailGeneInfo {
  id: string
  species: string
  chr: string
  start: number | null
  end: number | null
  strand: string
  function: string
  description: string
}

interface HomologyDisplay {
  id: string
  geneId: string
  species: string
  similarity: number | null
  description: string
}

interface StructureInfo {
  geneId: string
  length: number | null
  exonCount: number | null
}

const MAX_RESULTS = 200

const searchInput = ref('')
const selectedSpecies = ref('')

const speciesList = ref<string[]>([])
const isLoadingSpecies = ref(false)
const speciesSearchQuery = ref('')
const filteredSpeciesList = ref<string[]>([])
const showSpeciesDropdown = ref(false)

const showHelp = reactive({
  geneId: false
})

const isSearching = ref(false)
const hasSearched = ref(false)
const selectAll = ref(false)

const geneResults = ref<GeneSearchResult[]>([])
const selectedGenes = ref<string[]>([])

const selectedGeneForDetail = ref<string | null>(null)
const homologyData = ref<HomologyDisplay[]>([])
// const structureData = ref<StructureInfo | null>(null) // 基因结构模块暂时关闭

const showDetailModal = ref(false)
const detailGene = ref<DetailGeneInfo | null>(null)
const searchIndex = ref<SearchIndex>({})
const isDatabaseLoaded = ref(false)
const chunkCache: Map<string, BucketGeneRecord[]> = new Map()

const buildAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return normalizedBase + normalizedPath
}

const loadSpeciesList = async () => {
  isLoadingSpecies.value = true
  try {
    const response = await fetch(buildAssetUrl('data/species-1031.csv'))
    if (response.ok) {
      const csvText = await response.text()
      const lines = csvText.split('\n')
      const species = lines
        .slice(1)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.replace(/_/g, ' '))

      speciesList.value = species
      filteredSpeciesList.value = species
      console.log(`已加载 ${speciesList.value.length} 个物种`)
    } else {
      throw new Error(response.statusText)
    }
  } catch (error) {
    console.error('加载物种列表出错:', error)
    speciesList.value = [
      'Arabidopsis thaliana',
      'Brassica napus',
      'Brassica rapa',
      'Brassica oleracea'
    ]
    filteredSpeciesList.value = speciesList.value
  } finally {
    isLoadingSpecies.value = false
  }
}

const filterSpecies = () => {
  const query = speciesSearchQuery.value.toLowerCase().trim()

  if (!query) {
    filteredSpeciesList.value = speciesList.value
    showSpeciesDropdown.value = false
  } else {
    filteredSpeciesList.value = speciesList.value.filter(species =>
      species.toLowerCase().includes(query)
    )
    showSpeciesDropdown.value = true
  }

  console.log(`筛选后物种数量: ${filteredSpeciesList.value.length}`)
}

const selectSpeciesFromDropdown = (species: string) => {
  selectedSpecies.value = species
  speciesSearchQuery.value = ''
  showSpeciesDropdown.value = false
  filteredSpeciesList.value = speciesList.value
  console.log('选中物种:', species)
}

const handleSpeciesBlur = () => {
  setTimeout(() => {
    showSpeciesDropdown.value = false
  }, 150)
}

const clearSpeciesSelection = () => {
  selectedSpecies.value = ''
  speciesSearchQuery.value = ''
  filteredSpeciesList.value = speciesList.value
}

onMounted(async () => {
  await loadSpeciesList()

  console.log('正在加载搜索索引...')
  try {
    const response = await fetch(buildAssetUrl('web_data/search_index.json'))
    if (!response.ok) throw new Error(response.statusText)

    searchIndex.value = await response.json()
    isDatabaseLoaded.value = true
    console.log(`索引加载完毕，共 ${Object.keys(searchIndex.value).length} 个 gene_id`)
  } catch (error) {
    console.error('加载索引失败:', error)
    isDatabaseLoaded.value = false
  }
})

const toggleHelp = (field: string) => {
  if (field in showHelp) {
    showHelp[field as keyof typeof showHelp] = !showHelp[field as keyof typeof showHelp]
  }
}

let searchTimeout: number | null = null
const handleQuickSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    console.log('Quick search:', searchInput.value)
  }, 500)
}

const loadChunk = async (bucket: string): Promise<BucketGeneRecord[]> => {
  const bucketId = bucket.toLowerCase()
  if (chunkCache.has(bucketId)) {
    return chunkCache.get(bucketId) as BucketGeneRecord[]
  }

  const response = await fetch(buildAssetUrl(`web_data/chunks/${bucketId}.json`))
  if (!response.ok) {
    throw new Error(`chunk ${bucketId} not found`)
  }

  const data = (await response.json()) as BucketGeneRecord[]
  chunkCache.set(bucketId, data)
  return data
}

const loadDetailRecord = async (bucket: string, key: string) => {
  const chunk = await loadChunk(bucket)
  return chunk.find(entry => entry.key === key)
}

const createPlaceholderRow = (hit: IndexHit, geneId: string): GeneSearchResult => ({
  id: geneId,
  species: hit.s,
  bucket: hit.b,
  key: hit.k,
  chr: '-',
  start: null,
  end: null,
  strand: '-',
  function: 'N/A',
  description: 'N/A'
})

const createResultFromDetail = (
  geneId: string,
  hit: IndexHit,
  detail?: BucketGeneRecord | null
): GeneSearchResult => {
  const start = detail && typeof detail.start === 'number' ? detail.start : null
  const end = detail && typeof detail.end === 'number' ? detail.end : null

  return {
    id: geneId,
    species: detail?.species || hit.s,
    bucket: hit.b,
    key: hit.k,
    chr: detail?.chr || '-',
    start,
    end,
    strand: detail?.strand || '-',
    function: detail?.function || 'N/A',
    description: detail?.description || 'N/A'
  }
}

const handleSubmit = async () => {
  const geneId = searchInput.value.trim()
  const species = selectedSpecies.value.trim()

  if (!geneId && !species) {
    alert('Please enter at least one search criterion')
    return
  }
  if (!isDatabaseLoaded.value) {
    alert('Search index is still loading. Please try again.')
    return
  }

  isSearching.value = true
  try {
    if (geneId) {
      const hits = searchIndex.value[geneId] || []
      const filteredHits = species ? hits.filter(hit => hit.s === species) : hits
      const limitedHits = filteredHits.slice(0, MAX_RESULTS)

      const hydratedResults: GeneSearchResult[] = []
      for (const hit of limitedHits) {
        let detail: BucketGeneRecord | null = null
        try {
          detail = await loadDetailRecord(hit.b, hit.k) ?? null
        } catch (detailError) {
          console.error('加载详情失败:', detailError)
        }
        hydratedResults.push(createResultFromDetail(geneId, hit, detail))
      }

      geneResults.value = hydratedResults

      if (geneResults.value.length === 0) {
        alert('No records found for the specified criteria.')
      }
    } else {
      alert('Please input Gene ID (species-only search is not supported in sliced mode).')
      geneResults.value = []
    }

    hasSearched.value = true
    selectedGenes.value = []
    selectAll.value = false
    selectedGeneForDetail.value = null
    homologyData.value = []
    // structureData.value = null
  } catch (error) {
    console.error('搜索失败:', error)
    alert('Search failed. Please try again.')
  } finally {
    isSearching.value = false
  }
}

const handleReset = () => {
  searchInput.value = ''
  selectedSpecies.value = ''
  speciesSearchQuery.value = ''
  filteredSpeciesList.value = speciesList.value

  hasSearched.value = false
  geneResults.value = []
  selectedGenes.value = []
  selectAll.value = false
  selectedGeneForDetail.value = null
  homologyData.value = []
  // structureData.value = null
}

const loadExample = () => {
  searchInput.value = 'LOC_Os06g41070.1'
  selectedSpecies.value = 'Oryza sativa'
  speciesSearchQuery.value = ''
  filteredSpeciesList.value = speciesList.value

  console.log('Example data loaded:', {
    geneId: searchInput.value,
    species: selectedSpecies.value
  })
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedGenes.value = geneResults.value.map(g => g.id)
  } else {
    selectedGenes.value = []
  }
}

const viewGeneDetail = async (row: GeneSearchResult) => {
  if (!row.key || !row.bucket) {
    alert('Missing key/bucket for this record.')
    return
  }

  selectedGeneForDetail.value = row.id

  try {
    const detail = await loadDetailRecord(row.bucket, row.key)
    if (!detail) {
      alert('Gene not found in chunk (unexpected).')
      return
    }

    const start = typeof detail.start === 'number' ? detail.start : null
    const end = typeof detail.end === 'number' ? detail.end : null

    row.chr = detail.chr || row.chr
    row.start = start
    row.end = end
    row.strand = detail.strand || row.strand
    row.function = detail.function || 'N/A'
    row.description = detail.description || 'N/A'

    detailGene.value = {
      id: detail.gene_id,
      species: detail.species || row.species,
      chr: detail.chr || '-',
      start,
      end,
      strand: detail.strand || '-',
      function: detail.function || 'N/A',
      description: detail.description || 'N/A'
    }

    homologyData.value = (detail.homologs || [])
      .slice(0, 5)
      .map((homolog, index) => ({
        id: homolog.gene_id || `${detail.gene_id}-${index}`,
        geneId: homolog.gene_id || `homolog-${index}`,
        species: homolog.species || 'Unknown',
        similarity: typeof homolog.pid === 'number' ? Number(homolog.pid.toFixed(1)) : null,
        description: homolog.description || (typeof homolog.score === 'number' ? `Score: ${homolog.score}` : '')
      }))

    // structureData.value = null
    showDetailModal.value = true
  } catch (error) {
    console.error('加载详情失败:', error)
    alert('Failed to load gene details.')
  }
}

const viewGeneDetailByGeneId = async (geneId: string) => {
  if (!isDatabaseLoaded.value) return

  const hits = searchIndex.value[geneId] || []
  if (hits.length === 0) {
    alert(`No record found for ${geneId}`)
    return
  }

  const speciesHint = selectedSpecies.value.trim()
  const chosenHit = speciesHint ? (hits.find(hit => hit.s === speciesHint) || hits[0]) : hits[0]

  await viewGeneDetail(createPlaceholderRow(chosenHit, geneId))
}

const closeDetailModal = () => {
  showDetailModal.value = false
  detailGene.value = null
}

const showHomology = async (row: GeneSearchResult) => {
  await viewGeneDetail(row)
}

// const showStructure = async (row: GeneSearchResult) => {
//   selectedGeneForDetail.value = row.id
//   structureData.value = null
//   alert('Gene structure visualization is not available in this release.')
// }

const exportSelected = () => {
  const selected = geneResults.value.filter(g => selectedGenes.value.includes(g.id))
  console.log('导出选中基因:', selected)

  const csv = convertToCSV(selected)
  downloadCSV(csv, 'selected_genes.csv')
}

const compareSelected = () => {
  const selected = geneResults.value.filter(g => selectedGenes.value.includes(g.id))
  console.log('比较选中基因:', selected)
  alert(`Comparing ${selected.length} genes. This feature will be implemented.`)
}

const exportGeneData = () => {
  if (detailGene.value) {
    const csv = convertToCSV([detailGene.value])
    downloadCSV(csv, `gene_${detailGene.value.id}.csv`)
  }
}

const formatCoordinate = (value: number | null | undefined) => {
  if (value == null) return '-'
  return value.toLocaleString()
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const convertToCSV = (data: any[]) => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(item =>
    Object.values(item).map(val => `"${val ?? ''}"`).join(',')
  )

  return [headers, ...rows].join('\n')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* ===== 全局样式 ===== */
.gene-search-page {
  font-family: 'Arial', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
  background-image: linear-gradient(20deg, #fafafa, #abdfcb, #86c1bd, #e6f8f1, #faf5f0, #ffffff);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #e6f8f1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  flex: 1;
  width: 100%;
}

/* ===== 标题区域样式 ===== */
.search-heading-container {
  background: linear-gradient(135deg, #abdfcb 0%, #abdfcb 100%);
  padding: 25px 30px;
  margin-bottom: 30px;
  text-align: left;
  border-radius: 15px;
  color: rgb(51, 50, 50);
}

.search-heading {
  font-size: 32px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-subtitle {
  font-size: 16px;
  color: #555;
  margin: 0;
  font-weight: 400;
}


/* ===== 表单卡片样式 ===== */
.search-form-container {
  max-width: 1800px;
  margin: 0 auto 30px;
}

.search-form-card {
  background-color: #fff;
  border-radius: 20px;
  padding: 0;
  border: 2px solid #e0e0e0;
  position: relative;
  overflow: visible;
  z-index: 1;
}

.card-title-bar {
  background: linear-gradient(135deg, #abdfcb 0%, #abdfcb 100%);
  padding: 15px 25px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 3px solid #2d584b;
  position: relative;
  z-index: 1;
}

.search-form-card > *:not(.card-title-bar) {
  padding: 0 30px;
}

.search-form-card > .form-buttons {
  padding: 20px 30px 30px;
}

/* ===== 表单行和分组 ===== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-top: 25px;
}

.form-row-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding-top: 25px;
  position: relative;
  z-index: auto;
}

.form-group {
  margin-bottom: 0;
  text-align: left;
  position: relative;
  z-index: auto;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

/* ===== 输入控件样式 ===== */
.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.form-control:hover {
  border-color: #448870;
  background-color: white;
}

.form-control:focus {
  border-color: #448870;
  box-shadow: 0 0 0 4px rgba(68, 136, 112, 0.15);
  outline: none;
  background-color: white;
}

.input-with-help {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-with-help .form-control {
  flex: 1;
}

/* 帮助按钮 */
.help-icon {
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
  padding: 0;
}

.help-icon:hover {
  background: #448870;
  border-color: #448870;
  color: white;
}

.help-text {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-left: 3px solid #448870;
  border-radius: 5px;
}

/* ===== 下拉菜单样式 ===== */
.select-container {
  position: relative;
}

.select-container select {
  appearance: none;
  padding-right: 40px;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 7px solid #448870;
  pointer-events: none;
}

/* ===== 物种自动完成搜索样式 ===== */
.species-autocomplete-wrapper {
  position: relative;
  z-index: 100;
}

/* 确保包含物种选择器的表单组在最上层 */
.form-group:has(.species-autocomplete-wrapper) {
  z-index: 100;
}

.species-autocomplete-input {
  padding-right: 40px !important;
}

.species-count-badge {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  pointer-events: none;
  min-width: 20px;
  text-align: center;
}

/* 下拉列表容器 - 固定显示4个物种的高度 */
.species-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 5px;
  background: white;
  border: 2px solid #448870;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(68, 136, 112, 0.3);
  height: 200px;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 9999;
  animation: dropdownFadeIn 0.2s ease;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #448870 #f1f1f1;
}

.species-dropdown::-webkit-scrollbar {
  width: 12px;
}

.species-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0 8px 8px 0;
  margin: 2px 0;
}

.species-dropdown::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #448870 0%, #357a5e 100%);
  border-radius: 6px;
  border: 3px solid #f1f1f1;
}

.species-dropdown::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #357a5e 0%, #2d584b 100%);
  border: 2px solid #f1f1f1;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.species-dropdown-header {
  padding: 8px 15px;
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: 0;
  z-index: 11;
  border-bottom: 2px solid #2d584b;
  flex-shrink: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.species-dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
  line-height: 1.3;
  flex-shrink: 0;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.species-dropdown-item:last-child {
  border-bottom: none;
}

.species-dropdown-item:hover {
  background-color: #e8f4ed;
  color: #448870;
  font-weight: 500;
}

/* 选中的物种标签 */
.selected-species-tag {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.clear-species-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 50%;
  transition: all 0.2s;
  font-weight: bold;
}

.clear-species-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}


/* ===== 按钮样式 ===== */
.form-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.submit-btn, .reset-btn, .example-btn {
  padding: 12px 30px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(68, 136, 112, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #357a5e 0%, #2d584b 100%);
  box-shadow: 0 6px 16px rgba(68, 136, 112, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 2px solid #ddd;
}

.reset-btn:hover {
  background-color: #e8e8e8;
  border-color: #bbb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.example-btn {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.example-btn:hover {
  background: linear-gradient(135deg, #138496 0%, #0f6674 100%);
  box-shadow: 0 6px 16px rgba(23, 162, 184, 0.4);
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 搜索结果区域 ===== */
.search-results {
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  margin-top: 30px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 3px solid #e0e0e0;
}

.results-title {
  color: #448870;
  font-size: 24px;
  margin: 0;
  font-weight: 700;
}

.results-info {
  font-size: 15px;
  color: #666;
}

.results-info strong {
  color: #448870;
  font-size: 18px;
}

/* ===== 表格样式 ===== */
.table-container {
  overflow-x: auto;
  margin: 20px 0;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.results-table thead tr {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
}

.results-table th {
  padding: 18px 14px;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 16px;
  border: none;
}

.results-table th.col-select {
  width: 50px;
  text-align: center;
}

.results-table th.col-actions {
  width: 140px;
  text-align: center;
}

.results-table tbody tr {
  border-bottom: 1px solid #e8e8e8;
  transition: all 0.2s ease;
}

.results-table tbody tr:hover {
  background-color: #f8fcfa;
  box-shadow: 0 2px 8px rgba(68, 136, 112, 0.1);
}

.results-table td {
  padding: 16px 14px;
  font-size: 16px;
  color: #111;
}

.col-select {
  text-align: center;
}

.col-select input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #448870;
}

.col-chr,
.col-start,
.col-end,
.col-strand {
  font-family: 'Courier New', monospace;
  color: #555;
}

.col-function,
.col-description {
  min-width: 150px;
}

.gene-link {
  color: #111;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.gene-link:hover {
  color: #2d584b;
  text-decoration: underline;
}

.gene-name {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #555;
}

.species-badge {
  display: inline-block;
  padding: 4px 10px;
  background-color: #e3f2fd;
  color: #111;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.position-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #111;
}

.description-text {
  color: #111;
  line-height: 1.4;
}

/* 空状态 */
.no-results {
  text-align: center;
  padding: 60px 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
  margin: 0;
}

/* 操作按钮 */
.col-actions {
  text-align: center;
}

.action-btn {
  padding: 8px 14px;
  margin: 4px;
  border-radius: 6px;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-weight: 500;
}

.action-btn:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

.btn-view {
  background-color: #86c1bd;
}

.btn-view:hover {
  background-color: #6fa8a4;
}

.btn-homology {
  background-color: #dbaf3d;
}

.btn-homology:hover {
  background-color: #c69b2f;
}

.btn-structure {
  background-color: #7a72b4;
}

.btn-structure:hover {
  background-color: #665ea0;
}

/* ===== 批量操作 ===== */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8fcfa;
  border-radius: 12px;
  margin-top: 20px;
  border: 2px solid #d4edda;
}

.batch-info {
  font-weight: 600;
  color: #448870;
  font-size: 15px;
}

.batch-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.batch-btn:hover {
  box-shadow: 0 4px 12px rgba(68, 136, 112, 0.3);
}

/* ===== 详情面板 ===== */
.detail-panels {
  margin-top: 30px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-row.single-column {
  grid-template-columns: 1fr;
}

.detail-card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.detail-card-header {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  padding: 15px 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.detail-card-body {
  padding: 20px;
  min-height: 200px;
}

.empty-detail {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-detail p {
  margin: 0;
  font-size: 15px;
}

/* 同源基因列表 */
.homology-table-wrapper {
  overflow-x: auto;
}

.homology-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  font-size: 15px;
}

.homology-table thead tr {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: #fff;
}

.homology-table th,
.homology-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px dashed #cfd9d3;
  color: #111;
}

.homology-table th {
  font-weight: 600;
}

.homology-table tbody tr:last-child td {
  border-bottom: none;
}

.col-homology-gene,
.col-homology-species {
  font-weight: 600;
}

.col-homology-sim {
  font-family: 'Courier New', monospace;
}

.col-homology-desc {
  line-height: 1.4;
}

.homology-table .gene-link {
  color: #0c5f4c;
  font-weight: 600;
}

.homology-table .gene-link:hover {
  color: #023024;
}

/* 基因结构视图 */
.structure-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.structure-info {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.structure-info span {
  font-size: 14px;
  color: #555;
}

.structure-diagram {
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.structure-placeholder {
  color: #999;
  font-style: italic;
  text-align: center;
}

/* ===== 模态框样式 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  padding: 20px 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.gene-detail-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-section h4 {
  color: #448870;
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.info-table td {
  padding: 10px 12px;
  font-size: 14px;
}

.info-label {
  font-weight: 600;
  color: #555;
  width: 150px;
}

.info-value {
  color: #333;
}

.sequence-box {
  margin-top: 10px;
}

.sequence-text {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: vertical;
  background-color: #f8f9fa;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 2px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.primary-btn, .secondary-btn {
  padding: 10px 25px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #448870 0%, #357a5e 100%);
  color: white;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #357a5e 0%, #2d584b 100%);
  box-shadow: 0 4px 12px rgba(68, 136, 112, 0.3);
}

.secondary-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 2px solid #ddd;
}

.secondary-btn:hover {
  background-color: #e8e8e8;
  border-color: #bbb;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .form-row-compact {
    grid-template-columns: 1fr 1fr;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  main {
    padding: 15px;
  }

  .search-heading {
    font-size: 24px;
  }

  .search-subtitle {
    font-size: 14px;
  }

  .form-row,
  .form-row-compact {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-buttons {
    flex-direction: column;
  }
  
  .submit-btn, .reset-btn, .example-btn {
    width: 100%;
  }
  
  .species-dropdown {
    height: 180px;
    max-height: 180px;
  }
  
  .species-dropdown::-webkit-scrollbar {
    width: 8px;
  }
  
  .species-dropdown-item {
    min-height: 36px;
    font-size: 12px;
  }
  
  .species-dropdown-header,
  .species-dropdown-more {
    height: 26px;
    font-size: 10px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .table-container {
    overflow-x: scroll;
  }

  .results-table {
    font-size: 14px;
  }

  .results-table th,
  .results-table td {
    padding: 10px 8px;
  }

  .batch-actions {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .batch-btn {
    margin-left: 0;
    width: 100%;
  }

  .modal-container {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 15px;
  }

  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .search-heading {
    font-size: 20px;
  }

  .icon-dna {
    font-size: 24px;
  }

  .results-title {
    font-size: 18px;
  }

  .action-btn {
    padding: 4px 8px;
    font-size: 14px;
  }
}

/* ===== 动画效果 ===== */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 

