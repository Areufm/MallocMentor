from __future__ import annotations

import asyncio
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastmcp import Client


@dataclass(frozen=True)
class FigureTask:
    name: str
    filename: str
    aspect_ratio: str
    prompt: str


FIGURES: list[FigureTask] = [
    FigureTask(
        name="llm_coze_architecture",
        filename="ch2-figure-llm-coze-architecture.png",
        aspect_ratio="16:9",
        prompt=(
            "Create a clean academic architecture diagram, flat vector style, white background. "
            "Title: LLM and Coze Multi-Bot Integration Architecture. "
            "Show six blocks with clear arrows: "
            "(1) Student Web UI, "
            "(2) Next.js API Layer, "
            "(3) Unified AI Access Layer (prompt builder, parser, validator), "
            "(4) Four Coze Bots: Interview Bot, Code Review Bot, Knowledge Bot, Learning Path Bot, "
            "(5) External Services: Piston or Judge0 sandbox and Coze API, "
            "(6) Data Layer: PostgreSQL plus Prisma plus Activity Log. "
            "Use concise English labels only, high contrast, no decorative icons, no watermark."
        ),
    ),
    FigureTask(
        name="prompt_structured_pipeline",
        filename="ch2-figure-prompt-structured-pipeline.png",
        aspect_ratio="16:9",
        prompt=(
            "Create a technical flowchart, flat vector style, white background. "
            "Title: Prompt Engineering and Structured Output Pipeline. "
            "Flow from left to right with arrows: "
            "Task Context Input -> Prompt Template Constraints -> Model Response -> Preprocessing -> "
            "Tolerant JSON Parsing -> Schema Validation -> Score Mapping and Suggestion Generation -> "
            "Database Persistence. "
            "Add fallback branch from Tolerant JSON Parsing to Raw Text Preservation when parsing fails. "
            "Use crisp English labels, clean rectangles and diamonds, no watermark."
        ),
    ),
    FigureTask(
        name="rag_knowledge_flow",
        filename="ch2-figure-rag-knowledge-flow.png",
        aspect_ratio="16:9",
        prompt=(
            "Create a technical diagram for educational RAG workflow, flat vector style, white background. "
            "Title: Platform-side Knowledge Enhancement Flow. "
            "Show components and arrows: Student Question -> Coze Retriever -> Knowledge Base Chunk Recall -> "
            "Grounded Generation -> Streaming Answer. "
            "Add a parallel local path: KnowledgeArticle Table -> Article Query API -> Learning Page. "
            "Add a merge note: Assistant combines grounded answer with local learning navigation. "
            "Use clear English text and academic style, no watermark."
        ),
    ),
    FigureTask(
        name="sse_sequence",
        filename="ch2-figure-sse-sequence.png",
        aspect_ratio="16:9",
        prompt=(
            "Create a UML sequence diagram style image, clean vector, white background. "
            "Title: SSE Streaming Interaction Sequence. "
            "Participants: Browser Client, Next.js API Route, Coze Bot Service. "
            "Message sequence: "
            "1) User sends message, "
            "2) API creates or reuses session_id, "
            "3) API forwards request to Coze, "
            "4) Coze returns text event stream chunks, "
            "5) API repackages to SSE data frames, "
            "6) Browser appends chunks incrementally, "
            "7) API sends DONE marker and browser closes loading state. "
            "Use readable English labels and arrows, no watermark."
        ),
    ),
]


def _last_non_empty_env_value(env_path: Path, keys: tuple[str, ...]) -> str | None:
    if not env_path.exists():
        return None

    pattern = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$")
    found: dict[str, str] = {}

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        match = pattern.match(raw_line)
        if not match:
            continue
        key, value = match.group(1), match.group(2).strip()
        if key not in keys:
            continue
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        if value:
            found[key] = value

    for key in keys:
        if key in found and found[key].strip():
            return found[key].strip()
    return None


def load_api_key() -> str:
    workspace_root = Path(__file__).resolve().parents[1]
    env_path = workspace_root / ".env"
    load_dotenv(env_path)

    key = (
        _last_non_empty_env_value(env_path, ("GEMINI_API_KEY", "GOOGLE_API_KEY"))
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
    )
    if not key:
        raise RuntimeError(
            "Missing GEMINI_API_KEY or GOOGLE_API_KEY. "
            "Set it in environment or .env before running."
        )
    return key


def build_client_config(api_key: str) -> dict[str, Any]:
    return {
        "mcpServers": {
            "nanobanana": {
                "command": "python",
                "args": ["-m", "nanobanana_mcp_server.server"],
                "env": {
                    "GEMINI_API_KEY": api_key,
                    "NANOBANANA_MODEL": "nb2",
                },
            }
        }
    }


async def generate_all(output_dir: Path) -> list[dict[str, Any]]:
    output_dir.mkdir(parents=True, exist_ok=True)

    api_key = load_api_key()
    config = build_client_config(api_key)

    report: list[dict[str, Any]] = []

    async with Client(config, timeout=300) as client:
        tools = await client.list_tools()
        tool_names = [t.name for t in tools]
        if "generate_image" not in tool_names:
            raise RuntimeError(f"generate_image tool not found. Available tools: {tool_names}")

        for task in FIGURES:
            target_path = output_dir / task.filename
            args = {
                "prompt": task.prompt,
                "model_tier": "nb2",
                "resolution": "4k",
                "aspect_ratio": task.aspect_ratio,
                "n": 1,
                "output_path": str(target_path),
            }

            item: dict[str, Any] = {
                "name": task.name,
                "file": str(target_path),
                "status": "unknown",
                "error": None,
            }

            try:
                result = await client.call_tool(
                    "generate_image",
                    args,
                    raise_on_error=False,
                    timeout=420,
                )

                if result.is_error:
                    item["status"] = "error"
                    detail = None
                    if result.content:
                        first = result.content[0]
                        detail = getattr(first, "text", None)
                    item["error"] = detail or "tool_error"
                else:
                    exists = target_path.exists() and target_path.stat().st_size > 0
                    item["status"] = "ok" if exists else "missing_output"
                    item["size"] = target_path.stat().st_size if exists else 0
                    if not exists:
                        detail = None
                        if result.content:
                            first = result.content[0]
                            detail = getattr(first, "text", None)
                        item["error"] = detail or "no_output_file"
            except Exception as exc:  # noqa: BLE001
                item["status"] = "error"
                item["error"] = str(exc)

            report.append(item)
            print(f"[{item['status']}] {item['name']} -> {item['file']}")

    return report


def main() -> None:
    workspace_root = Path(__file__).resolve().parents[1]
    output_dir = workspace_root / "figures"

    report = asyncio.run(generate_all(output_dir))

    report_path = output_dir / "ch2-banana-generation-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    ok_count = sum(1 for x in report if x.get("status") == "ok")
    print(f"Done. {ok_count}/{len(report)} figures generated successfully.")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
