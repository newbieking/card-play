/**
 * CSV 解析器
 */

import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

export interface CsvRow {
  [key: string]: string | number | boolean;
}

/**
 * 解析 CSV 文件为对象数组
 */
export function parseCsvFile(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: true,        // 使用第一行作为列名
    skip_empty_lines: true,
    trim: true,
    comment: '#',         // 以 # 开头的行作为注释
  });

  // 类型转换
  return records.map((row: Record<string, string>) => {
    const converted: CsvRow = {};
    for (const [key, value] of Object.entries(row)) {
      converted[key] = convertValue(value);
    }
    return converted;
  });
}

/**
 * 自动类型转换
 */
function convertValue(value: string): string | number | boolean {
  // 布尔值
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // 整数
  if (/^-?\d+$/.test(value)) {
    const num = parseInt(value, 10);
    if (num >= Number.MIN_SAFE_INTEGER && num <= Number.MAX_SAFE_INTEGER) {
      return num;
    }
  }

  // 浮点数
  if (/^-?\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }

  // 字符串
  return value;
}
