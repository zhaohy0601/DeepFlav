// /1kpgf_vue/create-gene-index.js

import { promises as fs, createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { once } from 'events';

// --- 配置区 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义您想要扫描的所有通路文件夹
// (已根据您的需求配置好)
const PATHWAY_FOLDERS = [
  'All-Flavonvid_genes',
  'Anthocyanins_genes',
  'Flavanols_genes',
  'Flavanones_genes',
  'Flavones_genes',
  'Flavonols_genes',
  'Isoflavones_genes',
  'Phenylpropanoid_genes'
];

// 定义数据源的基础路径和最终输出文件的路径
const BASE_DATA_PATH = path.join(__dirname, 'public', 'fla-data');
const OUTPUT_FILE = path.join(__dirname, 'public', 'gene-index.json');

// --- 主函数 ---
async function createGeneIndex() {
  console.log('🚀 开始生成基因索引...');
  let filesProcessed = 0;
  let totalEntries = 0;
  let firstEntry = true;
  const outputStream = createWriteStream(OUTPUT_FILE, { encoding: 'utf8' });
  outputStream.write('[\n');

  try {
    // 遍历每一个配置好的通路文件夹
    for (const folderName of PATHWAY_FOLDERS) {
      const folderPath = path.join(BASE_DATA_PATH, folderName);
      console.log(`\n📁 正在扫描文件夹: ${folderName}`);

      try {
        const files = await fs.readdir(folderPath);
        const tsvFiles = files.filter(f => f.toLowerCase().endsWith('.tsv'));

        if (tsvFiles.length === 0) {
          console.log('   - 未找到 .tsv 文件，跳过。');
          continue;
        }

        // 遍历文件夹内所有的 .tsv 文件
        for (const tsvFile of tsvFiles) {
          const filePath = path.join(folderPath, tsvFile);
          const pathway = folderName.replace('_genes', '');
          const species = tsvFile.split('_')[0].replace(/_/g, ' ');
          const entriesFromFile = await processTsvFile(filePath, pathway, species, async (entry) => {
            const jsonString = JSON.stringify(entry);
            if (!firstEntry) {
              if (!outputStream.write(',\n' + jsonString)) {
                await once(outputStream, 'drain');
              }
            } else {
              if (!outputStream.write(jsonString)) {
                await once(outputStream, 'drain');
              }
              firstEntry = false;
            }
          });
          totalEntries += entriesFromFile;
          filesProcessed++;
        }
      } catch (e) {
        if (e.code === 'ENOENT') { // ENOENT = 文件夹未找到
          console.error(`   - ❗ 警告：文件夹不存在: ${folderPath}`);
        } else {
          console.error(`   - ❌ 处理文件夹 ${folderName} 时出错:`, e.message);
        }
      }
    }

    outputStream.write('\n]\n');
    await new Promise(resolve => outputStream.end(resolve));

    console.log('\n-----------------------------------------');
    console.log(`✅ 成功！基因索引已创建于: ${OUTPUT_FILE}`);
    console.log(`   - 共处理文件数: ${filesProcessed}`);
    console.log(`   - 共索引基因条目: ${totalEntries}`);
    console.log('-----------------------------------------');

  } catch (error) {
    console.error('❌ 发生严重错误:', error);
    outputStream.destroy();
  }
}

async function processTsvFile(filePath, pathway, species, handleEntry) {
  const stream = createReadStream(filePath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = [];
  let lineIndex = 0;
  let entries = 0;
  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) continue;
    if (lineIndex === 0) {
      headers = line.split('\t');
      lineIndex++;
      continue;
    }
    const cells = line.split('\t');
    const geneData = {};
    headers.forEach((header, idx) => {
      geneData[header] = cells[idx] || '';
    });
    geneData.species = species;
    geneData.pathway = pathway;
    await handleEntry(geneData);
    entries++;
    lineIndex++;
  }
  rl.close();
  return entries;
}

// 执行主函数
createGeneIndex();
