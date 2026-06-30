<template>
  <div class="blast-container">
    <Header />
    
    <main>
      <div class="blast-card">
        <h2 class="section-title">BLAST Search</h2>
        <p class="section-description">Search for sequence similarity against our database of plant genomes.</p>
        
        <form @submit.prevent="submitBlast" class="blast-form">
          <!-- Program Selection Section -->
          <div class="form-section">
            <div class="form-group">
              <label for="program">
                Program Type
                <span class="info-icon" @mouseover="showTooltip('program')" @mouseleave="hideTooltip()">
                  <i class="bi bi-question-circle"></i>
                </span>
              </label>
              <div class="select-container">
                <select id="program" class="form-control" v-model="formData.program" @change="updateDatabase">
                  <option value="blastn">BLASTN: Nucleotide > Nucleotide</option>
                  <option value="blastp">BLASTP: Protein > Protein</option>
                  <option value="blastx">BLASTX: Translated Nucleotide > Protein</option>
                  <option value="tblastn">TBLASTN: Protein > Translated Nucleotide</option>
                  <option value="tblastx">TBLASTX: Translated Nucleotide > Translated Nucleotide</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="db">Database</label>
              <div class="select-container">
                <select id="db" class="form-control" v-model="formData.db">
                  <option v-for="db in databases" :key="db.value" :value="db.value">{{ db.text }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Parameters Section -->
          <div class="form-section parameters-section">
            <div class="form-group">
              <label for="expect">
                E-value Threshold
                <span class="info-icon" @mouseover="showTooltip('expect')" @mouseleave="hideTooltip()">
                  <i class="bi bi-question-circle"></i>
                </span>
              </label>
              <div class="select-container">
                <select id="expect" class="form-control" v-model="formData.expect">
                  <option value="1e-200">1e-200</option>
                  <option value="1e-100">1e-100</option>
                  <option value="1e-50">1e-50</option>
                  <option value="1e-20">1e-20</option>
                  <option value="1e-10">1e-10</option>
                  <option value="1e-5" selected>1e-5</option>
                  <option value="1e-4">1e-4</option>
                  <option value="1e-3">1e-3</option>
                  <option value="1e-2">1e-2</option>
                  <option value="1e-1">1e-1</option>
                  <option value="1">1</option>
                  <option value="10">10</option>
                  <option value="100">100</option>
                  <option value="1000">1000</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="identity">
                Identity Percentage
                <span class="info-icon" @mouseover="showTooltip('identity')" @mouseleave="hideTooltip()">
                  <i class="bi bi-question-circle"></i>
                </span>
              </label>
              <div class="select-container">
                <select id="identity" class="form-control" v-model="formData.identity" :disabled="formData.program !== 'blastn'">
                  <option value="100">100%</option>
                  <option value="99">99%</option>
                  <option value="98">98%</option>
                  <option value="97">97%</option>
                  <option value="96">96%</option>
                  <option value="95">95%</option>
                  <option value="94">94%</option>
                  <option value="93">93%</option>
                  <option value="92">92%</option>
                  <option value="91">91%</option>
                  <option value="90" selected>90%</option>
                  <option value="85">85%</option>
                  <option value="80">80%</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="maxHsp">
                Max HSP Count
                <span class="info-icon" @mouseover="showTooltip('maxHsp')" @mouseleave="hideTooltip()">
                  <i class="bi bi-question-circle"></i>
                </span>
              </label>
              <div class="select-container">
                <select id="maxHsp" class="form-control" v-model="formData.maxHsp">
                  <option value="none" selected>Unlimited</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Sequence Input Section -->
          <div class="form-section sequence-section">
            <div class="sequence-header">
              <label for="querySeq">
                Query Sequence
                <span class="info-icon" @mouseover="showTooltip('sequence')" @mouseleave="hideTooltip()">
                  <i class="bi bi-question-circle"></i>
                </span>
              </label>
              <button type="button" class="example-btn" @click.prevent="loadExample">Example</button>
            </div>
            <textarea 
              id="querySeq" 
              class="form-control sequence-textarea" 
              v-model="formData.querySeq" 
              rows="10" 
              placeholder="Enter valid sequence. FASTA format supported!" 
              required
            ></textarea>
          </div>
          
          <!-- Submit Button Section -->
          <div class="form-section submit-section">
            <div class="tooltip-container" v-if="tooltipVisible">
              <div class="tooltip-content">{{ tooltipText }}</div>
            </div>
            
            <button type="submit" class="submit-btn" :disabled="loading || !formData.querySeq">
              <span v-if="loading" class="loader"></span>
              <span v-else>Run BLAST</span>
            </button>
          </div>
        </form>
      </div>
      
      <!-- Results Section -->
      <div v-if="blastResults" class="results-section">
        <!-- Results Summary -->
        <div class="results-summary-card">
          <div class="summary-header">
            <div class="summary-icon">
              <i class="bi bi-search"></i>
            </div>
            <div class="summary-info">
                          <h3 class="summary-title">BLAST Search Results</h3>
            <p class="summary-stats">
              Found <span class="highlight-number">{{ blastResults.hits.length }}</span> matching results
            </p>
            </div>
          </div>
          
          <div class="query-summary" v-if="blastResults.query_info">
            <div class="query-detail">
              <span class="detail-label">Query Sequence:</span>
              <span class="detail-value">{{ blastResults.query_info.query_id || 'Unknown' }}</span>
            </div>
            <div class="query-detail">
              <span class="detail-label">Sequence Length:</span>
              <span class="detail-value">{{ blastResults.query_info.query_len || 'Unknown' }} bp</span>
            </div>
            <div class="query-detail">
              <span class="detail-label">Program Type:</span>
              <span class="detail-value">{{ formData.program.toUpperCase() }}</span>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="filter-controls">
          <div class="filter-group">
            <label for="sortBy">Sort by:</label>
            <select id="sortBy" v-model="sortBy" @change="applySortAndFilter" class="filter-select">
              <option value="evalue">E-value (Ascending)</option>
              <option value="score">Score (Descending)</option>
              <option value="identity">Identity (Descending)</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="evalueFilter">E-value Filter:</label>
            <select id="evalueFilter" v-model="evalueFilter" @change="applySortAndFilter" class="filter-select">
              <option value="">All</option>
              <option value="1e-50">≤ 1e-50</option>
              <option value="1e-20">≤ 1e-20</option>
              <option value="1e-10">≤ 1e-10</option>
              <option value="1e-5">≤ 1e-5</option>
            </select>
          </div>
          
          <div class="filter-group">
            <button @click="toggleAllHits" class="toggle-all-btn">
              {{ allExpanded ? 'Collapse All' : 'Expand All' }}
            </button>
          </div>
        </div>

        <!-- Results Cards -->
        <div class="results-container" v-if="filteredHits && filteredHits.length > 0">
          <div 
            v-for="(hit, index) in filteredHits" 
            :key="hit.hit_id || index" 
            class="hit-card"
            :class="{ 'expanded': expandedHits.has(index) }"
          >
            <!-- Hit Header -->
            <div class="hit-header" @click="toggleHit(index)">
              <div class="hit-rank">{{ index + 1 }}</div>
              
              <div class="hit-info">
                <h4 class="hit-title">{{ hit.hit_def }}</h4>
                <p class="hit-accession">Accession: {{ hit.hit_accession }}</p>
                <p class="hit-length">Length: {{ hit.hit_len }} bp</p>
              </div>
              
              <div class="hit-stats">
                <div class="stat-item best-score">
                  <span class="stat-label">Best Score</span>
                  <span class="stat-value">{{ getBestScore(hit) }}</span>
                </div>
                <div class="stat-item best-evalue">
                  <span class="stat-label">Best E-value</span>
                  <span class="stat-value">{{ getBestEvalue(hit) }}</span>
                </div>
                <div class="stat-item hsp-count">
                  <span class="stat-label">HSP Count</span>
                  <span class="stat-value">{{ hit.hsps.length }}</span>
                </div>
              </div>
              
              <div class="expand-icon">
                <i class="bi" :class="expandedHits.has(index) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
            </div>

            <!-- Hit Details (HSPs) -->
            <div class="hit-details" v-if="expandedHits.has(index)">
              <div 
                v-for="(hsp, hspIndex) in hit.hsps" 
                :key="hspIndex" 
                class="hsp-card"
              >
                <div class="hsp-header">
                  <h5 class="hsp-title">
                    <i class="bi bi-bullseye"></i>
                    High-scoring Pair #{{ hspIndex + 1 }}
                  </h5>
                  <div class="hsp-actions">
                    <button @click="copyAlignment(hsp)" class="action-btn copy-btn">
                      <i class="bi bi-clipboard"></i> Copy
                    </button>
                  </div>
                </div>
                
                <div class="hsp-stats-grid">
                  <div class="stat-card score">
                    <div class="stat-icon"><i class="bi bi-award"></i></div>
                    <div class="stat-content">
                      <span class="stat-number">{{ hsp.bit_score || 'N/A' }}</span>
                      <span class="stat-desc">Bit Score</span>
                    </div>
                  </div>
                  
                  <div class="stat-card evalue">
                    <div class="stat-icon"><i class="bi bi-calculator"></i></div>
                    <div class="stat-content">
                      <span class="stat-number">{{ formatEvalue(hsp.evalue || 0) }}</span>
                      <span class="stat-desc">E-value</span>
                    </div>
                  </div>
                  
                  <div class="stat-card identity">
                    <div class="stat-icon"><i class="bi bi-percent"></i></div>
                    <div class="stat-content">
                      <span class="stat-number">{{ hsp.identity || 0 }}/{{ hsp.align_len || 0 }} ({{ Math.round((hsp.identity || 0)/(hsp.align_len || 1)*100) }}%)</span>
                      <span class="stat-desc">Identity</span>
                      <div class="identity-bar">
                        <div class="identity-fill" :style="{ width: ((hsp.identity || 0)/(hsp.align_len || 1)*100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="stat-card coverage">
                    <div class="stat-icon"><i class="bi bi-arrows-expand"></i></div>
                    <div class="stat-content">
                      <span class="stat-number">{{ hsp.align_len || 'N/A' }}</span>
                      <span class="stat-desc">Align Length</span>
                    </div>
                  </div>
                </div>
                
                <!-- Sequence Alignment -->
                <div class="alignment-section">
                  <h6 class="alignment-title">
                    <i class="bi bi-code-slash"></i>
                    Sequence Alignment
                  </h6>
                  <div class="alignment-container">
                    <div class="alignment-line query-line">
                      <span class="line-label">Query</span>
                      <span class="line-positions">{{ hsp.query_from || 'N/A' }}-{{ hsp.query_to || 'N/A' }}</span>
                      <div class="sequence-wrapper">
                        <code class="sequence query-seq">{{ hsp.qseq || 'N/A' }}</code>
                      </div>
                    </div>
                    
                    <div class="alignment-line midline">
                      <span class="line-label">Match</span>
                      <span class="line-positions"></span>
                      <div class="sequence-wrapper">
                        <code class="sequence midline-seq">{{ hsp.midline || 'N/A' }}</code>
                      </div>
                    </div>
                    
                    <div class="alignment-line subject-line">
                      <span class="line-label">Sbjct</span>
                      <span class="line-positions">{{ hsp.hit_from || 'N/A' }}-{{ hsp.hit_to || 'N/A' }}</span>
                      <div class="sequence-wrapper">
                        <code class="sequence subject-seq">{{ hsp.hseq || 'N/A' }}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="blastResults && blastResults.hits && blastResults.hits.length === 0" class="no-results-card">
          <div class="no-results-icon">
            <i class="bi bi-search-heart"></i>
          </div>
          <h4>No matching results found</h4>
          <p>Please try adjusting search parameters or using a different query sequence</p>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import SearchPopup from '../components/SearchPopup.vue';

// 表单数据
const formData = ref({
  program: 'blastn',
  db: '',
  expect: '1e-5',
  identity: '90',
  maxHsp: 'none',
  querySeq: ''
});

// 数据库列表
const ntDatabases = [
  { text: 'Model Plant Genomes', value: 'Model_Plant_Genomes' },
  { text: 'Arabidopsis thaliana genome', value: 'AT.TAIR10.genome' },
  { text: 'Zea mays genome', value: 'ZM.B73NAM5.genome' },
  { text: 'Oryza sativa genome', value: 'OS.JAP.ASM3414082v1.genome' },
  { text: 'Solanum lycopersicum genome', value: 'SL4.0.genome' },
  { text: 'Glycine max genome', value: 'GM.v4.0.genome' },
  { text: 'Nicotiana tabacum genome.', value: 'NT.TN90.genome' },
];

const prDatabases = [
  { text: 'Model Plant Proteins', value: 'Model_Plant_Proteins' },
  { text: 'Swiss-Prot (Curated Universal)', value: 'swissprot' },
  { text: 'Arabidopsis thaliana protein', value: 'AT.TAIR10.protein' },
  { text: 'Zea mays protein', value: 'ZM.B73NAM5.protein' },
  { text: 'Oryza sativa protein', value: 'OS.JAP.ASM3414082v1.protein' }, 
  { text: 'Solanum lycopersicum protein', value: 'SL.ITAG4.x.protein' }, // 修正：与 .phr 文件名匹配
  { text: 'Glycine max protein', value: 'GM.v4.0.protein' }, // 修正：移除了前面的空格
  { text: 'Nicotiana tabacum protein', value: 'NT.TN90.protein' },

];

// 当前可用的数据库
const databases = ref<Array<{text: string, value: string}>>([]);

// 状态变量
const loading = ref(false);
const result = ref<string | null>(null);
const blastResults = ref<BlastResult | null>(null);

// 工具提示相关
const tooltipVisible = ref(false);
const tooltipText = ref('');

// 新增的响应式变量
const expandedHits = ref<Set<number>>(new Set([0])); // 默认展开第一个
const allExpanded = ref(false);
const sortBy = ref('evalue');
const evalueFilter = ref('');
const filteredHits = ref<Hit[]>([]);

// 显示工具提示
const showTooltip = (type: string) => {
  tooltipVisible.value = true;
  
  switch(type) {
    case 'program':
      tooltipText.value = 'Left side represents query sequence type, right side represents target sequence type';
      break;
    case 'expect':
      tooltipText.value = 'Lower values indicate higher significance of the match';
      break;
    case 'identity':
      tooltipText.value = 'Only available in BLASTN! Percentage of identical matches';
      break;
    case 'maxHsp':
      tooltipText.value = 'For example, if "1" is chosen, results will only show alignment of the subject\'s longest matching subsequence to the query';
      break;
    case 'sequence':
      tooltipText.value = 'You can submit multiple query sequences at once';
      break;
    default:
      tooltipText.value = '';
  }
};

// 隐藏工具提示
const hideTooltip = () => {
  tooltipVisible.value = false;
};

// 根据选择的程序类型更新数据库列表
const updateDatabase = () => {
  if (formData.value.program === 'blastn' || formData.value.program === 'tblastn' || formData.value.program === 'tblastx') {
    databases.value = ntDatabases;
  } else {
    databases.value = prDatabases;
  }
  // 重置数据库选择为第一个选项
  formData.value.db = databases.value[0].value;
  // 清空查询序列
  formData.value.querySeq = '';
};

// 加载示例序列
const loadExample = () => {
  const program = formData.value.program;
  if (program === 'blastn' || program === 'blastx' || program === 'tblastx') {
    formData.value.querySeq = 'GAATTGACGGAAGGGCACCACCAGGAGTGGAGCCTGCGGCTTAATTTGACTCAACACGGGGAAACTCACCAGGTCCAGACATAGTAAGGATTGACAGATTGAGAGCTCTTTCTTGATTCTATGGGTGGTGGTGCATGGCCGTTCTTAGTTGGTGGAGTGATTTGTCTGGTTAATTCCGTTAACGAACGAGACCTCAGCCTGCTAACTAGCTATGGAGCTAAGGTTGGGTAAT';
  } else if (program === 'blastp' || program === 'tblastn') {
    formData.value.querySeq = 'MAIKKLLMISFSLTSLLFSLLYIIPTTKTLFTSSKIPSLPLESNQNSNSTLPCFAYLISASKGDAGKLKRLLRSLYHRRNHYLIHLDLEAPEEEHLEMIRFVAGEPLFQPEGNVMIVGKPNLVTYRGPTMLATTLHAMALLLRCCRWDWFINLSASDYPLVTQDDLIYAFSELPRDLNFIQHTSRLGWKMNKRGKPIIIDPGLYSLNKSEIWWVSNQRSLPTSFKLFTGSAWTFLSRPFAEYCIIGYDNLPRTLLLYYTNFVSSPEGYFQTLICNSDEFKNTTVNHDLHYIAWDNPPKQHPKILGTRDYRKMVMSNRPFARKFKSNDPVLNRIDREILRRKRKLGSKPDLGPGPGARRLKSLLMRLLLRRNFVNRQCR';
  }
};

// 提交BLAST查询
const submitBlast = async () => {
  loading.value = true;
  result.value = null;
  
  try {
    // 构建与后端API匹配的请求数据格式
    const requestData = {
      program: formData.value.program,
      database: formData.value.db,
      sequence: formData.value.querySeq,
      expect: formData.value.expect,
      identity: formData.value.identity
    };
    
    console.log('提交BLAST请求:', requestData);
    
    // 发送请求到后端API
    const response = await axios.post('/KPGF_api/blast/run/', requestData);
    
    if (response.data.success) {
      console.log('BLAST响应数据:', response.data);
      
      // 直接使用后端数据（字段格式已经正确）
      blastResults.value = response.data;
      
      if (response.data.hits && response.data.hits.length > 0) {
        console.log('Found', response.data.hits.length, 'Hit results');
        
        // 直接使用原始数据
        filteredHits.value = response.data.hits;
        
        // 设置第一个结果默认展开
        expandedHits.value = new Set([0]);
        
        // 应用默认排序
        applySortAndFilter();
        
        console.log('filteredHits setup completed:', filteredHits.value.length, 'results');
              } else {
          console.log('No hits data found or hits are empty');
          filteredHits.value = [];
        }
      
      // 保持向后兼容的HTML格式
      result.value = formatBlastResults(response.data);
    } else {
      result.value = `<div class="error-message">BLAST request processing failed: ${response.data.error || 'Unknown error'}</div>`;
      blastResults.value = null;
      filteredHits.value = [];
    }
  } catch (error: any) {
    console.error('BLAST request failed:', error);
    const errorMessage = error.response?.data?.error || 'Request failed, please try again later';
    result.value = `<div class="error-message">${errorMessage}</div>`;
  } finally {
    loading.value = false;
  }
};

// 定义类型
interface QueryInfo {
  query_id?: string;
  query_def?: string;
  query_len?: number;
}

interface HSP {
  bit_score: number;
  evalue: number;
  identity: number;
  align_len: number;
  query_from: number;
  query_to: number;
  hit_from: number;
  hit_to: number;
  qseq: string;
  hseq: string;
  midline: string;
}

interface Hit {
  hit_id: string;
  hit_def: string;
  hit_accession: string;
  hit_len: number;
  hsps: HSP[];
}

interface BlastResult {
  success: boolean;
  query_info?: QueryInfo;
  hits: Hit[];
}

// 格式化BLAST结果为HTML
const formatBlastResults = (data: BlastResult): string => {
  if (!data.hits || data.hits.length === 0) {
    return '<div class="no-results">No matching sequences found.</div>';
  }
  
  let html = '<div class="blast-results">';
  
  // 添加查询信息
  if (data.query_info) {
    const qi = data.query_info;
    html += `<div class="query-info">
      <h4>Query Sequence Information</h4>
      <p><strong>Query ID:</strong> ${qi.query_id || 'Unknown'}</p>
      <p><strong>Sequence Description:</strong> ${qi.query_def || 'Unknown'}</p>
      <p><strong>Sequence Length:</strong> ${qi.query_len || 'Unknown'} bp</p>
    </div>`;
  }
  
  // 添加匹配结果
  html += '<h4>Match Results</h4>';
  html += '<div class="hits-container">';
  
  data.hits.forEach((hit: Hit, index: number) => {
    html += `<div class="hit-item">
      <div class="hit-header" data-target="hit-${index}">
        <span class="hit-number">${index + 1}</span>
        <span class="hit-id">${hit.hit_id}</span>
        <span class="hit-def">${hit.hit_def}</span>
      </div>
      <div id="hit-${index}" class="hit-details">
        <p><strong>Accession:</strong> ${hit.hit_accession}</p>
        <p><strong>Length:</strong> ${hit.hit_len} bp</p>`;
    
    // 添加HSP数据
    if (hit.hsps && hit.hsps.length > 0) {
      hit.hsps.forEach((hsp: HSP, hspIndex: number) => {
        html += `<div class="hsp-item">
          <h5>High-scoring Pair #${hspIndex + 1}</h5>
          <div class="hsp-stats">
            <p><strong>Bit Score:</strong> ${hsp.bit_score}</p>
            <p><strong>E-value:</strong> ${hsp.evalue}</p>
            <p><strong>Identity:</strong> ${hsp.identity}/${hsp.align_len} (${Math.round(hsp.identity/hsp.align_len*100)}%)</p>
          </div>
          <div class="alignment">
            <pre>Query: ${hsp.query_from}-${hsp.query_to} ${hsp.qseq}</pre>
            <pre>       ${hsp.midline}</pre>
            <pre>Sbjct: ${hsp.hit_from}-${hsp.hit_to} ${hsp.hseq}</pre>
          </div>
        </div>`;
      });
    }
    
    html += `</div></div>`;
  });
  
  html += '</div></div>';
  
  return html;
};

// 监听结果区域的点击事件，处理hit-header的点击
const setupResultEvents = () => {
  setTimeout(() => {
    const resultsContent = document.querySelector('.results-content');
    if (resultsContent) {
      resultsContent.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const header = target.closest('.hit-header');
        if (header) {
          const targetId = header.getAttribute('data-target');
          if (targetId) {
            const detailsElement = document.getElementById(targetId);
            if (detailsElement) {
              detailsElement.classList.toggle('expanded');
            }
          }
        }
      });
    }
  }, 100); // 略微延迟，确保DOM已更新
};

