/**
 * TypeScript 类型生成器
 */

/**
 * 根据配置数据生成 TypeScript 类型定义
 */
export function generateTypeScript(configs: Record<string, any[]>): string {
  let content = `/**
 * 自动生成的配置表 TypeScript 类型定义
 * 
 * 请勿手动编辑此文件，由 config-builder 自动生成
 * 生成时间：${new Date().toISOString()}
 */

`;

  for (const [tableName, rows] of Object.entries(configs)) {
    if (rows.length === 0) continue;

    // 从第一行推断类型
    const firstRow = rows[0];
    const interfaceName = toPascalCase(tableName);

    content += `/** ${tableName} 配置表（${rows.length} 条记录） */\n`;
    content += `export interface ${interfaceName} {\n`;

    for (const [key, value] of Object.entries(firstRow)) {
      const tsType = getTypeScriptType(value);
      // snake_case → camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      content += `  /** 原始字段名: ${key} */\n`;
      content += `  ${camelKey}: ${tsType};\n`;
    }

    content += `}\n\n`;

    // 生成类型化的配置对象
    content += `/** ${tableName} 配置数据 */\n`;
    content += `export const ${tableName}Config: ${interfaceName}[] = [];\n\n`;
  }

  // 生成配置中心类型
  content += `/** 所有配置表的集合 */\n`;
  content += `export interface ConfigData {\n`;
  for (const tableName of Object.keys(configs)) {
    if (configs[tableName].length === 0) continue;
    content += `  ${tableName}: ${toPascalCase(tableName)}[];\n`;
  }
  content += `}\n`;

  return content;
}

/**
 * 将下划线命名转换为 PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * 根据值推断 TypeScript 类型
 */
function getTypeScriptType(value: any): string {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'number' : 'number';
  }
  return 'string';
}
