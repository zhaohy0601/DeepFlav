<template>
    <div class="ml-prediction" :class="`theme-${enzymeType}`">
        <Header />
        
        <main>
            <!-- Title Section -->
            <section class="title-section">
                <h1>
                    {{ enzymeMeta.title }}
                </h1>
                <p class="subtitle">Sequence-level Deep learning LLM for plant UGTs, with UniProt/AlphaFold integration and interactive 3D inspection,From sequence to {{ enzymeMeta.family || enzymeType }} family insights—AI-powered classification & structure context</p>
            </section>

            <!-- Main Content Grid -->
            <div class="main-content-grid">
                <!-- Left Column: Features -->
                <section class="features-section">
                    <h2>Core Features</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <h3>{{ enzymeType }} Classification</h3>
                            <p>ESM-2 trained on curated {{ enzymeMeta.family || enzymeType }} datasets; outputs top family with calibrated confidence.</p>
                        </div>
                        <div class="feature-card">
                            <h3>UniProt Mapping</h3>
                            <p>BLAST-based mapping of query sequences to UniProt entries.</p>
                        </div>
                        <div class="feature-card">
                            <h3>Structure Prediction</h3>
                            <p>Automated structure retrieval from the AlphaFold DB.</p>
                        </div>
                        <div class="feature-card">
                            <h3>Interactive Molecular Viewer</h3>
                            <p>Interactive Mol visualization for pocket and functional site analysis.</p>
                        </div>
                    </div>
                </section>

                <!-- Right Column: Input -->
                <section class="input-section">
                    <div class="input-card">
                        <h2>Submit Your Sequence</h2>
                        <div class="input-methods">
                            <!-- Text Area Input -->
                            <div class="sequence-input">
                                <div class="input-header">
                                    <label for="sequence">Enter FASTA Sequence:</label>
                                    <button class="example-btn" @click.prevent="loadExample">Load Example</button>
                                </div>
                                <textarea 
                                    id="sequence" 
                                    v-model="sequenceInput"
                                    placeholder=">sp|V5LLZ9|GGT_QUERO
                            MGSEALVHVFLVSFPGQGHVNPLLRLGKRLAAKGLLVTFSTPESI...
                            Click 'Load Example' to see a valid format."
                                    @input="handleInput"
                                ></textarea>
                                <p class="input-guidance">
                                    **Please provide sequences with a standard UniProt header to enable 3D structure viewing.**<br/>
                                    You can find UniProt IDs for your protein by using the main <a href="https://www.uniprot.org/blast" target="_blank" rel="noopener noreferrer">UniProt BLAST</a> tool.
                                </p>
                            </div>
                            
                            <!-- File Upload -->
                            <div class="file-upload">
                                <label for="file-input" class="file-label">
                                    <span class="upload-icon">📂</span>
                                    Upload FASTA File
                                </label>
                                <input 
                                    type="file" 
                                    id="file-input" 
                                    accept=".fa,.fasta,.txt"
                                    @change="handleFileUpload" 
                                    class="file-input"
                                >
                                <p class="file-info">Supported formats: .fa, .fasta, .txt</p>
                            </div>
                        </div>
                        
                        <!-- Error Message Display -->
                        <div v-if="errorMessage" class="error-display">
                            <p>{{ errorMessage }}</p>
                        </div>

                        <!-- Submit Button -->
                        <button 
                            class="submit-btn" 
                            @click="submitSequence"
                            :disabled="!isValidInput || isProcessing"
                        >
                            <span v-if="isProcessing" class="spinner"></span>
                            {{ isProcessing ? 'Processing...' : 'Run Prediction' }}
                        </button>
                    </div>
                </section>
            </div>

            <!-- Results Section -->
            <section v-if="showResults" class="results-section">
                <div class="results-card">
                    <h3>Prediction Results</h3>
                    <div class="results-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>EnzymeMeta Family</th>
                                    <th>Confidence</th>
                                    <th>Length</th>
                                    <th>Molecular Weight</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- 使用 <template> 循环以支持多行 -->
                                <template v-for="result in results" :key="result.id">
                                    <tr>
                                        <td>{{ result.id }}</td>
                                        <td>{{ enzymeMeta.family }}</td>
                                        <td>{{ (result.scores?.[enzymeType] ?? result.confidence).toFixed(2) }}%</td>
                                        <td>{{ result.properties?.length || 'N/A' }} aa</td>
                                        <td>{{ result.properties?.molecular_weight ? result.properties.molecular_weight.toFixed(2) : 'N/A' }} Da</td>
                                        <td class="actions-cell">
                                            <button class="action-btn" @click="toggleDetails(result.id)">
                                                {{ expandedResults.has(result.id) ? 'Hide' : 'Details' }}
                                            </button>
                                            <button class="action-btn view-3d-btn" @click="view3DStructure(result.rawSequence)" :disabled="result.structureLoading">
                                                <span v-if="result.structureLoading" class="spinner-small"></span>
                                                <span v-else>View 3D</span>
                                            </button>
                                            <button 
                                                class="action-btn predict-substrate-btn" 
                                                @click="predictSubstrate(result.id)"
                                                :disabled="!result.structureData || result.dockingInProgress"
                                                title="Please first obtain the 3D structure, and then initiate the docking process"
                                            >
                                                <span v-if="result.dockingInProgress" class="spinner-small"></span>
                                                <span v-else>Predicted Substrate</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <!-- 可展开的详情行 -->
                                    <tr v-if="expandedResults.has(result.id)" class="details-row">
                                        <td :colspan="6">
                                            <div class="details-content">
                                                <!-- 关闭按钮 -->
                                                <button class="details-close-btn" @click="toggleDetails(result.id)" title="关闭详情">
                                                    <span>×</span>
                                                </button>
                                                <!-- BLAST 证据 -->
                                                <div class="details-section">
                                                    <h4>Functional Evidence (Top BLAST Hits )</h4>
                                                    <ul v-if="result.blast_hits && result.blast_hits.length > 0" class="blast-hits-list">
                                                        <li v-for="(hit, index) in result.blast_hits" :key="index">
                                                            <strong>{{ hit.definition }}</strong>
                                                            <div class="blast-hit-stats">
                                                                <span>Accession: {{ hit.accession }}</span>
                                                                <span>Length: {{ hit.hit_len }} aa</span>
                                                                <span v-if="hit.hsps && hit.hsps.length > 0">Best E-value: {{ formatDisplayEvalue(hit.hsps[0].evalue) }}</span>
                                                            </div>

                                                            <!-- 新增的比对详情显示代码 -->
                                                            <div 
                                                                v-for="(hsp, hspIndex) in hit.hsps" 
                                                                :key="hspIndex" 
                                                                class="alignment-section"
                                                            >
                                                                <h6 class="alignment-title">
                                                                    High-scoring Pair #{{ hspIndex + 1 }}
                                                                </h6>
                                                                <div class="hsp-stats-grid">
                                                                    <div class="stat-card identity">
                                                                        <span class="stat-desc">Identity</span>
                                                                        <span class="stat-number">{{ hsp.identity }}/{{ hsp.align_len }} ({{ Math.round(hsp.identity / hsp.align_len * 100) }}%)</span>
                                                                    </div>
                                                                    <div class="stat-card score">
                                                                        <span class="stat-desc">Score</span>
                                                                        <span class="stat-number">{{ hsp.bit_score.toFixed(1) }}</span>
                                                                    </div>
                                                                    <div class="stat-card evalue">
                                                                        <span class="stat-desc">E-value</span>
                                                                        <span class="stat-number">{{ formatDisplayEvalue(hsp.evalue) }}</span>
                                                                    </div>
                                                                </div>
                                                                <div class="alignment-container">
                                                                    <div class="alignment-line query-line">
                                                                        <span class="line-label">Query</span>
                                                                        <span class="line-positions">{{ hsp.query_from }}-{{ hsp.query_to }}</span>
                                                                        <div class="sequence-wrapper">
                                                                            <code class="sequence query-seq">{{ hsp.qseq }}</code>
                                                                        </div>
                                                                    </div>
                                                                    <div class="alignment-line midline">
                                                                        <span class="line-label">Match</span>
                                                                        <span class="line-positions"></span>
                                                                        <div class="sequence-wrapper">
                                                                            <code class="sequence midline-seq">{{ hsp.midline }}</code>
                                                                        </div>
                                                                    </div>
                                                                    <div class="alignment-line subject-line">
                                                                        <span class="line-label">Sbjct</span>
                                                                        <span class="line-positions">{{ hsp.hit_from }}-{{ hsp.hit_to }}</span>
                                                                        <div class="sequence-wrapper">
                                                                            <code class="sequence subject-seq">{{ hsp.hseq }}</code>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <!-- 新增代码结束 -->
                                                        </li>
                                                    </ul>
                                                    <p v-else>No significant similarity found in Swiss-Prot.</p>
                                                </div>

                                                <div class="details-section docking-section">
                                                    <h4>Substrate Prediction (Docking Results)</h4>

                                                    <div v-if="result.dockingInProgress" class="docking-status-text">
                                                        <p>Molecular docking calculation is in progress, this process may take several minutes, please wait or check later...</p>
                                                    </div>

                                                    <p v-else-if="result.dockingError" class="docking-error">{{ result.dockingError }}</p>

                                                    <table v-else-if="result.dockingResults && result.dockingResults.length > 0" class="docking-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Potential Substrate</th>
                                                                <th>Binding Affinity (kcal/mol)</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="docking in result.dockingResults" :key="docking.substrate">
                                                                <td>{{ docking.substrate }}</td>
                                                                <td>{{ docking.binding_affinity.toFixed(2) }}</td>
                                                                <td>
                                                                    <button 
                                                                        class="action-btn-small view-pose-btn" 
                                                                        @click="viewDockedPose(result.id, docking.substrate)"
                                                                        :disabled="!result.structureData || docking.poseLoading || result.dockingInProgress"
                                                                    >
                                                                        <span v-if="docking.poseLoading" class="spinner-small"></span>
                                                                        <span v-else>View Pose</span>
                                                                    </button>
                                                                    <p v-if="docking.poseError" class="pose-error">{{ docking.poseError }}</p>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    <p v-else class="docking-hint">Click the predicted substrate button to start the calculation.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- 3D Viewer Drawer -->
            <div class="structure-viewer-overlay" v-if="showViewer" @click="closeViewer"></div>
            <div class="structure-viewer" :class="{ 'viewer-open': showViewer }">
                <div class="viewer-header">
                    <h3>3D Structure Viewer</h3>
                    <button class="close-btn" @click="closeViewer" :disabled="viewerLoading">×</button>
                </div>
                <div class="viewer-content">
                    <!-- Loading State -->
                    <div v-if="viewerLoading" class="viewer-loader">
                        <div class="spinner"></div>
                        <p class="loading-main-text">Fetching structure data...</p>
                        <p class="loading-sub-text">This may take 1-2 minutes, please be patient</p>
                        <div class="loading-steps">
                            <p> Querying UniProt database via BLAST</p>
                            <p>Retrieving structure from AlphaFold (up to 5 retries)</p>
                            <p>First query will be cached for instant future access</p>
                            <p>If timeout occurs, please retry later</p>
                        </div>
                    </div>
                    
                    <!-- Error Display -->
                    <div v-if="viewerError && !viewerLoading" class="viewer-error-container">
                        <div class="error-header">
                            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4>Error</h4>
                        </div>
                        <pre class="error-message">{{ viewerError }}</pre>
                        <button class="error-close-btn" @click="closeViewer">Close</button>
                    </div>
                    
                    <!-- Mol* Viewer will be mounted here -->
                    <div 
                        id="molstar-viewer" 
                        class="mol-viewer"
                        :class="{ 'hidden': viewerLoading || viewerError }"
                    ></div>
                </div>
            </div>

            <!-- Documentation Section -->
            <section class="documentation-section">
                 <!-- ... (your existing documentation section) ... -->
            </section>
        </main>

        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watchEffect } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import 'molstar/build/viewer/molstar.css';




