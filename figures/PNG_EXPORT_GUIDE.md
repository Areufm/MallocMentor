# MallocMentor 图表 PNG 导出指南

本文档提供多种方式将所有 8 张 `.drawio` 文件导出为高分辨率 PNG，支持论文排版需求。

---

## 方案 1：使用 Draw.io 在线编辑器（推荐 · 最简便）

**适用场景:** 无需安装任何工具，浏览器即可操作

### 单个文件导出步骤：

1. 打开 [draw.io 在线编辑器](https://app.diagrams.net/)
2. 点击"文件 → 打开"，选择本地 `.drawio` 文件
   - 例如: `d:\Code\MallocMentor\figures\architecture.drawio`
3. 图表加载完成后，点击"文件 → 导出为 → PNG"
4. 在导出设置中：
   - 缩放因子：**2**（用于高分辨率打印）
   - 透明背景：**✓ 勾选**（保持透明）
   - 质量：**100%**（最高质量）
5. 点击"导出"按钮，文件会自动下载为 `*.drawio.png`
6. 将导出的 PNG 移至 `figures/` 文件夹

### 批量导出（所有 8 张图）：

重复上述步骤，处理以下 8 个文件：

- architecture.drawio
- entity-relationship-diagram.drawio
- module-design-diagram.drawio
- data-flow-diagram.drawio
- code-submission-flowchart.drawio
- usecase-diagram.drawio
- class-diagram.drawio
- structural-design-diagram.drawio

---

## 方案 2：使用 Draw.io 桌面应用（离线）

**适用场景:** 需要离线操作或频繁导出

### 安装客户端：

1. 下载 [draw.io 桌面版](https://github.com/jgraph/drawio-desktop/releases)
   - Windows: 下载 `.msi` 或 `.exe` 安装文件
   - macOS: 下载 `.dmg` 文件
   - Linux: 下载 `.AppImage` 或 deb/rpm

2. 安装完成后启动应用

### 导出 PNG：

1. 在 draw.io 中打开 `.drawio` 文件（拖拽或文件菜单）
2. 使用菜单：文件 → 导出为 → PNG
3. 配置导出参数：
   ```
   缩放: 2
   透明背景: 是
   质量: 默认
   ```
4. 选择保存位置为 `figures/` 目录
5. 点击导出

---

## 方案 3：使用 Draw.io CLI 命令行工具

**适用场景:** 自动化批量导出、CI/CD 集成

### 安装 Draw.io CLI：

#### Windows (via npm):

```powershell
npm install -g draw.io
# 或
npm install --save-dev draw.io
```

#### macOS:

```bash
brew install draw.io
# 或
npm install -g draw.io
```

#### Docker (所有平台):

```bash
docker run --rm -v /path/to/MallocMentor:/workspace jgraph/drawio:latest \
  -x -f png -s 2 -t -o /workspace/figures/output.png /workspace/figures/input.drawio
```

### 命令行导出：

#### 单个文件：

```bash
drawio -x -f png -s 2 -t -o figures/architecture.drawio.png figures/architecture.drawio
```

#### 批量导出（Bash/Linux/macOS）:

```bash
cd d:\Code\MallocMentor
for file in figures/*.drawio; do
  outfile="${file%.drawio}.drawio.png"
  drawio -x -f png -s 2 -t -o "$outfile" "$file"
  echo "✓ Exported $outfile"
done
```

#### 批量导出（PowerShell / Windows）:

```powershell
cd 'D:\Code\MallocMentor'
Get-ChildItem figures/*.drawio | ForEach-Object {
    $outputFile = $_.FullName -replace '\.drawio$', '.drawio.png'
    & drawio -x -f png -s 2 -t -o $outputFile $_.FullName
    Write-Host "✓ Exported $($_.Name)"
}
```

### 参数说明：

| 参数     | 说明                    | 值       |
| -------- | ----------------------- | -------- |
| `-x`     | 不打开 GUI 直接导出     | —        |
| `-f png` | 输出格式为 PNG          | —        |
| `-s 2`   | 缩放因子 2x（高分辨率） | 整数 ≥1  |
| `-t`     | 透明背景                | —        |
| `-o`     | 输出文件路径            | 文件路径 |

---

## 方案 4：使用 Node.js 脚本

**适用场景:** 需要更多控制和自定义

### 创建导出脚本 (`figures/export-png.js`)：

```javascript
#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const figuresDir = path.join(__dirname);
const drawioFiles = fs
  .readdirSync(figuresDir)
  .filter((f) => f.endsWith(".drawio"))
  .filter((f) => !f.includes("#")); // 排除临时文件

console.log(`Found ${drawioFiles.length} .drawio files`);

drawioFiles.forEach((file) => {
  const inputPath = path.join(figuresDir, file);
  const outputPath = inputPath.replace(".drawio", ".drawio.png");

  try {
    console.log(`Converting ${file}...`);
    execSync(`draw.io -x -f png -s 2 -t -o "${outputPath}" "${inputPath}"`, {
      stdio: "inherit",
    });
    console.log(`✓ Created ${path.basename(outputPath)}`);
  } catch (err) {
    console.error(`✗ Failed to export ${file}:`, err.message);
  }
});

console.log(`\nExport complete. Files saved to: ${figuresDir}`);
```

### 运行脚本：

```bash
cd figures
node export-png.js
```

或在 `package.json` 中增加快捷命令：

```json
{
  "scripts": {
    "export:diagrams": "cd figures && node export-png.js"
  }
}
```

然后执行：

```bash
npm run export:diagrams
```

---

## 方案 5：使用 Docker 一键导出（全自动）

**适用场景:** 确保环境一致性、避免依赖问题

### 创建 Dockerfile：

```dockerfile
FROM jgraph/drawio:latest

WORKDIR /workspace

# 复制所有 .drawio 文件
COPY figures/*.drawio ./figures/

# 导出为 PNG
RUN for file in figures/*.drawio; do \
    drawio -x -f png -s 2 -t -o "${file%.drawio}.drawio.png" "$file"; \
done

# 输出文件
RUN mkdir -p /output && cp figures/*.drawio.png /output/
```

### 执行导出：

```bash
cd d:\Code\MallocMentor

# 构建镜像（仅需一次）
docker build -t malloc-diagrams -f - . <<EOF
FROM jgraph/drawio:latest
WORKDIR /workspace
COPY figures/*.drawio ./figures/
RUN for file in figures/*.drawio; do drawio -x -f png -s 2 -t -o "\${file%.drawio}.drawio.png" "\$file"; done
RUN mkdir -p /output && cp figures/*.drawio.png /output/
EOF

# 提取 PNG 文件
docker run --rm -v d:\Code\MallocMentor\figures:/workspace/figures malloc-diagrams \
  sh -c "cp /workspace/figures/*.drawio.png /workspace/figures/"
```

---

## ✅ 导出完成验收

### 检查导出是否成功：

```bash
# 检查文件是否存在且大小合理（预期 >50KB）
ls -lh figures/*.drawio.png

# 或 PowerShell：
Get-ChildItem figures/*.drawio.png | Format-Table Name, @{Name="Size";Expression={"{0:N0} KB" -f ($_.Length/1KB)}}
```

### 预期文件列表：

```
✓ architecture.drawio.png (280 KB)
✓ entity-relationship-diagram.drawio.png (320 KB)
✓ module-design-diagram.drawio.png (290 KB)
✓ data-flow-diagram.drawio.png (310 KB)
✓ code-submission-flowchart.drawio.png (220 KB)
✓ usecase-diagram.drawio.png (240 KB)
✓ class-diagram.drawio.png (310 KB)
✓ structural-design-diagram.drawio.png (300 KB)
```

### 质量检查清单：

- [ ] 所有 PNG 文件文件大小 > 50KB（表示内容丰富）
- [ ] 文件尺寸符合预期（参见上面的预期大小）
- [ ] 用本地图片查看器打开，确认：
  - 背景透明（应显示棋盘格或透明）
  - 所有文字清晰可读
  - 所有图形边界清晰（无模糊）
  - 颜色饱和度正常（无失真）
- [ ] 在 Word/PowerShell 中插入 PNG，确认 100% 缩放下文字清晰

---

## 🚀 推荐方案对比

| 方案          | 易用性     | 安装成本 | 速度 | 推荐用途               |
| ------------- | ---------- | -------- | ---- | ---------------------- |
| 1. 在线编辑器 | ⭐⭐⭐⭐⭐ | 无       | 中等 | **首次导出、单个文件** |
| 2. 桌面应用   | ⭐⭐⭐⭐   | 低       | 快   | 频繁编辑导出           |
| 3. CLI 工具   | ⭐⭐⭐     | 中       | 最快 | 自动化、批量导出       |
| 4. Node 脚本  | ⭐⭐⭐     | 中       | 快   | 集成到 CI/CD           |
| 5. Docker     | ⭐⭐       | 高       | 最快 | 团队协作、完全隔离     |

**首选方案: 方案 1（在线编辑器）** - 5 分钟内完成所有 8 张图导出，无需安装任何工具。

---

## 📝 导出后的后续步骤

### 1. 放置到论文项目

```bash
# 复制 PNG 文件到论文图表目录
cp figures/*.drawio.png /path/to/thesis/images/

# 或创建软链接（保持与源文件同步）
ln -s d:\Code\MallocMentor\figures/*.drawio.png /path/to/thesis/images/
```

### 2. 在论文中引用

参考 [THESIS_INTEGRATION_GUIDE.md](./THESIS_INTEGRATION_GUIDE.md) 中的图表清单与引用模板。

### 3. Word 排版

1. 在对应章节插入 PNG
2. 添加图题（如"图 3-1 MallocMentor 总体系统架构图"）
3. 添加图注（参见集成指南中的"图注示例"）
4. 调整大小至页面宽度 85-90%
5. 设置浮动方式为"衬于文字下方"

---

## 🆘 常见问题排查

### Q: 导出的 PNG 文件太大或文字模糊？

**A:** 尝试降低缩放因子：

```bash
drawio -x -f png -s 1 -t -o output.png input.drawio  # 1x 分辨率
```

或在导出对话框中调整质量设置。

### Q: 导出过程中出错 "drawio not found"？

**A:** 确认 drawio 已安装：

```bash
drawio --version
```

如果未安装，按方案 3 重新安装 CLI，或改用方案 1（在线编辑器）。

### Q: 导出的 PNG 背景不透明？

**A:** 确保使用了 `-t` 参数：

```bash
drawio -x -f png -s 2 -t -o output.png input.drawio
```

在 GUI 中导出时，勾选"透明背景"选项。

### Q: Word 中插入 PNG 后显示不清晰？

**A:**

1. 确认导出时使用了 `-s 2` 参数（2x 分辨率）
2. 在 Word 中插入后，右键图片 → 压缩图片 → 勾选"保留高保真信息"

---

**最后更新:** 2026 年 4 月 5 日  
**版本:** 1.0
