const fs = require('fs');
const API_KEY = process.env.GOOGLE_API_KEY;
const RAIZ = process.env.DRIVE_ROOT_ID;

async function listarPasta(id) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id,name,mimeType)&key=${API_KEY}&orderBy=folder,name`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

async function construirArvore(id) {
  const itens = await listarPasta(id);
  let html = '<ul>\n';
  for (const item of itens) {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      const filhos = await construirArvore(item.id);
      html += `<li><details><summary class="pasta">${item.name}</summary>${filhos}</details></li>\n`;
    } else {
      const link = `https://drive.google.com/uc?export=download&id=${item.id}`;
      html += `<li class="arquivo"><a href="${link}">${item.name}</a></li>\n`;
    }
  }
  html += '</ul>\n';
  return html;
}

async function main() {
  const arvore = await construirArvore(RAIZ);
  const paginaCompleta = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Biblioteca de Alexandria — Índice</title>
<link rel="stylesheet" href="indice-style.css">
</head>
<body>
<h1>Índice da Biblioteca</h1>
${arvore}
</body>
</html>`;
  fs.writeFileSync('indice.html', paginaCompleta);
  console.log('indice.html gerado com sucesso.');
}

main();