// --- TYPE DEFINITIONS ---
interface SequenceProperties {
    length: number;
    molecular_weight: number;
    amino_acid_percent: Record<string, number>;
}

interface StructureData {
    uniprotAccession: string;
    localPath: string;
    pdbUrl: string;
}

interface DockingResultEntry {
    substrate: string;
    binding_affinity: number;
    poseUrl?: string;
    poseFormat?: string;
    poseLoading?: boolean;
    poseError?: string;
}

interface BlastHsp {
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

interface BlastHit {
    definition: string;
    accession: string;
    hit_len: number;
    hsps: BlastHsp[];
}

interface PredictionResult {
    id: string;
    family: string;
    confidence: number;
    scores?: Record<string, number>;
    rawSequence: string;
    structureLoading: boolean;
    dockingInProgress: boolean; 
    properties?: SequenceProperties;
    blast_hits?: BlastHit[];
    last_hits?: BlastHit[];
    structureData?: StructureData;
    dockingResults?: DockingResultEntry[];
    dockingError?: string;
}

// 添加AlphaFold响应接口
interface AlphaFoldSuccessResponse {
    success: true;
    data: {
        pdbUrl: string;
        uniprot_id: string;
        uniprotAccession?: string;
        localPath?: string;
        sequence_length: number;
        blast_time: number;
        alphafold_time: number;
        total_time: number;
        [key: string]: any;
    };
    from_cache: boolean;
    cache_key?: string;
}

interface AlphaFoldErrorResponse {
    success: false;
    error: string;
    error_type: string;
    error_code: string;
    uniprot_id?: string;
    alphafold_url?: string;
    suggestion?: string;
    timeout_duration?: number;
    retry_attempts?: number;
    [key: string]: any;
}

type AlphaFoldResponse = AlphaFoldSuccessResponse | AlphaFoldErrorResponse;

// --- STATE MANAGEMENT ---
const sequenceInput = ref('');
const isProcessing = ref(false);
const showResults = ref(false);
const errorMessage = ref('');
const results = ref<PredictionResult[]>([]);

// 3D Viewer state
const showViewer = ref(false);
const viewerLoading = ref(false);
const viewerError = ref('');
const molstarLoaded = ref(false);
let molstarViewerInstance: any = null;
type MolstarViewerModule = typeof import('molstar/build/viewer/molstar.js');
let molstarModule: MolstarViewerModule | null = null;
const dockingPollers = new Map<string, number>();
const route = useRoute();
console.log('[MLprediction] fullPath=', route.fullPath, 'params=', route.params);


const enzymeType = computed<'GT' | 'AT' | 'MT'>(() => {
    const t = String(route.params.enzymeType || 'GT').toUpperCase();
    return (t === 'AT' || t === 'MT') ? t : 'GT';
});

watchEffect(() => {
  console.log('[UI DEBUG] hash=', window.location.hash);
  console.log('[UI DEBUG] route.params=', route.params);
  console.log('[UI DEBUG] enzymeType=', enzymeType.value);
});


const enzymeMeta = computed(() => {
    const map = {
        GT: {
            title: 'Flavonoid Glycosyltransferase Prediction',
            family: 'Flavonoid Glycosyltransferase',
            example: `>seed|TGY|GWHPASIV008145
MGSESLVHVFLVSFPGQGHVNPLLRLGKRLASRGLLVTFSAPESIGKDMRKASNCTDEPTPVGDGFIRFEFFEDGWDENEPRRQDLDQYLPQLELVGKDLLPKMLQKHADQDRPVSCLINNPFIPWVSDLAETLGLPSAMLWVQSCACFSAYYHYYHGIVPFPSEDNMEIDVQLPCMPLLKYDEVPSFLYPNTPYPFLRRAILGQYKNLSKPFCILMDTFQELEHEVIEYMSKISPIKPVGPLFKNPKAPNSNVRGDFVKADNCMEWLDSKPPGSVVYISFGSVVYLKQEHVDEIAHGILSSGVSFLWVMKPPHKDAGLELLVLPEGFLEKAGDKGRVVQWSPQEQVLVHPAVACFVTHCGWNSTMESLASGMPVVAFPQWGDQVTDAKYLVDVFKVGIRMCRGEAEDRVIPREEVEMCLREATSGPKAAEMKANALKWKETAEAAVAEGGSSDRNMQAFVDEVRRRSLGITSKSTTPEIITTTTVVV`
        },
        AT: {
            title: 'Flavonoid Acyltransferase Prediction',
            family: 'Flavonoid Acyltransferase',
            example: `>BIA1_ARATH
MEAKLEVTGKEVIKPASPSPRDRLQLSILDLYCPGIYVSTIFFYDLITESSEVFSENLKLSLSETLSRFYPLAGRIEGLSISCNDEGAVFTEARTDLLLPDFLRNLNTDSLSGFLPTLAAGESPAAWPLLSVKVTFFGSGSGVAVSVSVSHKICDIASLVTFVKDWATTTAKGKSNSTIEFAETTIYPPPPSHMYEQFPSTDSDSNITSKYVLKRFVFEPSKIAELKHKAASESVPVPTRVEAIMSLIWRCARNSSRSNLLIPRQAVMWQAMDIRLRIPSSVAPKDVIGNLQSGFSLKKDAESEFEIPEIVATFRKNKERVNEMIKESLQGNTIGQSLLSLMAETVSESTEIDRYIMSSWCRKPFYEVDFGSGSPVWVGYASHTIYDNMVGVVLIDSKEGDGVEAWISLPEEDMSVFVDDQELLAYAVLNPPVVA`
        },
        MT: {
            title: 'Flavonoid Methyltransferase Prediction',
            family: 'Flavonoid Methyltransferase',
            example: `>FAOMT_VITVI
MSSSSHRGILKTEALTKYLLETSAYPREHEQLKGLREATVEKHKYWSLMNVPVDEGLFISMLLKIMNAKKTIELGVFTGYSLLATALALPQDGKIIAVDPDKEAYQTGVPFIKKAGVEHKINFIQSDAMSVLNDLIADGKEEGTLDFAMVDADKENYLNYHELLLKLVRVGGIIAYDNTLWFGSVARSEEEEMMDFERAGRVHLMKLNKFLASDPRVELSHLSIGDGVALCRRLY`
        },
    } as const;
    return map[enzymeType.value];
});

const clearDockingPoller = (id: string) => {
    const poller = dockingPollers.get(id);
    if (poller) {
        clearInterval(poller);
        dockingPollers.delete(id);
    }
};

const ensureMolstar = async () => {
    if (molstarModule) {
        return molstarModule;
    }
    try {
        molstarLoaded.value = false;
        const module = await import('molstar/build/viewer/molstar.js');
        molstarModule = module;
        molstarLoaded.value = true;
        console.log('Mol* module loaded');
        return module;
    } catch (error) {
        console.error('Failed to load Mol* module:', error);
        molstarLoaded.value = false;
        throw error;
    }
};

const normalizeDockingEntries = (entries?: DockingResultEntry[]) => {
    if (!entries) return undefined;
    return entries.map(entry => ({
        ...entry,
        poseLoading: entry.poseLoading ?? false,
        poseError: entry.poseError ?? ''
    }));
};

const extractDockingResultList = (payload: any): DockingResultEntry[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) {
        return payload as DockingResultEntry[];
    }
    if (Array.isArray(payload.results)) {
        return payload.results as DockingResultEntry[];
    }
    if (Array.isArray(payload.result)) {
        return payload.result as DockingResultEntry[];
    }
    return [];
};