// 辅助函数
const getBestScore = (hit: Hit): number => {
  if (!hit.hsps || hit.hsps.length === 0) return 0;
  return Math.max(...hit.hsps.map(hsp => hsp.bit_score || 0));
};

const getBestEvalue = (hit: Hit): string => {
  if (!hit.hsps || hit.hsps.length === 0) return 'N/A';
  const minEvalue = Math.min(...hit.hsps.map(hsp => hsp.evalue || Infinity));
  return formatEvalue(minEvalue);
};

const formatEvalue = (evalue: number): string => {
  if (evalue === 0) return '0';
  if (evalue < 1e-100) return evalue.toExponential(1);
  if (evalue < 0.01) return evalue.toExponential(1);
  return evalue.toString();
};

const toggleHit = (index: number) => {
  const newSet = new Set(expandedHits.value);
  if (newSet.has(index)) {
    newSet.delete(index);
  } else {
    newSet.add(index);
  }
  expandedHits.value = newSet;
};

const toggleAllHits = () => {
  if (allExpanded.value) {
    expandedHits.value = new Set();
    allExpanded.value = false;
  } else {
    expandedHits.value = new Set(filteredHits.value.map((_, index) => index));
    allExpanded.value = true;
  }
};

const applySortAndFilter = () => {
  if (!blastResults.value || !blastResults.value.hits) {
    filteredHits.value = [];
    return;
  }
  
  let hits = [...blastResults.value.hits];
  
  // 应用E-value筛选
  if (evalueFilter.value) {
    const threshold = parseFloat(evalueFilter.value);
    hits = hits.filter(hit => {
      if (!hit.hsps || hit.hsps.length === 0) return false;
      const minEvalue = Math.min(...hit.hsps.map(hsp => hsp.evalue || Infinity));
      return minEvalue <= threshold;
    });
  }
  
  // 应用排序
  hits.sort((a, b) => {
    switch (sortBy.value) {
      case 'evalue':
        const aMinEvalue = a.hsps.length > 0 ? Math.min(...a.hsps.map(hsp => hsp.evalue || Infinity)) : Infinity;
        const bMinEvalue = b.hsps.length > 0 ? Math.min(...b.hsps.map(hsp => hsp.evalue || Infinity)) : Infinity;
        return aMinEvalue - bMinEvalue;
      case 'score':
        const aMaxScore = a.hsps.length > 0 ? Math.max(...a.hsps.map(hsp => hsp.bit_score || 0)) : 0;
        const bMaxScore = b.hsps.length > 0 ? Math.max(...b.hsps.map(hsp => hsp.bit_score || 0)) : 0;
        return bMaxScore - aMaxScore;
      case 'identity':
        const aMaxIdentity = a.hsps.length > 0 ? Math.max(...a.hsps.map(hsp => (hsp.identity || 0) / (hsp.align_len || 1))) : 0;
        const bMaxIdentity = b.hsps.length > 0 ? Math.max(...b.hsps.map(hsp => (hsp.identity || 0) / (hsp.align_len || 1))) : 0;
        return bMaxIdentity - aMaxIdentity;
      default:
        return 0;
    }
  });
  
  filteredHits.value = hits;
  
  // 重新设置默认展开状态
  if (hits.length > 0) {
    expandedHits.value = new Set([0]);
  }
};

