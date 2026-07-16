/**
 * 配置表构建工具入口
 * 
 * 功能：
 * 1. 读取 CSV 文件
 * 2. 转换为 JSON
 * 3. 生成 TypeScript 类型定义
 * 
 * 使用：ts-node src/index.ts --input ./csv --output ./dist
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseCsvFile } from './csv-parser';
import { generateTypeScript } from './type-generator';

interface BuildConfig {
  inputDir: string;
  outputDir: string;
}

function parseArgs(): BuildConfig {
  const args = process.argv.slice(2);
  let inputDir = './csv';
  let outputDir = './dist';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputDir = args[++i];
    }
    if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[++i];
    }
  }

  return { inputDir, outputDir };
}

async function main() {
  const config = parseArgs();
  console.log('🔧 Config Builder');
  console.log(`   Input:  ${config.inputDir}`);
  console.log(`   Output: ${config.outputDir}`);

  // 确保输出目录存在
  fs.mkdirSync(config.outputDir, { recursive: true });

  // 读取所有 CSV 文件
  const csvFiles = fs.readdirSync(config.inputDir)
    .filter(f => f.endsWith('.csv'));

  console.log(`\n📁 Found ${csvFiles.length} CSV files:`);

  const allConfigs: Record<string, any[]> = {};

  for (const csvFile of csvFiles) {
    const tableName = path.basename(csvFile, '.csv');
    const csvPath = path.join(config.inputDir, csvFile);

    console.log(`   📄 ${tableName}...`);

    try {
      const data = await parseCsvFile(csvPath);
      allConfigs[tableName] = data;

      // 写入 JSON
      const jsonPath = path.join(config.outputDir, `${tableName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log(`      ✅ ${tableName}.json (${data.length} rows)`);
    } catch (error) {
      console.error(`      ❌ Failed to parse ${csvFile}:`, error);
    }
  }

  // 生成 TypeScript 类型定义
  console.log('\n📝 Generating TypeScript types...');
  const tsContent = generateTypeScript(allConfigs);
  const tsPath = path.join(config.outputDir, 'config_schema.ts');
  fs.writeFileSync(tsPath, tsContent);
  console.log(`   ✅ config_schema.ts`);

  // 生成合并的 config_data.json
  const dataPath = path.join(config.outputDir, 'config_data.json');
  fs.writeFileSync(dataPath, JSON.stringify(allConfigs, null, 2));
  console.log(`   ✅ config_data.json (${Object.keys(allConfigs).length} tables)`);

  console.log('\n✅ Build complete!');
}

main().catch(console.error);