// 展开/收起详情状态
const expandedResults = ref<Set<string>>(new Set());

// --- COMPUTED PROPERTIES ---
const isValidInput = computed(() => {
    return sequenceInput.value.trim().length > 0 && sequenceInput.value.trim().startsWith('>');
});

// --- METHODS ---
const loadExample = () => {
    sequenceInput.value = enzymeMeta.value.example;
};


const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    sequenceInput.value = target.value;
};

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            sequenceInput.value = e.target.result as string;
        }
    };
    reader.readAsText(file);
};

const parseFasta = (fastaStr: string): { id: string, sequence: string }[] => {
    const sequences = [];
    const seqs = fastaStr.split('>').filter(s => s.trim() !== '');
    for (const seq of seqs) {
        const lines = seq.split('\n');
        const id = lines[0].trim();
        const sequence = lines.slice(1).join('').replace(/\s/g, '');
        if (id && sequence) {
            sequences.push({ id, sequence });
        }
    }
    return sequences;
};

const submitSequence = async () => {
    if (!isValidInput.value) {
        errorMessage.value = "Please provide input in a valid FASTA format.";
        return;
    }
    
    isProcessing.value = true;
    showResults.value = false;
    errorMessage.value = '';
    results.value = [];
    expandedResults.value = new Set();

    try {
        // 1. 提交任务到新的 /ml/submit/ 接口
        const submitResponse = await axios.post('/KPGF_api/ml/submit/', {
            sequence: sequenceInput.value,
            enzyme_type: enzymeType.value
        });
        
        const taskId = submitResponse.data.task_id;
        if (!taskId) {
            throw new Error("未能从服务器获取任务ID");
        }

        // 2. 开始轮询状态接口 /ml/status/
        const pollInterval = setInterval(async () => {
            try {
                const statusResponse = await axios.get(`/KPGF_api/ml/status/${taskId}/`);
                const data = statusResponse.data;

                if (data.status === 'SUCCESS') {
                    clearInterval(pollInterval); // 成功，停止轮询
                    
                    // --- 接收到成功结果后的处理逻辑 (和你原来一样) ---
                    const parsedSequences = parseFasta(sequenceInput.value);
                    results.value = data.results.map((res: any) => {
                        const matchingSeq = parsedSequences.find(s => s.id === res.id);
                        const blastHits = Array.isArray(res.blast_hits)
                            ? res.blast_hits
                            : Array.isArray(res.last_hits)
                                ? res.last_hits
                                : undefined;
                        return {
                            ...res,
                            blast_hits: blastHits,
                            rawSequence: matchingSeq ? matchingSeq.sequence : '',
                            structureLoading: false,
                            // 初始化对接相关的新状态
                            dockingInProgress: false,
                            structureData: undefined,
                            dockingResults: undefined,
                            dockingError: ''
                        };
                    });
                    setSmartExpandState();
                    showResults.value = true;
                    isProcessing.value = false; // 更新处理状态
                    // --- 逻辑结束 ---

                } else if (data.status === 'FAILURE') {
                    clearInterval(pollInterval); // 失败，停止轮询
                    errorMessage.value = data.error || "预测任务在后台执行失败。";
                    isProcessing.value = false;
                }
                // 如果状态是 PENDING，则什么都不做，安静地等待下一次轮询
            } catch (pollError) {
                clearInterval(pollInterval);
                errorMessage.value = "查询任务状态时发生网络错误。";
                isProcessing.value = false;
                console.error('Polling failed:', pollError);
            }
        }, 5000); // 每5秒查询一次状态

    } catch (error: any) {
        isProcessing.value = false;
        errorMessage.value = error.response?.data?.error || "提交预测任务失败。";
        console.error('Submission failed:', error);
    }
};