const copyAlignment = async (hsp: HSP) => {
  const alignmentText = `Query: ${hsp.query_from || 'N/A'}-${hsp.query_to || 'N/A'} ${hsp.qseq || 'N/A'}\n       ${hsp.midline || 'N/A'}\nSbjct: ${hsp.hit_from || 'N/A'}-${hsp.hit_to || 'N/A'} ${hsp.hseq || 'N/A'}`;
  
  try {
    await navigator.clipboard.writeText(alignmentText);
    console.log('Sequence alignment copied to clipboard');
  } catch (err) {
    console.error('Copy failed:', err);
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化数据库列表
  updateDatabase();
});
</script>

<style scoped>
/* 主容器样式 */
.blast-container {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-image: linear-gradient(20deg, #fafafa, #abdfcb, #86c1bd, #e6f8f1, #faf5f0, #ffffff);
  min-height: 100vh;
}

/* 主体内容样式 */
main {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  background-color: #e6f8f1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  min-height: 650px;
}

/* BLAST卡片样式 */
.blast-card {
  background-color: #ffffff;
  border-radius: 30px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blast-card:hover {
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

/* 表单区域样式 */
.blast-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

/* 标签样式 */
label {
  display: block;
  margin-bottom: 8px;
  color: #444;
  font-weight: 500;
  text-align: left;
  font-size: 16px;
}

/* 选择框容器 */
.select-container {
  position: relative;
  width: 100%;
}

/* 选择框和输入框样式 */
.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 15px;
  background-color: #f8f8f8;
  font-size: 15px;
  transition: all 0.3s ease;
  color: #333;
  appearance: none;
}

select.form-control {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
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

/* 序列区域样式 */
.sequence-section {
  flex-direction: column;
}

.sequence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sequence-textarea {
  height: 200px;
  resize: vertical;
  font-family: monospace;
  background-color: #fcfcfc;
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

/* 提交按钮区域 */
.submit-section {
  display: flex;
  justify-content: flex-end;
  position: relative;
}

/* 提交按钮样式 */
.submit-btn {
  background-color: #86c1bd;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.submit-btn:hover {
  background-color: #159989;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(21, 153, 137, 0.2);
}

.submit-btn:disabled {
  background-color: #cccccc;
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

/* 信息图标样式 */
.info-icon {
  display: inline-block;
  margin-left: 5px;
  color: #159989;
  cursor: help;
}

/* 工具提示样式 */
.tooltip-container {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10px;
  z-index: 10;
}

.tooltip-content {
  background-color: #333;
  color: white;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 结果卡片样式 */
.results-card {
  background-color: white;
  border-radius: 30px;
  padding: 30px;
  margin-top: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.results-title {
  color: #202020;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: left;
  border-left: 5px solid #86c1bd;
  padding-left: 15px;
}

.results-content {
  text-align: left;
  overflow: auto;
  max-height: 600px;
}

/* BLAST结果样式 */
.blast-results {
  font-family: 'Arial', sans-serif;
}

.query-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.query-info h4 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
  margin-bottom: 10px;
}

.hits-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.hit-item {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.hit-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.hit-header:hover {
  background-color: #e6f8f1;
}

.hit-number {
  font-weight: bold;
  background-color: #86c1bd;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 14px;
}

.hit-id {
  font-weight: 600;
  margin-right: 15px;
  color: #159989;
}

.hit-def {
  font-size: 14px;
  color: #555;
  flex: 1;
}

.hit-details {
  padding: 15px;
  background-color: white;
  display: block; /* 直接显示，因为我们用v-if控制 */
}

.hit-details p {
  margin: 5px 0;
  font-size: 14px;
}

.hsp-item {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.hsp-item h5 {
  margin-top: 0;
  color: #333;
  font-size: 16px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
}

.hsp-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.hsp-stats p {
  margin: 0;
  font-size: 14px;
}

.alignment {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  font-family: monospace;
  font-size: 14px;
  overflow-x: auto;
}

.alignment pre {
  margin: 5px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-results {
  text-align: center;
  padding: 30px;
  background-color: #f8f8f8;
  border-radius: 10px;
  color: #666;
  font-style: italic;
}

/* 错误消息样式 */
.error-message {
  color: #e53935;
  padding: 15px;
  background-color: #ffebee;
  border-left: 4px solid #e53935;
  border-radius: 8px;
}

/* ==================== 新增精装修样式 ==================== */

/* 配色变量 */
:root {
  --primary-color: #86c1bd;
  --primary-dark: #1D4D4F;
  --secondary-color: #3c9a76;
  --accent-color: #159989;
  --light-color: #acdfcb;
  --warning-color: #e5c674;
  --neutral-color: #B78475;
}

/* 结果摘要卡片 */
.results-summary-card {
  background: linear-gradient(135deg, var(--primary-color), var(--light-color));
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  color: rgb(51, 49, 49);
  box-shadow: 0 8px 25px rgba(134, 193, 189, 0.3);
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.summary-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.summary-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: rgb(75, 115, 121);
}

.summary-stats {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.highlight-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--warning-color);
}

.query-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
}

.query-detail {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
}

/* 筛选控制区域 */
.filter-controls {
  background-color: white;
  border-radius: 15px;
    padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--light-color);
  border-radius: 10px;
  background-color: white;
  font-size: 14px;
  color: var(--primary-dark);
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(134, 193, 189, 0.2);
}

.toggle-all-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-all-btn:hover {
  background-color: var(--accent-color);
  transform: translateY(-2px);
}

/* 结果容器 */
.results-container {
  display: flex;
    flex-direction: column;
  gap: 20px;
}

/* Hit卡片样式 */
.hit-card {
  background-color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hit-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.hit-card.expanded {
  border-color: var(--primary-color);
}

/* Hit头部 */
.hit-header {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.hit-header:hover {
  background: linear-gradient(135deg, var(--light-color), rgba(134, 193, 189, 0.3));
}

.hit-rank {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  margin-right: 20px;
  flex-shrink: 0;
}

.hit-info {
  flex: 1;
  min-width: 0;
}

.hit-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 8px 0;
  word-break: break-word;
}

.hit-accession,
.hit-length {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.hit-stats {
  display: flex;
  gap: 20px;
  margin: 0 20px;
}

.stat-item {
  text-align: center;
  min-width: 80px;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-dark);
}

.expand-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 20px;
  transition: transform 0.3s ease;
}

.hit-card.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Hit详情区域 */
.hit-details {
  padding: 0 20px 20px 20px;
  background-color: #fafbfc;
}

/* HSP卡片 */
.hsp-card {
  background-color: white;
  border-radius: 15px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.hsp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, var(--light-color), rgba(172, 223, 203, 0.5));
  border-bottom: 1px solid #e9ecef;
}

.hsp-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hsp-actions {
  display: flex;
  gap: 10px;
}

.copy-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.copy-btn:hover {
  background-color: var(--accent-color);
  transform: translateY(-1px);
}

/* HSP统计网格 */
.hsp-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  padding: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #e5f5f4, #e9ecef);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: scale(1.02);
}

.stat-card.score {
  border-left: 4px solid var(--warning-color);
}

.stat-card.evalue {
  border-left: 4px solid var(--accent-color);
}

.stat-card.identity {
  border-left: 4px solid var(--secondary-color);
}

.stat-card.coverage {
  border-left: 4px solid var(--primary-color);
}

.stat-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(134, 193, 189, 0.2);
  color: var(--primary-dark);
  font-size: 16px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 2px;
}

.stat-desc {
  display: block;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.identity-bar {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.identity-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 序列比对区域 */
.alignment-section {
  padding: 20px;
  background-color: #f8f9fa;
}

.alignment-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alignment-container {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #e9ecef;
  font-family: 'Courier New', Courier, monospace;
}

.alignment-line {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.line-label {
  width: 60px;
  font-weight: 600;
  color: var(--primary-dark);
  flex-shrink: 0;
}

.line-positions {
  width: 100px;
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-right: 10px;
  flex-shrink: 0;
}

.sequence-wrapper {
  flex: 1;
  overflow-x: auto;
}

/* 自定义序列滚动条样式 */
.sequence-wrapper::-webkit-scrollbar {
  height: 8px; /* 水平滚动条高度 */
}

.sequence-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景色 */
  border-radius: 4px;
}

.sequence-wrapper::-webkit-scrollbar-thumb {
  background: #ffffff; /* 滑块颜色改为白色 */
  border-radius: 4px;
  border: 1px solid #e0e0e0; /* 添加边框以便在白色背景下可见 */
}

.sequence-wrapper::-webkit-scrollbar-thumb:hover {
  background: #f5f5f5; /* 悬停时的颜色 */
  border: 1px solid #d0d0d0;
}

.sequence {
  display: block;
  white-space: pre;
  word-wrap: break-word;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 0;
  line-height: 1.4;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.query-seq {
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.15), rgba(0, 123, 255, 0.05));
  border-left: 4px solid #007bff;
  color: #004085;
  font-weight: 500;
}

.midline-seq {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.15), rgba(40, 167, 69, 0.05));
  border-left: 4px solid #28a745;
  color: #155724;
  font-weight: 700;
  text-align: center;
}

.subject-seq {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 193, 7, 0.05));
  border-left: 4px solid #ffc107;
  color: #856404;
  font-weight: 500;
}

