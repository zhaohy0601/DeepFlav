// calculate-totals.js

import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// --- 配置区 ---
// ES Modules 中模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 定义要扫描的基础目录
const FOLDER_TO_SCAN = path.join(__dirname, 'public', 'fla-data');
// --- 结束配置 ---

// 主函数
async function calculatePathwayTotals() {
  console.log('📊 Starting gene count calculation...');
  console.log(`   Scanning directory: ${FOLDER_TO_SCAN}\n`);

  try {
    // 存储最终结果的对象，键是 pathway 文件夹名，值是总数
    const pathwayTotals = {};

    // 1. 读取基础目录下的所有 pathway 文件夹
    const pathwayFolders = await fs.readdir(FOLDER_TO_SCAN, { withFileTypes: true });

    // 2. 遍历每个 pathway 文件夹
    for (const folder of pathwayFolders) {
      if (folder.isDirectory()) {
        const pathwayName = folder.name; // e.g., "Flavonols_genes"
        const fullPath = path.join(FOLDER_TO_SCAN, pathwayName);
        let totalGenesInPathway = 0;

        // 3. 读取该 pathway 文件夹下的所有 TSV 文件
        const files = await fs.readdir(fullPath);
        const tsvFiles = files.filter(file => file.toLowerCase().endsWith('.tsv'));

        // 4. 遍历每个 TSV 文件并计算行数
        for (const tsvFile of tsvFiles) {
          const tsvFilePath = path.join(fullPath, tsvFile);
          totalGenesInPathway += await countGenes(tsvFilePath);
        }

        // 5. 存储该 pathway 的总数
        pathwayTotals[pathwayName] = totalGenesInPathway;
        console.log(`  -> Processed ${pathwayName}: ${totalGenesInPathway} genes`);
      }
    }

    // 6. 格式化并打印最终结果，方便复制
    console.log('\n✅ Calculation complete!');
    console.log('----------------------------------------------------');
    console.log('⬇️ Copy the numbers below into your getDefaultChartOption function ⬇️');
    console.log('----------------------------------------------------');

    // 与您 Vue 组件中 taxonomyCategories 数组顺序保持一致
    const categoriesInOrder = [
      "Flavonols", "Flavones", "Flavanones", "Isoflavones", 
      "Anthocyanins", "Flavanols", "Phenylpropanoid"
    ];

    const finalCounts = categoriesInOrder.map(category => {
      // "Flavonols" -> "Flavonols_genes"
      const key = `${category.replace(/ /g, '')}_genes`;
      return pathwayTotals[key] || 0; // 如果找不到，默认为0
    });

    console.log('const samples = [');
    // 打印每个数字，并在末尾加上逗号和注释
    categoriesInOrder.forEach((category, index) => {
      console.log(`  ${finalCounts[index]},  // ${category}`);
    });
    console.log('];');
    console.log('----------------------------------------------------\n');


  } catch (error) {
    console.error('❌ An error occurred during calculation:');
    console.error(error);
  }
}

async function countGenes(filePath) {
  try {
    const stream = createReadStream(filePath, 'utf8');
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let lines = 0;
    for await (const line of rl) {
      if (line.trim()) lines++;
    }
    rl.close();
    // subtract header if we counted any lines
    return lines > 0 ? lines - 1 : 0;
  } catch (error) {
    console.error(`   - ❌ Failed to count genes in ${filePath}: ${error.message}`);
    return 0;
  }
}

// 执行主函数
calculatePathwayTotals();