// 🔥 修改后的 view3DStructure 函数
const view3DStructure = async (rawSequence: string) => {
    console.log("=== 🔬 开始3D结构查看流程 ===");
    console.log(`序列长度: ${rawSequence.length} aa`);
    
    const resultIndex = results.value.findIndex(r => r.rawSequence === rawSequence);
    if (resultIndex === -1) {
        console.error("❌ 找不到对应的序列结果");
        return;
    }

    // 状态管理
    results.value[resultIndex].structureLoading = true;
    showViewer.value = true;
    viewerLoading.value = true;
    viewerError.value = '';
    await nextTick();

    // 检查 Mol* 库
    let Molstar: MolstarViewerModule | null = null;
    try {
        Molstar = await ensureMolstar();
    } catch {
        viewerError.value = "3D viewer library failed to load. Please refresh the page and try again.";
        viewerLoading.value = false;
        results.value[resultIndex].structureLoading = false;
        return;
    }
    if (!Molstar) {
        viewerError.value = "3D viewer module unavailable.";
        viewerLoading.value = false;
        results.value[resultIndex].structureLoading = false;
        return;
    }

    // 检查查看器元素
    const viewerElement = document.getElementById('molstar-viewer');
    if (!viewerElement) {
        console.error("❌ 查看器元素未找到");
        viewerError.value = "3D viewer container not found.";
        viewerLoading.value = false;
        results.value[resultIndex].structureLoading = false;
        return;
    }

    // 初始化 Mol* 实例
    if (!molstarViewerInstance) {
        console.log("📦 [步骤 1/3] 创建Mol*实例...");
        try {
            molstarViewerInstance = await Molstar.Viewer.create(viewerElement, {
                layoutIsExpanded: false,
                layoutShowControls: true
            });
            console.log("✅ Mol*实例创建成功");
        } catch (e) {
            console.error("❌ Mol*实例创建失败:", e);
            viewerError.value = "Failed to initialize 3D viewer.";
            viewerLoading.value = false;
            results.value[resultIndex].structureLoading = false;
            return;
        }
    } else {
        console.log("♻️ [步骤 1/3] 使用现有Mol*实例");
    }

    // 调用后端API
    const startTime = Date.now();
    try {
        console.log("🌐 [步骤 2/3] 调用后端API获取AlphaFold结构...");
        console.log(`   超时设置: 150秒`);
        
        const response = await axios.post<AlphaFoldResponse>(
            '/KPGF_api/structure/alphafold/', 
            { sequence: rawSequence },
            { 
                timeout: 150000,
                validateStatus: (status) => status >= 200 && status < 600
            }
        );
        
        const requestTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`   ⏱️ API响应时间: ${requestTime}秒`);
        
        // 🔥 关键修改：检查 response.data.success
        if (!response.data.success) {
            console.error("❌ 后端返回错误:", response.data);
            throw new Error(JSON.stringify(response.data));
        }
        
        // 🔥 关键修改：从 response.data.data 获取数据
        const data = response.data.data;
        if (!data || !data.pdbUrl) {
            console.error("❌ 响应数据无效:", response.data);
            throw new Error("Invalid data format returned from server");
        }
        
        console.log("✅ 成功获取PDB URL:", data.pdbUrl);
        console.log(`   🆔 UniProt ID: ${data.uniprot_id}`);
        console.log(`   💾 从缓存: ${response.data.from_cache ? '是' : '否'}`);

        // ⭐⭐ 新增：把绝对 URL 变成「只含路径」的相对 URL ⭐⭐
        let normalizedPdbUrl = data.pdbUrl;
        try {
            // 支持 data.pdbUrl 是绝对地址或相对地址两种情况
            const urlObj = new URL(data.pdbUrl, window.location.origin);
            normalizedPdbUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        } catch (e) {
            // 如果不是合法 URL（纯相对路径），就直接用原值
            normalizedPdbUrl = data.pdbUrl;
        }

        console.log("   规范化后的 PDB URL:", normalizedPdbUrl);

        if (data.blast_time) {
            console.log(`   🔍 BLAST耗时: ${data.blast_time}秒`);
        }
        if (data.alphafold_time) {
            console.log(`   🧬 AlphaFold耗时: ${data.alphafold_time}秒`);
        }
        if (data.total_time) {
            console.log(`   ⏱️ 总耗时: ${data.total_time}秒`);
        }

        results.value[resultIndex].structureData = {
            uniprotAccession: data.uniprotAccession || data.uniprot_id,
            localPath: data.localPath || '',
            pdbUrl: normalizedPdbUrl,   // ⭐ 用规范化后的
        };
        
        // 加载结构到Mol*
        console.log("🎨 [步骤 3/3] 加载结构到3D查看器...");
        const plugin = molstarViewerInstance;
        await plugin.loadStructureFromUrl(normalizedPdbUrl, 'pdb');  // ⭐ 这里也用规范化后的
        
        console.log("✅ 结构加载成功！");
        console.log("=== ✨ 3D结构查看流程完成 ===");

    } catch (error: any) {
        const requestTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`❌ 发生错误 (耗时: ${requestTime}秒):`, error);
        
        let errorMsg = "Unable to retrieve or display 3D structure";
        let errorDetails = "";
        
        // 尝试解析错误消息
        try {
            const errorData = JSON.parse(error.message);
            
            if (errorData.error) {
                errorMsg = errorData.error;
            }
            
            // 根据错误类型添加详细信息
            if (errorData.error_type) {
                console.log(`   错误类型: ${errorData.error_type}`);
                console.log(`   错误代码: ${errorData.error_code || 'N/A'}`);
                
                switch (errorData.error_type) {
                    case 'timeout':
                        errorDetails = `\n\nRequest Timeout Information:\n` +
                                     `• Retry attempts: ${errorData.retry_attempts || 5}\n` +
                                     `• Total time: ${errorData.timeout_duration || requestTime}s\n` +
                                     `• Suggestion: AlphaFold server may be busy, please retry later`;
                        break;
                    
                    case 'blast_failed':
                        errorDetails = `\n\nBLAST Query Failed\n` +
                                     `• Your sequence has no sufficient matches in UniProt database\n` +
                                     `• The sequence may be a novel or unique protein\n` +
                                     `• Suggestion: Try a longer sequence or a known protein sequence`;
                        break;
                    
                    case 'not_found':
                    case 'no_structure':
                        errorDetails = `\n\nStructure Information:\n` +
                                     `• UniProt ID: ${errorData.uniprot_id || 'N/A'}\n` +
                                     `• ${errorData.suggestion || 'This protein may not yet be predicted by AlphaFold'}`;
                        break;
                    
                    case 'connection_error':
                    case 'network_error':
                        errorDetails = `\n\nNetwork Connection Issue\n` +
                                     `• Unable to connect to AlphaFold server\n` +
                                     `• Please check your network connection and retry`;
                        break;
                    
                    case 'validation_error':
                        errorDetails = `\n\nInput Validation Error\n` +
                                     `• Please check your sequence format and length`;
                        break;
                }
                
                // 添加AlphaFold直接链接（如果有）
                if (errorData.alphafold_url) {
                    errorDetails += `\n\n🔗 You can visit directly:\n${errorData.alphafold_url}`;
                }
            }
            
        } catch (parseError) {
            // 不是JSON格式的错误
            if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error.code === 'ECONNABORTED') {
                errorMsg = "Frontend request timeout (150 seconds)";
                errorDetails = "\n\nRequest processing took too long, possible reasons:\n" +
                             "• Server is under heavy load\n" +
                             "• Network connection is unstable\n" +
                             "• Sequence is too complex\n\n" +
                             "Suggestion: Please retry later or try a shorter sequence";
            } else if (error.code === 'ERR_NETWORK') {
                errorMsg = "Network Error";
                errorDetails = "\n\nUnable to connect to server\n" +
                             "• Please check your network connection\n" +
                             "• Confirm the server is running properly";
            } else if (error.message && !error.message.startsWith('{')) {
                errorDetails = `\n\nDetails: ${error.message}`;
            }
        }
        
        viewerError.value = errorMsg + errorDetails;
        console.log("=== ❌ 3D结构查看流程失败 ===");
        
    } finally {
        console.log("[清理] 更新UI状态");
        viewerLoading.value = false;
        results.value[resultIndex].structureLoading = false;
    }
};

