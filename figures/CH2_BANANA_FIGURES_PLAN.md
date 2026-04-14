# Chapter 2 Banana Figures Plan

This plan maps each generated figure to a Chapter 2 section.

## Planned outputs

1. ch2-figure-llm-coze-architecture.png
   - Suggested location: Section 2.1.3 (Coze platform intro)
   - Caption: Figure 2-1 LLM and Coze Multi-Bot Integration Architecture

2. ch2-figure-prompt-structured-pipeline.png
   - Suggested location: Section 2.2.2 (structured JSON output)
   - Caption: Figure 2-2 Prompt Engineering and Structured Output Pipeline

3. ch2-figure-rag-knowledge-flow.png
   - Suggested location: Section 2.3.1 (platform-side knowledge enhancement)
   - Caption: Figure 2-3 Platform-side Knowledge Enhancement Flow

4. ch2-figure-sse-sequence.png
   - Suggested location: Section 2.4.6 (SSE streaming communication)
   - Caption: Figure 2-4 SSE Streaming Interaction Sequence

## Generation command

Run from workspace root:

powershell -ExecutionPolicy Bypass -File scripts/run_ch2_banana_figures.ps1

Generated files and status report:

- figures/ch2-figure-llm-coze-architecture.png
- figures/ch2-figure-prompt-structured-pipeline.png
- figures/ch2-figure-rag-knowledge-flow.png
- figures/ch2-figure-sse-sequence.png
- figures/ch2-banana-generation-report.json
