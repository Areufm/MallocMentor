# -*- coding: utf-8 -*-
"""将 毕业论文正文.md 转为 Word（.docx），供毕业设计直接使用。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt
from docx.oxml import OxmlElement


def set_cell_shading(cell, fill: str) -> None:
    """表头浅灰底 fill 如 D9D9D9."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def add_paragraph_with_inline(doc: Document, text: str, style: str | None = None) -> None:
    """支持 **粗体** 与 `行内代码`。"""
    p = doc.add_paragraph(style=style)
    if not text.strip():
        return
    parts = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            run = p.add_run(part[2:-2])
            run.bold = True
        elif part.startswith("`") and part.endswith("`"):
            run = p.add_run(part[1:-1])
            run.font.name = "Consolas"
            run._element.rPr.rFonts.set(qn("w:eastAsia"), "SimSun")
            run.font.size = Pt(10.5)
        else:
            p.add_run(part)


def is_table_row(line: str) -> bool:
    s = line.strip()
    return s.startswith("|") and s.count("|") >= 2


def parse_table_row(line: str) -> list[str]:
    cells = [c.strip() for c in line.strip().split("|")]
    if cells and cells[0] == "":
        cells = cells[1:]
    if cells and cells[-1] == "":
        cells = cells[:-1]
    return cells


def is_separator_row(cells: list[str]) -> bool:
    if not cells:
        return False
    return all(re.match(r"^:?-{3,}:?$", c.strip()) for c in cells if c.strip()) or all(
        set(c.replace("-", "").replace(":", "").strip()) <= {""} for c in cells
    )


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    md_path = root / "毕业论文正文.md"
    out_path = root / "毕业论文正文.docx"
    if len(sys.argv) >= 2:
        md_path = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        out_path = Path(sys.argv[2])

    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    doc = Document()
    section = doc.sections[0]
    section.page_height = Cm(29.7)
    section.page_width = Cm(21.0)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")
    style.font.size = Pt(12)

    first_hash_title_done = False
    in_code = False
    code_buf: list[str] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        raw = line.rstrip()

        if in_code:
            if raw.strip().startswith("```"):
                para = doc.add_paragraph()
                run = para.add_run("\n".join(code_buf))
                run.font.name = "Consolas"
                para.paragraph_format.left_indent = Cm(0.5)
                code_buf = []
                in_code = False
            else:
                code_buf.append(line)
            i += 1
            continue

        if raw.strip().startswith("```"):
            in_code = True
            i += 1
            continue

        if raw.strip() == "---":
            i += 1
            continue

        if raw.startswith("> "):
            add_paragraph_with_inline(doc, raw[2:].strip())
            i += 1
            continue

        if is_table_row(raw):
            rows: list[list[str]] = []
            while i < n and is_table_row(lines[i].strip()):
                row = parse_table_row(lines[i])
                if not is_separator_row(row):
                    rows.append(row)
                i += 1
            if not rows:
                continue
            ncol = max(len(r) for r in rows)
            for r in rows:
                while len(r) < ncol:
                    r.append("")
            tbl = doc.add_table(rows=len(rows), cols=ncol)
            tbl.style = "Table Grid"
            for ri, row in enumerate(rows):
                for ci, cell_text in enumerate(row):
                    cell = tbl.rows[ri].cells[ci]
                    cell.text = re.sub(r"\*\*([^*]+)\*\*", r"\1", cell_text)
                    for p in cell.paragraphs:
                        for run in p.runs:
                            run.font.size = Pt(10.5)
                            run.font.name = "Times New Roman"
                            run._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")
                    if ri == 0:
                        set_cell_shading(cell, "E7E6E6")
            doc.add_paragraph()
            continue

        m1 = re.match(r"^(#{1,6})\s+(.*)$", raw)
        if m1:
            hashes, title = m1.group(1), m1.group(2).strip()
            level = len(hashes)
            if level == 1 and not first_hash_title_done:
                h = doc.add_heading(title, level=0)
                h.alignment = WD_ALIGN_PARAGRAPH.CENTER
                first_hash_title_done = True
            elif level == 1:
                doc.add_heading(title, level=1)
            elif level == 2:
                if re.match(
                    r"^(摘\s*要|ABSTRACT|致\s*谢|参考文献|附\s*录)", title, re.I
                ):
                    doc.add_heading(title, level=1)
                else:
                    doc.add_heading(title, level=2)
            elif level == 3:
                doc.add_heading(title, level=3)
            else:
                doc.add_heading(title, level=min(level, 9))
            i += 1
            continue

        if not raw.strip():
            i += 1
            continue

        buf = [raw]
        i += 1
        while i < n:
            nxt = lines[i].rstrip()
            if not nxt.strip():
                break
            if nxt.startswith("#") or nxt.strip().startswith("```") or is_table_row(nxt):
                break
            if nxt.startswith("> ") or nxt.strip() == "---":
                break
            buf.append(nxt)
            i += 1
        para_text = "\n".join(buf)
        add_paragraph_with_inline(doc, para_text)
        doc.add_paragraph()

    doc.save(out_path)
    print(f"Written: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