/* 无结果卡片 */
.no-results-card {
  background-color: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.no-results-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--light-color), var(--primary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
  font-size: 36px;
  color: white;
}

.no-results-card h4 {
  font-size: 24px;
  color: var(--primary-dark);
  margin: 0 0 10px 0;
}

  .no-results-card p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }



/* 响应式设计 */
/* 桌面端优化 (>1024px) */
@media (min-width: 1025px) {
  .blast-page {
    padding: 0 2rem;
  }
  
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px;
  }
  
  .blast-form {
    padding: 30px;
    margin-bottom: 30px;
  }
  
  .form-group {
    margin-bottom: 25px;
  }
  
  .form-label {
    font-size: 1.1rem;
    margin-bottom: 8px;
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
  .blast-page {
    padding: 0 1rem;
  }
  
  .main-content {
    padding: 20px;
    max-width: 100%;
  }
  
  .blast-form {
    padding: 25px;
    margin-bottom: 25px;
  }
  
  .form-row {
    gap: 15px;
    flex-wrap: wrap;
  }
  
  .form-group {
    margin-bottom: 20px;
    flex: 1;
    min-width: 250px;
  }
  
  .form-label {
    font-size: 1rem;
    margin-bottom: 6px;
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

/* ==================== 新增组件的响应式设计 ==================== */

/* 平板端适配 (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .results-summary-card {
    padding: 20px;
  }
  
  .summary-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .summary-icon {
    margin: 0 auto;
  }
  
  .query-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .hit-header {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .hit-stats {
    margin: 0;
    gap: 15px;
  }
  
  .hsp-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .alignment-line {
    flex-wrap: wrap;
  }
  
  .line-label,
  .line-positions {
    width: auto;
    margin-bottom: 5px;
  }
}

/* 手机端适配 (<768px) */
@media (max-width: 767px) {
  .results-summary-card {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .summary-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .summary-icon {
    width: 50px;
    height: 50px;
    margin: 0 auto 15px auto;
    font-size: 20px;
  }
  
  .summary-title {
    font-size: 22px;
  }
  
  .summary-stats {
    font-size: 14px;
  }
  
  .highlight-number {
    font-size: 18px;
  }
  
  .query-summary {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .filter-controls {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-group label {
    font-size: 13px;
  }
  
  .filter-select {
    width: 100%;
    padding: 10px;
  }
  
  .toggle-all-btn {
    width: 100%;
    padding: 12px;
  }
  
  .hit-card {
    border-radius: 15px;
  }
  
  .hit-header {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
    text-align: center;
  }
  
  .hit-rank {
    margin: 0 auto;
  }
  
  .hit-info {
    width: 100%;
  }
  
  .hit-title {
    font-size: 16px;
  }
  
  .hit-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 0;
  }
  
  .stat-item {
    min-width: auto;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .stat-value {
    font-size: 14px;
  }
  
  .expand-icon {
    width: 100%;
    justify-content: center;
  }
  
  .hit-details {
    padding: 15px;
  }
  
  .hsp-card {
    border-radius: 12px;
    margin-bottom: 15px;
  }
  
  .hsp-header {
    flex-direction: column;
    gap: 10px;
    padding: 12px 15px;
  }
  
  .hsp-title {
    font-size: 14px;
    text-align: center;
  }
  
  .hsp-actions {
    justify-content: center;
  }
  
  .hsp-stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 15px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
  
  .stat-number {
    font-size: 16px;
  }
  
  .stat-desc {
    font-size: 11px;
  }
  
  .alignment-section {
    padding: 15px;
  }
  
  .alignment-title {
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  .alignment-container {
    padding: 10px;
  }
  
  .alignment-line {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 12px;
    font-size: 12px;
  }
  
  .line-label {
    width: 100%;
    margin-bottom: 5px;
    font-size: 12px;
  }
  
  .line-positions {
    width: 100%;
    text-align: left;
    margin: 0 0 5px 0;
    font-size: 11px;
  }
  
  .sequence-wrapper {
    width: 100%;
  }
  
  .sequence {
    font-size: 12px;
    padding: 6px 8px;
    overflow-x: auto;
  }
  
  /* 移动端序列滚动条样式 */
  .sequence::-webkit-scrollbar {
    height: 6px;
  }
  
  .sequence::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .sequence::-webkit-scrollbar-thumb {
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
  
  .sequence::-webkit-scrollbar-thumb:hover {
    background: #f5f5f5;
    border: 1px solid #d0d0d0;
  }
  
  .no-results-card {
    padding: 40px 20px;
  }
  
  .no-results-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  
  .no-results-card h4 {
    font-size: 20px;
  }
  
  .no-results-card p {
    font-size: 14px;
  }
}

/* 原有的手机端适配样式继续 */
@media (max-width: 767px) {
  .blast-page {
    padding: 0 0.5rem;
  }
  
  .main-content {
    padding: 15px 10px;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
  
  .page-description {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .blast-form {
    padding: 20px 15px;
    margin-bottom: 20px;
    border-radius: 12px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .form-label {
    font-size: 0.95rem;
    margin-bottom: 6px;
    display: block;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
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
    margin-top: 10px;
  }
  
  /* 结果表格移动端优化 */
  .results-section {
    padding: 15px;
    border-radius: 12px;
  }
  
  .results-title {
    font-size: 1.4rem;
    text-align: center;
    margin-bottom: 15px;
  }
  
  .results-table {
    display: none; /* 隐藏传统表格 */
  }
  
  .mobile-results {
    display: block;
  }
  
  .result-card {
    background: white;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #159989;
  }
  
  .result-card-header {
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    font-size: 1rem;
  }
  
  .result-card-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 0.9rem;
  }
  
  .result-detail {
    display: flex;
    flex-direction: column;
  }
  
  .detail-label {
    font-weight: 600;
    color: #666;
    font-size: 0.8rem;
    margin-bottom: 2px;
  }
  
  .detail-value {
    color: #333;
    word-break: break-all;
  }
  
  .result-actions {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
}

/* 超小屏幕适配 (<480px) */
@media (max-width: 479px) {
  .blast-page {
    padding: 0 0.25rem;
  }
  
  .main-content {
    padding: 10px 5px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-description {
    font-size: 0.85rem;
  }
  
  .blast-form {
    padding: 15px 12px;
    margin-bottom: 15px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
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
  
  .result-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .result-card-header {
    font-size: 0.9rem;
  }
  
  .result-card-details {
    grid-template-columns: 1fr;
    gap: 6px;
    font-size: 0.8rem;
  }
  
  .detail-label {
    font-size: 0.75rem;
  }
  
  .action-btn {
    padding: 5px 8px;
    font-size: 0.75rem;
    min-width: 70px;
  }
}

/* 横屏模式适配 */
@media (max-width: 767px) and (orientation: landscape) {
  .form-textarea {
    min-height: 60px;
  }
  
  .blast-form {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .result-card {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .result-card-details {
    grid-template-columns: 1fr 1fr;
  }
}

/* 桌面端显示表格，隐藏移动端卡片 */
@media (min-width: 768px) {
  .mobile-results {
    display: none;
  }
  
  .results-table {
    display: table;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .form-input,
  .form-textarea,
  .form-select,
  .submit-btn,
  .action-btn {
    min-height: 44px;
  }
  
  .result-card {
    padding: 18px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .blast-form,
  .results-section,
  .result-card {
    border: 2px solid #000;
  }
  
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
  
  .submit-btn,
  .action-btn {
    border: 2px solid #000;
  }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .submit-btn,
  .action-btn,
  .result-card,
  .form-input,
  .form-textarea,
  .form-select {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .blast-page {
    background: white;
  }
  
  .submit-btn,
  .action-btn {
    display: none;
  }
  
  .blast-form,
  .results-section {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .result-card {
    border: 1px solid #000;
    box-shadow: none;
    break-inside: avoid;
  }
  
  .results-table {
    font-size: 0.8rem;
  }
}
</style>