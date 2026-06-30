// generate-manifest.js (更新为 ES Module 语法)

// 修改: 使用 import 语法来引入 Node.js 内置模块
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 需要这个来处理 __dirname

// ES Modules 中没有 __dirname，需要用这种方式来模拟
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义要扫描的基础目录和最终输出的文件名
// path.join 现在使用 __dirname 来确保路径正确
const FOLDER_TO_SCAN = path.join(__dirname, 'public', 'fla-data');
const OUTPUT_FILE = path.join(FOLDER_TO_SCAN, 'manifest.json');

// 主函数，使用 async/await 语法 (这部分代码无需改变)
async function generateManifest() {
  console.log(`🔍 Starting to scan directory: ${FOLDER_TO_SCAN}`);

  try {
    const manifest = {};
    const pathwayFolders = await fs.readdir(FOLDER_TO_SCAN, { withFileTypes: true });

    for (const folder of pathwayFolders) {
      if (folder.isDirectory()) {
        const pathwayName = folder.name;
        const fullPath = path.join(FOLDER_TO_SCAN, pathwayName);
        
        console.log(`  -> Processing pathway: ${pathwayName}`);

        const files = await fs.readdir(fullPath);
        const tsvFiles = files.filter(file => file.toLowerCase().endsWith('.tsv'));
        manifest[pathwayName] = tsvFiles;
      }
    }

    const jsonContent = JSON.stringify(manifest, null, 2);
    await fs.writeFile(OUTPUT_FILE, jsonContent, 'utf8');

    console.log(`✅ Success! Manifest file created at: ${OUTPUT_FILE}`);
    console.log(`   Total pathways found: ${Object.keys(manifest).length}`);

  } catch (error) {
    console.error('❌ An error occurred while generating the manifest file:');
    console.error(error);
  }
}

// 执行主函数
generateManifest();