const predictSubstrate = async (resultId: string) => {
    const resultIndex = results.value.findIndex(r => r.id === resultId);
    if (resultIndex === -1) {
        return;
    }

    const targetResult = results.value[resultIndex];

    if (!targetResult.structureData) {
        window.alert("错误：请先点击 'View 3D' 获取蛋白质结构信息后，再进行对接。");
        return;
    }

    if (!targetResult.structureData.uniprotAccession || !targetResult.structureData.localPath) {
        targetResult.dockingError = "结构信息不完整，请重新加载3D结构后再试。";
        return;
    }

    clearDockingPoller(resultId);
    targetResult.dockingInProgress = true;
    targetResult.dockingError = '';
    targetResult.dockingResults = undefined;

    const { uniprotAccession, localPath } = targetResult.structureData;

    try {
        console.log(`[对接] 尝试查询 ${uniprotAccession} 的预计算结果...`);
        const precomputedResponse = await axios.get('/KPGF_api/api/docking/precomputed/', {
            params: { id: uniprotAccession }
        });
        const precomputedResults = extractDockingResultList(precomputedResponse.data);
        targetResult.dockingResults = normalizeDockingEntries(precomputedResults);
        targetResult.dockingInProgress = false;
        console.log('[对接]  VIP通道命中！直接渲染结果。');
        return;
    } catch (error: any) {
        if (error?.response?.status === 404) {
            console.log('[对接]  VIP通道未命中，启动实时计算任务...');
        } else {
            console.error('[对接] 查询预计算结果时发生意外错误:', error);
            targetResult.dockingError = "查询预计算数据库时发生错误。";
            targetResult.dockingInProgress = false;
            return;
        }
    }

    let taskId: string | undefined;
    try {
        const submitResponse = await axios.post('/KPGF_api/api/docking/submit/', {
            localPath,
            uniprotId: uniprotAccession
        });

        taskId = submitResponse.data?.task_id;
        if (!taskId) {
            throw new Error('未能获取对接任务ID');
        }
    } catch (submitError) {
        console.error('[对接] 提交实时计算失败:', submitError);
        targetResult.dockingError = "提交对接任务失败。";
        targetResult.dockingInProgress = false;
        return;
    }

    const pollStatus = async () => {
        try {
            const statusResponse = await axios.get(`/KPGF_api/api/docking/status/${taskId}/`);
            const data = statusResponse.data;

            if (data.status === 'SUCCESS') {
                clearDockingPoller(resultId);
                const dockingResults = extractDockingResultList(data.result);
                targetResult.dockingResults = normalizeDockingEntries(dockingResults);
                targetResult.dockingInProgress = false;
                console.log('[对接]  实时计算成功！');
            } else if (data.status === 'FAILURE') {
                clearDockingPoller(resultId);
                targetResult.dockingError = data.error || "对接任务在后台执行失败。";
                targetResult.dockingInProgress = false;
                console.error('[对接]  实时计算失败:', data.error);
            }
        } catch (pollError) {
            clearDockingPoller(resultId);
            targetResult.dockingError = "轮询对接任务状态时出错。";
            targetResult.dockingInProgress = false;
            console.error('[对接] 轮询失败:', pollError);
        }
    };

    await pollStatus();
    if (targetResult.dockingInProgress) {
        const intervalId = window.setInterval(pollStatus, 10000);
        dockingPollers.set(resultId, intervalId);
    }
};

