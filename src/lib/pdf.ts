// Gerador mínimo de PDF (1 página, Helvetica/WinAnsi) para guias e relatórios de demonstração.

export type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gap?: number;
  color?: [number, number, number];
};

function toLatin1(text: string): string {
  return text
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2022/g, "-")
    .replace(/\u202F/g, " ")
    .replace(/[^\x00-\xFF]/g, "?");
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildPdf(title: string, lines: PdfLine[]): Buffer {
  const ops: string[] = [];
  // Faixa azul do cabeçalho
  ops.push("0.043 0.165 0.306 rg 0 762 595 80 re f");
  ops.push("0.788 0.635 0.153 rg 0 758 595 4 re f");
  ops.push(`BT /F2 20 Tf 1 1 1 rg 50 806 Td (${escapePdf(toLatin1("Goldoni Contadores"))}) Tj ET`);
  ops.push(
    `BT /F1 10 Tf 0.85 0.9 1 rg 50 788 Td (${escapePdf(
      toLatin1("Contabilidade & Direito · Rua das Palmeiras, 250 · Centro · Junqueirópolis/SP"),
    )}) Tj ET`,
  );
  ops.push(`BT /F2 16 Tf 0.043 0.165 0.306 rg 50 720 Td (${escapePdf(toLatin1(title))}) Tj ET`);
  ops.push("0.85 0.87 0.9 RG 1 w 50 708 m 545 708 l S");

  let y = 708;
  for (const line of lines) {
    const size = line.size ?? 11;
    y -= line.gap ?? size + 9;
    const [r, g, b] = line.color ?? [0.12, 0.14, 0.18];
    ops.push(
      `BT /${line.bold ? "F2" : "F1"} ${size} Tf ${r} ${g} ${b} rg 50 ${y} Td (${escapePdf(toLatin1(line.text))}) Tj ET`,
    );
  }

  ops.push("0.85 0.87 0.9 RG 1 w 50 70 m 545 70 l S");
  ops.push(
    `BT /F1 8 Tf 0.45 0.47 0.52 rg 50 54 Td (${escapePdf(
      toLatin1("Documento de demonstração gerado pela Central Goldoni — sem valor fiscal."),
    )}) Tj ET`,
  );

  const content = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
