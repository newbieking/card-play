---
name: git-github-workflow
description: 使用 git 和 GitHub CLI 进行版本控制和协作的工作流程
source: auto-skill
extracted_at: '2026-07-16T02:18:17.075Z'
---

# Git 和 GitHub 工作流程技能

本技能提供使用 git 和 GitHub CLI (`gh`) 进行版本控制和协作的完整工作流程，包括初始化、提交、同步和协作。

## 使用场景

- 新项目初始化 git 仓库
- 将本地项目同步到 GitHub
- 日常提交和推送操作
- 团队协作和代码审查

## 工作流程

### 1. 项目初始化

#### 检查 git 状态
```bash
# 检查当前目录是否已经是 git 仓库
git status

# 如果不是仓库，会显示错误信息
```

#### 初始化 git 仓库
```bash
# 初始化新的 git 仓库
git init

# 验证初始化成功
git status
```

#### 创建 .gitignore 文件
**重要**：在初始化后立即创建 `.gitignore` 文件，避免提交不必要的文件。

**基本模板**：
```gitignore
# Dependencies
node_modules/

# Build output
dist/
*.tsbuildinfo

# Logs
*.log
logs/

# Environment
.env
.env.local
.env.test

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

### 2. GitHub 同步

#### 检查 GitHub CLI 状态
```bash
# 检查 gh 是否安装
gh --version

# 检查登录状态
gh auth status
```

#### 创建 GitHub 仓库
```bash
# 创建公开仓库
gh repo create <repo-name> --public --source=. --remote=origin --push

# 创建私有仓库
gh repo create <repo-name> --private --source=. --remote=origin --push
```

#### 处理 SSH 密钥问题
如果遇到 SSH 密钥错误，可以切换到 HTTPS：

```bash
# 查看当前远程 URL
git remote -v

# 更改为 HTTPS
git remote set-url origin https://github.com/<username>/<repo>.git

# 推送代码
git push -u origin master
```

### 3. 日常提交流程

#### 标准提交流程
```bash
# 1. 查看变更状态
git status

# 2. 查看具体变更内容
git diff <file>

# 3. 添加文件到暂存区
git add <file>           # 添加特定文件
git add .               # 添加所有变更
git add *.js            # 添加所有 JS 文件

# 4. 提交变更
git commit -m "type(scope): description"

# 5. 推送到远程
git push
```

#### 提交信息规范
**格式**：
```
<type>(<scope>): <description>

<body>

<footer>
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

**示例**：
```bash
git commit -m "docs: 更新战斗动画系统设计文档"
git commit -m "feat(battle): 实现卡牌攻击动画系统"
git commit -m "fix(config): 恢复完整的 .gitignore 配置"
```

### 4. 分支管理

#### 创建和切换分支
```bash
# 创建新分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换分支
git checkout -b <branch-name>

# 查看所有分支
git branch -a
```

#### 合并分支
```bash
# 切换到目标分支
git checkout main

# 合并特性分支
git merge <branch-name>

# 推送合并结果
git push
```

#### 删除分支
```bash
# 删除本地分支
git branch -d <branch-name>

# 删除远程分支
git push origin --delete <branch-name>
```

### 5. 团队协作

#### 拉取最新代码
```bash
# 拉取远程更新
git pull

# 拉取并合并
git pull origin main

# 拉取而不合并（先查看）
git fetch origin
```

#### 处理冲突
```bash
# 查看冲突文件
git status

# 编辑冲突文件，解决冲突后
git add <file>
git commit -m "fix: 解决合并冲突"
```

#### 代码审查流程
1. 创建特性分支
2. 提交变更
3. 推送到远程
4. 创建 Pull Request
5. 请求团队审查
6. 根据反馈修改
7. 合并到主分支

### 6. 常用命令速查

#### 状态查看
```bash
git status              # 查看工作区状态
git diff                # 查看未暂存的变更
git diff --staged       # 查看已暂存的变更
git log --oneline       # 查看提交历史
git log --oneline -10   # 查看最近10次提交
```

#### 撤销操作
```bash
git checkout -- <file>  # 撤销工作区变更
git reset HEAD <file>   # 撤销暂存区变更
git commit --amend      # 修改最近一次提交
git revert <commit>     # 撤销特定提交
```

#### 标签管理
```bash
git tag <tag-name>      # 创建标签
git tag -a <tag-name> -m "message"  # 创建带注释的标签
git push origin <tag-name>  # 推送标签到远程
```

### 7. GitHub CLI 高级用法

#### 查看仓库信息
```bash
gh repo view           # 查看当前仓库信息
gh repo list           # 列出您的仓库
```

#### 管理 Pull Request
```bash
gh pr create          # 创建 Pull Request
gh pr list            # 列出 Pull Request
gh pr checkout <pr-number>  # 切换到 PR 分支
gh pr merge <pr-number>    # 合并 PR
```

#### 管理 Issue
```bash
gh issue create       # 创建 Issue
gh issue list         # 列出 Issue
gh issue close <issue-number>  # 关闭 Issue
```

## 最佳实践

### 提交规范
1. **原子提交**：每个提交只做一件事
2. **清晰描述**：提交信息要清晰明了
3. **频繁提交**：小步快跑，避免大规模提交
4. **先测试后提交**：确保代码能正常工作

### 分支策略
1. **主分支保护**：`main` 分支保持稳定
2. **特性分支开发**：每个新功能在独立分支开发
3. **及时清理**：合并后删除特性分支
4. **定期同步**：经常从主分支拉取最新代码

### 协作规范
1. **代码审查**：所有变更都需要经过审查
2. **及时沟通**：遇到问题及时与团队沟通
3. **文档更新**：重要变更需要更新文档
4. **版本标记**：重要版本使用标签标记

## 常见问题解决

### 问题1：SSH 密钥错误
**症状**：`Permission denied (publickey)`
**解决**：切换到 HTTPS 或配置 SSH 密钥

### 问题2：合并冲突
**症状**：`Automatic merge failed`
**解决**：手动解决冲突后提交

### 问题3：提交错误
**症状**：提交了错误的文件或信息
**解决**：使用 `git commit --amend` 修改提交

### 问题4：推送被拒绝
**症状**：`rejected - non-fast-forward`
**解决**：先拉取远程更新，再推送

## 工具配置

### Git 配置
```bash
# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main

# 设置换行符处理（Windows）
git config --global core.autocrlf true
```

### GitHub CLI 配置
```bash
# 登录 GitHub
gh auth login

# 设置默认编辑器
gh config set editor vim

# 设置默认浏览器
gh config set browser firefox
```

## 总结

掌握 git 和 GitHub 工作流程是现代开发的基本技能。通过规范化的提交、分支管理和团队协作，可以大大提高开发效率和代码质量。记住：**频繁提交、清晰描述、及时同步、代码审查**是成功协作的关键。