const viewDockedPose = async (resultId: string, substrate: string) => {
  const resultIndex = results.value.findIndex(r => r.id === resultId);
  if (resultIndex === -1) return;

  const targetResult = results.value[resultIndex];
  const structureInfo = targetResult.structureData;
  if (!structureInfo || !structureInfo.pdbUrl) {
    window.alert("请先获取3D结构以加载对接姿态。");
    return;
  }

  const dockingEntry = targetResult.dockingResults?.find(d => d.substrate === substrate);
  if (!dockingEntry || dockingEntry.poseLoading) return;

  dockingEntry.poseLoading = true;
  dockingEntry.poseError = '';
  showViewer.value = true;
  viewerLoading.value = true;
  viewerError.value = '';
  await nextTick();

  // 1) 确保 Mol* 模块
  let Molstar: MolstarViewerModule | null = null;
  try {
    Molstar = await ensureMolstar();
  } catch (error) {
    console.error('Failed to load Mol* module for docking pose:', error);
    dockingEntry.poseError = "无法加载3D查看器库。";
    viewerError.value = "3D viewer library failed to load. Please refresh and try again.";
    viewerLoading.value = false;
    dockingEntry.poseLoading = false;
    return;
  }

  // 2) 确保容器
  const viewerElement = document.getElementById('molstar-viewer');
  if (!viewerElement) {
    dockingEntry.poseError = "3D查看器容器未找到。";
    viewerError.value = "3D viewer container not found.";
    viewerLoading.value = false;
    dockingEntry.poseLoading = false;
    return;
  }

  // 3) 初始化 viewer（只做一次）
  if (!molstarViewerInstance) {
    try {
      molstarViewerInstance = await Molstar.Viewer.create(viewerElement, {
        layoutIsExpanded: false,
        layoutShowControls: true
      });
    } catch (viewerInitError) {
      console.error('Failed to create Mol* instance for docking pose:', viewerInitError);
      dockingEntry.poseError = "初始化3D查看器失败。";
      viewerError.value = "Failed to initialize 3D viewer.";
      viewerLoading.value = false;
      dockingEntry.poseLoading = false;
      return;
    }
  }

  try {
    // 4) 拿 pose 信息
    let poseUrl = dockingEntry.poseUrl as string | undefined;
    let poseFormat = dockingEntry.poseFormat as string | undefined;
    let mode: 'complex' | 'ligand_only' = 'ligand_only';

    if (!poseUrl) {
      console.log('[对接] 获取 pose 信息...');
      const poseResponse = await axios.get('/KPGF_api/api/docking/pose/', {
        params: { uniprotId: structureInfo.uniprotAccession, substrate }
      });

      poseUrl = poseResponse.data?.poseUrl;
      poseFormat = poseResponse.data?.poseFormat || 'pdb';
      mode = poseResponse.data?.mode || 'ligand_only';

      if (!poseUrl) throw new Error('后端未返回有效的poseUrl');

      // 统一：如果后端给的是 /pdb_cache/...，开发环境强制补 /KPGF_api 走代理
      if (poseUrl.startsWith('/pdb_cache/')) {
        poseUrl = '/KPGF_api' + poseUrl;
      }

      // 如果是绝对URL，也转成 path（可选）
      try {
        const urlObj = new URL(poseUrl, window.location.origin);
        poseUrl = urlObj.pathname + urlObj.search + urlObj.hash;
      } catch (e) {}

      dockingEntry.poseUrl = poseUrl;
      dockingEntry.poseFormat = poseFormat;
    } else {
      // 已缓存 poseUrl 时也要防呆补前缀
      if (poseUrl.startsWith('/pdb_cache/')) {
        poseUrl = '/KPGF_api' + poseUrl;
        dockingEntry.poseUrl = poseUrl;
      }
      poseFormat = poseFormat || 'pdb';
    }

    console.log('[对接] 准备加载 pose: ', { poseUrl, poseFormat, mode });

    const plugin: any = molstarViewerInstance;

    // 5) 清空旧结构
    try {
      if (plugin?.clear) await plugin.clear();
      else if (plugin?.plugin?.clear) await plugin.plugin.clear();
    } catch (e) {
      console.warn('[对接] 清空失败(可忽略):', e);
    }

    // 6) 加载
    if (mode === 'complex') {
      console.log('[对接] 🎯 加载复合物:', poseUrl);
      await plugin.loadStructureFromUrl(poseUrl, 'pdb');
    } else {
      console.log('[对接] ⚠️ 分别加载受体+配体');
      await plugin.loadStructureFromUrl(structureInfo.pdbUrl, 'pdb');
      await plugin.loadStructureFromUrl(poseUrl, poseFormat);
    }

    viewerLoading.value = false;
    dockingEntry.poseLoading = false;
    console.log(`✅ [对接] ${substrate} 加载完成 (mode=${mode})`);
  } catch (poseError: unknown) {
    console.error('❌ Failed to load docked pose:', poseError);
    dockingEntry.poseError = "加载对接姿态失败，请稍后重试。";
    const poseMessage =
      poseError instanceof Error ? poseError.message :
      (typeof poseError === 'object' && poseError && 'message' in poseError) ? String((poseError as any).message) :
      '未知错误';
    viewerError.value = `Docked pose failed: ${poseMessage}`;
    viewerLoading.value = false;
    dockingEntry.poseLoading = false;
  }
};


const formatDisplayEvalue = (evalue: number): string => {
    if (evalue === 0) {
        return "< 1.0e-200"; // 这是一个科研论文中常见的表示方法
    }
    return evalue.toExponential(2); // 对于非零值，继续使用科学记数法
};

const setSmartExpandState = () => {
    // 清空当前展开状态
    expandedResults.value = new Set();
    
    // 智能展开逻辑：
    // - 单行结果：自动展开该结果的BLAST详情，让用户可以立即查看功能证据
    // - 多行结果：只展开第一个结果，避免页面过于拥挤，但提供快速查看最相关结果的能力
    // - 无结果：保持空状态
    
    if (results.value.length === 1) {
        // 单行结果：自动展开唯一的结果
        expandedResults.value.add(results.value[0].id);
        console.log('Single result detected, auto-expanding:', results.value[0].id);
    } else if (results.value.length >= 2) {
        // 多行结果：只展开第一个（通常是最高置信度的结果）
        expandedResults.value.add(results.value[0].id);
        console.log('Multiple results detected, expanding first result:', results.value[0].id);
    }
    // 如果没有结果（results.value.length === 0），保持空的Set状态
};

const toggleDetails = (id: string) => {
    const newSet = new Set(expandedResults.value);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    expandedResults.value = newSet;
};

const closeViewer = async () => {
    showViewer.value = false;
    
    // 可选：如果你想在关闭时完全清理viewer实例
    // 注释掉下面的代码可以保留实例以便重用
    
    if (molstarViewerInstance) {
        try {
            await molstarViewerInstance.dispose();
            molstarViewerInstance = null;
        } catch (e) {
            console.warn('Failed to dispose viewer instance:', e);
        }
    }
};

onBeforeUnmount(() => {
    dockingPollers.forEach((_, id) => clearDockingPoller(id));
});

</script>

<style scoped>
/* 现有的所有样式保持不变 */
.spinner, .spinner-small {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
    width: 20px;
    height: 20px;
    margin-right: 10px;
}
.spinner-small {
    width: 12px;
    height: 12px;
}
.submit-btn, .view-3d-btn {
    display: flex;
    align-items: center;
    justify-content: center;
}
.error-display {
    color: #e53935;
    background-color: #ffebee;
    border: 1px solid #e53935;
    border-radius: 10px;
    padding: 15px;
    margin-top: 20px;
    text-align: center;
}
.structure-viewer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}
.structure-viewer {
    position: fixed;
    top: 0;
    right: -1200px;
    width: 1200px;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 1000;
}
.viewer-open {
    right: 0;
}
.viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
}
.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}
.viewer-content {
    position: relative;
    height: calc(100% - 70px);
}
.viewer-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #666;
    max-width: 500px;
    width: 90%;
}
.viewer-loader .spinner {
    border-top-color: #86c1bd;
    width: 48px;
    height: 48px;
    border-width: 4px;
}
.loading-main-text {
    color: #2d5a52;
    font-size: 1.2em;
    font-weight: 600;
    margin: 20px 0 10px 0;
}
.loading-sub-text {
    color: #666;
    font-size: 0.95em;
    margin-bottom: 20px;
}
.loading-steps {
    text-align: left;
    background: #f8fffe;
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid #86c1bd;
    margin-top: 20px;
}
.loading-steps p {
    font-size: 0.85em;
    color: #555;
    margin: 8px 0;
    line-height: 1.5;
}
.viewer-error-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff5f5;
    border: 2px solid #ff5252;
    border-radius: 12px;
    padding: 30px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.2);
}
.error-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}
.error-icon {
    width: 24px;
    height: 24px;
    color: #d32f2f;
    margin-right: 10px;
}
.error-header h4 {
    color: #d32f2f;
    font-size: 1.3em;
    font-weight: 600;
    margin: 0;
}
.error-message {
    background: white;
    color: #c62828;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #ffcdd2;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 0.9em;
    line-height: 1.6;
    margin: 15px 0;
    max-height: 400px;
    overflow-y: auto;
}
.error-close-btn {
    background: linear-gradient(135deg, #d32f2f, #c62828);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    width: 100%;
}
.error-close-btn:hover {
    background: linear-gradient(135deg, #c62828, #b71c1c);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(211, 47, 47, 0.3);
}
.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
#molstar-viewer {
    position: relative;
    width: 100%;
    height: 100%;
}
#molstar-viewer.hidden {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
}

