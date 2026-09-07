// Sinh file Word (.docx) từ docs/bao-cao-du-an.md — chạy: node scripts/make-report-docx.mjs
import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const SRC = path.resolve("docs/bao-cao-du-an.md");
const OUT = path.resolve("docs/Bao-Cao-Du-An.docx");

// --- Inline: **bold**, *italic*, `code`, [text](url) -> TextRun[] ---
function inlineRuns(text) {
  const plain = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  const pushPlain = (s) => {
    if (!s) return;
    const clean = s.replace(/[*`]/g, "");
    if (clean) runs.push(new TextRun({ text: clean }));
  };
  while ((m = re.exec(plain))) {
    pushPlain(plain.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      runs.push(new TextRun({ text: tok.slice(2, -2), bold: true }));
    } else if (tok.startsWith("`")) {
      runs.push(new TextRun({ text: tok.slice(1, -1), font: "Consolas", size: 20, color: "84211A" }));
    } else {
      runs.push(new TextRun({ text: tok.slice(1, -1), italics: true }));
    }
    last = m.index + tok.length;
  }
  pushPlain(plain.slice(last));
  return runs;
}

function para(text, opts = {}) {
  return new Paragraph({ children: inlineRuns(text), spacing: { after: 120 }, ...opts });
}

const bullet = (text) =>
  new Paragraph({
    children: inlineRuns(text),
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
  });

// --- Bảng markdown -> Table ---
function tableBlock(lines) {
  const rows = [];
  for (const line of lines) {
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    if (cells.length && cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map((r) => r.length));
  const width = 9640;
  const colW = Math.floor(width / colCount);
  const widths = Array.from({ length: colCount }, (_, i) =>
    i === 0 ? width - colW * (colCount - 1) : colW,
  );
  const mkCell = (cell, isHeader) => {
    const children = isHeader
      ? [new Paragraph({ children: inlineRuns(cell || ""), bold: true, spacing: { after: 40 } })]
      : [new Paragraph({ children: inlineRuns(cell || ""), spacing: { after: 40 } })];
    return new TableCell({
      children,
      width: { size: widths[rows[0].indexOf?.(cell) ?? 0] ?? colW, type: WidthType.DXA },
      shading: isHeader ? { type: ShadingType.CLEAR, fill: "F2EAD3" } : undefined,
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
    });
  };
  const trs = rows.map((r, ri) => {
    const isHeader = ri === 0;
    const cells = Array.from({ length: colCount }, (_, ci) => mkCell(r[ci] ?? "", isHeader));
    return new TableRow({ children: cells });
  });
  return new Table({
    rows: trs,
    width: { size: width, type: WidthType.DXA },
    columnWidths: widths,
  });
}

// --- Đọc md, phân loại dòng ---
const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);
const children = [];
let i = 0;
let isCover = true; // sau `---` đầu tiên thì hết phần bìa

while (i < lines.length) {
  const line = lines[i];

  // Bảng: bắt đầu dòng "|"
  if (line.trim().startsWith("|")) {
    const block = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      block.push(lines[i]);
      i++;
    }
    const t = tableBlock(block);
    if (t) children.push(t);
    children.push(new Paragraph({ spacing: { after: 160 } }));
    continue;
  }

  if (/^#{1,6}\s/.test(line)) {
    const level = line.match(/^#+/)[0].length;
    const text = line.replace(/^#+\s*/, "");
    const headingMap = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
    };
    // Dòng "# " đầu tiên (tiêu đề chính) dùng TITLE
    if (level === 1 && text === "BÁO CÁO DỰ ÁN — THƯ VIỆN HỌA TIẾT") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          children: inlineRuns(text),
          spacing: { after: 240 },
        }),
      );
    } else if (text === "MỤC LỤC") {
      children.push(
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: inlineRuns(text), spacing: { before: 120, after: 120 } }),
      );
    } else {
      children.push(
        new Paragraph({
          children: inlineRuns(text),
          heading: headingMap[level] ?? HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        }),
      );
    }
    i++;
    continue;
  }

  if (/^-{3,}\s*$/.test(line.trim())) {
    if (isCover) {
      isCover = false;
      children.push(new Paragraph({ children: [new PageBreak()] }));
    } else {
      children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D8C79C" } }, spacing: { after: 160 } }));
    }
    i++;
    continue;
  }

  if (line.trim().startsWith("- ")) {
    children.push(bullet(line.trim().slice(2)));
    i++;
    continue;
  }

  if (line.trim().startsWith(">")) {
    children.push(
      new Paragraph({
        children: inlineRuns(line.trim().replace(/^>\s?/, "")),
        italics: true,
        indent: { left: 480 },
        spacing: { after: 120 },
      }),
    );
    i++;
    continue;
  }

  if (line.trim() === "") {
    i++;
    continue;
  }

  children.push(para(line));
  i++;
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Segoe UI", size: 22, color: "241A0F" } },
    },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { bold: true, size: 56, color: "241A0F" } },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {},
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Thư viện Họa Tiết — Trang ", size: 18, color: "84704A" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "84704A" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`Đã tạo: ${OUT} (${(buf.length / 1024).toFixed(0)} KB)`);
});