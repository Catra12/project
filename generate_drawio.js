const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const http = require('http');

// ── PlantUML encoding ────────────────────────────────────────────────
function encode6bit(b) {
    if (b < 10) return String.fromCharCode(48 + b);
    b -= 10; if (b < 26) return String.fromCharCode(65 + b);
    b -= 26; if (b < 26) return String.fromCharCode(97 + b);
    b -= 26; if (b === 0) return '-'; if (b === 1) return '_'; return '?';
}
function append3bytes(b1, b2, b3) {
    return encode6bit(b1 >> 2 & 0x3F) + encode6bit(((b1 & 3) << 4 | b2 >> 4) & 0x3F)
         + encode6bit(((b2 & 0xF) << 2 | b3 >> 6) & 0x3F) + encode6bit(b3 & 0x3F);
}
function encodePlantUML(text) {
    const comp = zlib.deflateRawSync(Buffer.from(text, 'utf-8'), { level: 9 });
    let r = '';
    for (let i = 0; i < comp.length; i += 3) {
        r += i + 2 < comp.length ? append3bytes(comp[i], comp[i+1], comp[i+2])
           : i + 1 < comp.length ? append3bytes(comp[i], comp[i+1], 0) : append3bytes(comp[i], 0, 0);
    }
    return r;
}

function fetchSVG(encoded) {
    return new Promise((resolve, reject) => {
        http.get(`http://www.plantuml.com/plantuml/svg/${encoded}`, (res) => {
            let data = Buffer.alloc(0);
            res.on('data', c => { data = Buffer.concat([data, c]); });
            res.on('end', () => res.statusCode === 200 ? resolve(data.toString('utf8')) : reject(new Error(`Status ${res.statusCode}`)));
        }).on('error', reject);
    });
}

function getDimensions(svgText) {
    const w = svgText.match(/width="([\d.]+)(px)?"/);
    const h = svgText.match(/height="([\d.]+)(px)?"/);
    return { width: w ? Math.round(parseFloat(w[1])) : 800, height: h ? Math.round(parseFloat(h[1])) : 600 };
}

// ── Helper to escape XML special characters ────────────────────────
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// ── Generate editable Draw.io mxGraph XML embedding SVG via foreignObject ──
// Draw.io's "extra" tag stores the SVG source for the PlantUML plugin style
function createDrawioWithSVGLayer(svgText, title, filename) {
    const { width, height } = getDimensions(svgText);
    const encodedSvg = encodeURIComponent(svgText);

    // We embed the SVG as a proper image layer PLUS store the raw SVG
    // in a "note" cell so users can see/edit it as needed.
    const id1 = Math.random().toString(36).substring(2, 10);
    const id2 = Math.random().toString(36).substring(2, 10);
    const compressedXml = (() => {
        // Draw.io can store diagram data compressed. Here we just inline raw.
        return null;
    })();

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="5.0" version="20.0.0" type="device">
  <diagram id="${id1}" name="${escapeXml(title)}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="${id2}" value="" style="shape=image;html=1;aspect=fixed;image=data:image/svg+xml,${encodedSvg};" vertex="1" parent="1">
          <mxGeometry x="20" y="20" width="${width}" height="${height}" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

async function run() {
    const mdPath = path.join(__dirname, 'UML_PlantUML_Code.md');
    const outDir = path.join(__dirname, 'drawio_diagrams');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const content = fs.readFileSync(mdPath, 'utf8');

    const regex = /```plantuml([\s\S]*?)```/gi;
    let match, index = 1;
    const diagrams = [];
    while ((match = regex.exec(content)) !== null) {
        const pumlCode = match[1].trim();
        const prec = content.substring(0, match.index).split('\n');
        let title = `Diagram_${index}`;
        for (let j = prec.length - 1; j >= 0; j--) {
            const l = prec[j].trim();
            if (l.startsWith('## ') || l.startsWith('### ')) { title = l.replace(/^##+\s+/, '').trim(); break; }
        }
        const fn = title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9\s]/g,'_').trim().replace(/\s+/g,'_').replace(/_+/g,'_') + '.drawio';
        diagrams.push({ title, filename: fn, code: pumlCode });
        index++;
    }

    console.log(`Tìm thấy ${diagrams.length} biểu đồ. Đang tạo .drawio...`);
    for (let i = 0; i < diagrams.length; i++) {
        const d = diagrams[i];
        console.log(`[${i+1}/${diagrams.length}] ${d.title} → ${d.filename}`);
        try {
            const encoded = encodePlantUML(d.code);
            const svg = await fetchSVG(encoded);
            const xml = createDrawioWithSVGLayer(svg, d.title, d.filename);
            fs.writeFileSync(path.join(outDir, d.filename), xml, 'utf8');
            console.log(`   ✔ Xong`);
        } catch (e) {
            console.error(`   ✘ Lỗi: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 600));
    }
    console.log('\nHoàn thành!');
}
run();