/* 其他现有样式 */
.ml-prediction {
    font-family: 'Arial', sans-serif;
    background-image: linear-gradient(20deg,#f3ffee,#abdfcb,#86c1bd,#e6f8f1,#faf5f0,#fdffff);
}
.theme-GT {
    --primary-color: #abdfcb;
    --secondary-color: #3c9a76;
}
.theme-AT {
    --primary-color: #86c1bd;
    --secondary-color: #5bb7b1;
}
.theme-MT {
    --primary-color: #8fccae;
    --secondary-color: #86c1bd;
}
main {
    max-width: 2000px;
    margin: 0 auto;
    padding: 10px 10px;
}
.title-section {
    text-align: center;
    margin: 0 0 20px 0;
    padding: 50px;
    background-color: var(--primary-color);
    border-radius: 10px;
}
.title-section h1 {
    font-size: 2.5em;
    color: #4c5050;
    margin-bottom: 10px;
}
.subtitle {
    font-size: 1.2em;
    color: #666;
}
.main-content-grid {
    display: flex;
    gap: 0px;
    margin-bottom: 30px;
}
.features-section {
    flex: 0 0 20%;
    background: var(--primary-color);
    border-radius: 20px 0 0 20px;
    padding: 30px;
}
.input-section {
    flex: 1;
}
.input-card, .progress-card, .results-card {
    background: #ffffff;
    border-radius: 0 20px 20px 0;
    padding: 30px;
    margin-bottom: 30px;
}

.input-card {
    margin-bottom: 0;
}
.input-methods {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 20px 0;
}
.sequence-input textarea {
    width: 100%;
    height: 400px;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-family: monospace;
    resize: vertical;
    transition: border-color 0.3s;
}
.sequence-input textarea:focus {
    border-color: #86c1bd;
    outline: none;
}
.file-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 2px dashed #86c1bd;
    border-radius: 10px;
    transition: all 0.3s;
}
.file-upload:hover {
    background-color: #f5f5f5;
}
.file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 20px;
}
.upload-icon {
    font-size: 2em;
    margin-bottom: 10px;
}
.file-input {
    display: none;
}
.submit-btn, .download-btn, .share-btn, .view-3d-btn {
    background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;

}

.submit-btn:disabled, .view-3d-btn:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.results-table {
    overflow-x: auto;
    margin: 20px 0;
}
table {
    width: 100%;
    border-collapse: collapse;
}
th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}
th {
    background-color: #f5f5f5;
    font-weight: bold;
}
.features-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 30px;
}
.feature-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
}
.doc-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 20px 0;
}
.doc-item {
    background: white;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 10px;
    overflow-x: auto;
}
@media (max-width: 768px) {
    .input-methods {
        grid-template-columns: 1fr;
    }
    .main-content-grid {
        flex-direction: column;
    }
    .doc-content {
        grid-template-columns: 1fr;
    }
    .structure-viewer {
        width: 100%;
        right: -100%;
    }
    .title-section h1 {
        font-size: 1.8em;
    }
    .features-grid {
        grid-template-columns: 1fr;
    }
}


.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.example-btn {
    background-color: transparent;
    color: #3c9a76; /* 使用您的主题色 */
    border: 1px solid #3c9a76;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
}

.example-btn:hover {
    background-color: #3c9a76;
    color: white;
}

.input-guidance {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
}

.input-guidance code {
    background-color: #e0e0e0;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
}

.input-guidance a {
    color: #3c9a76;
    text-decoration: none;
    font-weight: bold;
}

.input-guidance a:hover {
    text-decoration: underline;
}

/* New styles for details */
.actions-cell {
    display: flex;
    gap: 10px;
    align-items: center;
}

.action-btn {
    background: none;
    border: 1px solid #86c1bd;
    color: #3c9a76;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 70px;
}

.action-btn:hover {
    background-color: var(--secondary-color);
    color: white;
    border-color: var(--secondary-color);
}

.action-btn:disabled {
    background-color: #cccccc;
    color: #888;
    border-color: #888;
    cursor: not-allowed;
}

.predict-substrate-btn {
    min-width: 110px;
}

.action-btn-small {
    border: 1px solid #86c1bd;
    background: white;
    color: #3c9a76;
    border-radius: 6px;
    font-size: 12px;
    padding: 4px 8px;
    cursor: pointer;
    opacity: 1;
}

.action-btn-small:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.view-pose-btn {
    min-width: 90px;
}

.pose-error {
    margin-top: 6px;
    font-size: 12px;
    color: #c62828;
}

.docking-section {
    margin-top: 10px;
}

.docking-status-text,
.docking-hint {
    font-size: 14px;
    color: #555;
    line-height: 1.6;
}

.docking-error {
    color: #c62828;
    font-weight: 600;
}

.docking-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    background: white;
    border: 1px solid #e0f0ee;
    border-radius: 8px;
    overflow: hidden;
}

.docking-table th,
.docking-table td {
    padding: 10px;
    border-bottom: 1px solid #e0f0ee;
    text-align: left;
}

.docking-table th {
    background: #f2fbfa;
    font-size: 14px;
    color: #3c9a76;
}

.docking-table tr:last-child td {
    border-bottom: none;
}

.details-row {
    background-color: #f8fffe;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.details-row td {
    padding: 0;
    border-top: 2px solid #86c1bd;
}

.details-content {
    padding: 25px 30px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    background: linear-gradient(135deg, #c3ece6 0%, #ffffff 100%);
    border-radius: 0 0 10px 10px;
    box-shadow: inset 0 2px 4px rgba(134, 193, 189, 0.1);
    position: relative;
    max-width: 100%;
    max-height: 700px;
    overflow-y: auto;   /* ✅ 开启上下滚动条 */
    overflow-x: hidden; /* ✅ 横向仍然隐藏 */
}

.details-close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #86c1bd, #3c9a76);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(60, 154, 118, 0.3);
    transition: all 0.2s ease;
    z-index: 10;
}

