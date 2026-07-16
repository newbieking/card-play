---
name: 整理业务文档到单独文件夹
overview: 将根目录下的所有游戏设计文档（.md文件）移动到新建的'docs'文件夹中，保持CODEBUDDY.md在根目录。
todos:
  - id: create-docs-folder
    content: 创建"docs"文件夹
    status: completed
  - id: move-business-docs
    content: 将6个业务文档移动到"docs"文件夹
    status: completed
    dependencies:
      - create-docs-folder
  - id: verify-file-structure
    content: 验证文件移动成功，确认目录结构
    status: completed
    dependencies:
      - move-business-docs
---

## 需求描述

将根目录下的业务文档（battle-protocol.md, design.md, gacha-rng.md, play.md, progression-tables.md, tech-stack.md）移动到一个单独的文件夹中，保持CODEBUDDY.md在根目录不变。

## 具体要求

1. 创建一个新的文件夹（建议命名为"docs"或"documentation"）
2. 将上述6个业务文档移动到该文件夹中
3. 确保CODEBUDDY.md保留在根目录
4. 移动后验证文件位置正确