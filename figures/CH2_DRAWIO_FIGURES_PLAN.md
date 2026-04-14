# Chapter 2 Draw.io Figures Plan

本清单对应第2章“相关技术与理论基础”的插图建议。

## 已生成图文件

1. figures/ch2-figure-llm-coze-architecture.drawio
   - 建议放置：2.1.3 Coze（扣子）Bot 开发平台简介
   - 图题建议：图2-1 大语言模型与 Coze 多 Bot 集成架构

2. figures/ch2-figure-prompt-structured-pipeline.drawio
   - 建议放置：2.2.2 结构化 JSON 输出与多轮对话管理
   - 图题建议：图2-2 Prompt 工程与结构化输出处理流程

3. figures/ch2-figure-rag-knowledge-flow.drawio
   - 建议放置：2.3.1 扣子平台知识库功能简介（或 2.3.2）
   - 图题建议：图2-3 平台侧知识增强与站内知识协同流程

4. figures/ch2-figure-sse-sequence.drawio
   - 建议放置：2.4.6 SSE 流式通信技术
   - 图题建议：图2-4 SSE 流式交互时序图

## PNG 导出（可选）

若本机已安装 draw.io CLI：

powershell -ExecutionPolicy Bypass -File scripts/export_ch2_drawio_png.ps1

将输出：

- figures/ch2-figure-llm-coze-architecture.drawio.png
- figures/ch2-figure-prompt-structured-pipeline.drawio.png
- figures/ch2-figure-rag-knowledge-flow.drawio.png
- figures/ch2-figure-sse-sequence.drawio.png