.details-close-btn:hover {
    background: linear-gradient(135deg, #3c9a76, #2d7a5e);
    box-shadow: 0 4px 8px rgba(60, 154, 118, 0.4);
    transform: scale(1.05);
}

.details-close-btn:active {
    transform: scale(0.95);
}

.details-close-btn span {
    line-height: 1;
    margin-top: -2px; /* 微调×符号的垂直位置 */
}

.details-section {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e8f4f3;
    max-height: 500px;
    overflow-y: auto;
}

/* details-section 滚动条样式 */
.details-section::-webkit-scrollbar {
    width: 8px;
}

.details-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.details-section::-webkit-scrollbar-thumb {
    background: #e8f4f3;
    border-radius: 4px;
}

.details-section::-webkit-scrollbar-thumb:hover {
    background: #86c1bd;
}

.details-section h4 {
    color: #2d5a52;
    margin: 0 0 15px 0;
    font-size: 1.1em;
    font-weight: 600;
    border-bottom: 2px solid #86c1bd;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
}

.details-section h4::before {
    content: " ";
    margin-right: 8px;
    font-size: 1.2em;
}

.details-section:nth-child(2) h4::before {
    content: " ";
}

.details-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.details-section li {
    margin-bottom: 10px;
    color: #444;
    font-size: 0.95em;
    line-height: 1.4;
}

.blast-hits-list li {
    padding: 15px;
    margin-bottom: 12px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
    border: 1px solid #e0f2f1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.blast-hits-list li:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.blast-hits-list li strong {
    color: #2d5a52;
    display: block;
    margin-bottom: 8px;
    font-size: 1.05em;
}

.blast-hit-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 0.85em;
    color: #666;
    margin-top: 8px;
}

.blast-hit-stats span {
    background: #f0f8f7;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #e0f2f1;
    font-family: 'Courier New', monospace;
}

/* 新增：序列比对显示样式 */
.alignment-section {
    margin-top: 15px;
    padding: 15px;
    background: linear-gradient(135deg, #fafffe 0%, #f5f9f8 100%);
    border-radius: 8px;
    border-left: 4px solid #86c1bd;
    max-height: 300px;
    overflow-y: auto;
}

/* alignment-section 滚动条样式 */
.alignment-section::-webkit-scrollbar {
    width: 8px;
}

.alignment-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.alignment-section::-webkit-scrollbar-thumb {
    background: #86c1bd;
    border-radius: 4px;
}

.alignment-section::-webkit-scrollbar-thumb:hover {
    background: #3c9a76;
}

.alignment-title {
    color: #2d5a52;
    font-size: 0.9em;
    font-weight: 600;
    margin: 0 0 12px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #d0e8e6;
}

.hsp-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
}

.stat-card {
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e8f4f3;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-desc {
    display: block;
    font-size: 0.75em;
    color: #666;
    font-weight: 500;
    margin-bottom: 2px;
}

.stat-number {
    display: block;
    font-size: 0.85em;
    font-weight: 600;
    color: #2d5a52;
    font-family: 'Courier New', monospace;
}

.stat-card.identity {
    border-left: 3px solid #4caf50;
}

.stat-card.score {
    border-left: 3px solid #2196f3;
}

.stat-card.evalue {
    border-left: 3px solid #ff9800;
}

.alignment-container {
    background: #ffffff;
    border: 1px solid #e0f2f1;
    border-radius: 6px;
    padding: 12px;
    font-family: 'Courier New', monospace;
    overflow: visible;
}

.alignment-line {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
}

.line-label {
    width: 60px;
    font-size: 0.8em;
    font-weight: bold;
    color: #2d5a52;
    text-align: right;
    margin-right: 10px;
    flex-shrink: 0;
}

.line-positions {
    width: 80px;
    font-size: 0.75em;
    color: #666;
    text-align: right;
    margin-right: 10px;
    flex-shrink: 0;
}

.sequence-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100%;
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
    font-family: 'Courier New', monospace;
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

@media (max-width: 768px) {
    .results-table {
        margin: 15px 0;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    table {
        min-width: 700px; /* 移动端适当减小最小宽度 */
    }
    
    th, td {
        padding: 8px 6px;
        font-size: 14px;
    }
    
    /* 移动端列宽调整 */
    th:nth-child(1), td:nth-child(1) { /* ID */
        min-width: 100px;
        font-size: 12px;
    }
    th:nth-child(2), td:nth-child(2) { /* GT Family */
        min-width: 150px;
        font-size: 12px;
    }
    th:nth-child(3), td:nth-child(3) { /* Confidence */
        min-width: 80px;
        font-size: 12px;
    }
    th:nth-child(4), td:nth-child(4) { /* Length */
        min-width: 70px;
        font-size: 12px;
    }
    th:nth-child(5), td:nth-child(5) { /* Molecular Weight */
        min-width: 110px;
        font-size: 12px;
    }
    th:nth-child(6), td:nth-child(6) { /* Actions */
        min-width: 140px;
    }
    
    .action-btn {
        padding: 4px 8px;
        font-size: 12px;
        min-width: 50px;
    }
    
    .details-content {
        padding: 20px;
        padding-right: 50px; /* 为右侧关闭按钮留出空间 */
        max-height: 500px;
        overflow-y: auto;   /* ✅ 移动端也能上下滚动 */
        overflow-x: hidden;
    }
    
    .details-close-btn {
        top: 10px;
        right: 10px;
        width: 28px;
        height: 28px;
        font-size: 16px;
    }
    
    .blast-hit-stats {
        flex-direction: column;
        gap: 8px;
    }
    
    .hsp-stats-grid {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    
    .alignment-line {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 8px;
    }
    
    .line-label, .line-positions {
        width: auto;
        margin-right: 0;
        margin-bottom: 2px;
    }
    
    .details-section {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .alignment-section {
        max-height: 250px;
        overflow-y: auto;
    }
    
    .sequence {
        word-break: break-all;
        white-space: pre-wrap;
        font-size: 12px;
        padding: 6px 8px;
    }
    
    .sequence-wrapper {
        width: 100%;
    }
    
    /* 移动端序列滚动条样式 */
    .sequence-wrapper::-webkit-scrollbar {
        height: 6px;
    }
    
    .sequence-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    .sequence-wrapper::-webkit-scrollbar-thumb {
        background: #ffffff;
        border-radius: 3px;
        border: 1px solid #e0e0e0;
    }
    
    .sequence-wrapper::-webkit-scrollbar-thumb:hover {
        background: #f5f5f5;
        border: 1px solid #d0d0d0;
    }
}

/* 超小屏幕优化 (小于480px) */
@media (max-width: 479px) {
    .results-table {
        margin: 10px 0;
    }
    
    table {
        min-width: 600px; /* 进一步减小最小宽度 */
    }
    
    th, td {
        padding: 6px 4px;
        font-size: 12px;
    }
    
    /* 超小屏幕列宽调整 */
    th:nth-child(1), td:nth-child(1) { /* ID */
        min-width: 80px;
        font-size: 11px;
    }
    th:nth-child(2), td:nth-child(2) { /* GT Family */
        min-width: 120px;
        font-size: 11px;
    }
    th:nth-child(3), td:nth-child(3) { /* Confidence */
        min-width: 70px;
        font-size: 11px;
    }
    th:nth-child(4), td:nth-child(4) { /* Length */
        min-width: 60px;
        font-size: 11px;
    }
    th:nth-child(5), td:nth-child(5) { /* Molecular Weight */
        min-width: 90px;
        font-size: 11px;
    }
    th:nth-child(6), td:nth-child(6) { /* Actions */
        min-width: 120px;
    }
    
    .action-btn {
        padding: 3px 6px;
        font-size: 11px;
        min-width: 45px;
    }
    
    .details-content {
        padding: 15px;
        padding-right: 45px;
        max-height: 400px;
    }
    
    .details-close-btn {
        width: 24px;
        height: 24px;
        font-size: 14px;
    }
}
</style>
