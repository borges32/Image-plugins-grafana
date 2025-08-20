import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const ZIP_DIR = process.env.ZIP_DIR || path.join(__dirname, "zips");

// Segurança básica + logs
app.use(helmet({
  // Permitimos o download de binários/zip sem CSP bloquear
  contentSecurityPolicy: false
}));
app.use(morgan("combined"));

// Rota de saúde
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Endpoint de download por nome: /download/:name
// Ex.: GET /download/plugin-a  -> procura "plugin-a.zip"
app.get("/download/:name", async (req, res) => {
  try {
    const rawName = req.params.name;

    // Validação simples do nome (letras, números, -, _, .)
    if (!/^[\w.-]+$/.test(rawName)) {
      return res.status(400).json({ error: "Nome de arquivo inválido." });
    }

    // Força extensão .zip (se já vier com .zip, mantemos)
    const fileName = rawName.endsWith(".zip") ? rawName : `${rawName}.zip`;

    // Resolve caminho seguro dentro de ZIP_DIR (evita path traversal)
    const base = path.resolve(ZIP_DIR);
    const candidate = path.resolve(path.join(ZIP_DIR, fileName));
    if (!candidate.startsWith(base + path.sep) && candidate !== base) {
      return res.status(400).json({ error: "Caminho inválido." });
    }

    // Verifica se existe e é arquivo
    const stat = await fs.promises.stat(candidate).catch(() => null);
    if (!stat || !stat.isFile()) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }

    // Cabeçalhos de download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${path.basename(candidate)}"`);

    // Cache opcional (ajuste conforme necessidade)
    res.setHeader("Cache-Control", "public, max-age=300, immutable");

    // Stream do arquivo
    const stream = fs.createReadStream(candidate);
    stream.on("error", (err) => {
      console.error(err);
      if (!res.headersSent) res.status(500).end("Erro ao ler o arquivo");
      else res.end();
    });
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// (Opcional) Lista simples dos zips disponíveis
app.get("/list", async (_req, res) => {
  try {
    const base = path.resolve(ZIP_DIR);
    const files = await fs.promises.readdir(base);
    const zips = [];
    for (const f of files) {
      if (!f.endsWith(".zip")) continue;
      const full = path.join(base, f);
      const stat = await fs.promises.stat(full).catch(() => null);
      if (stat?.isFile()) zips.push({ name: f.replace(/\.zip$/, ""), size: stat.size });
    }
    res.json({ count: zips.length, items: zips });
  } catch (e) {
    res.status(500).json({ error: "Falha ao listar arquivos" });
  }
});

app.listen(PORT, () => {
  console.log(`ZIP server rodando em http://0.0.0.0:${PORT} (dir: ${ZIP_DIR})`);
});
