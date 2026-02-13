import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { fileURLToPath } from "url";
import { authRoutes } from "./routes/authRoutes.mjs";
import { pluginRoutes } from "./routes/pluginRoutes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const ZIP_DIR = process.env.ZIP_DIR || path.join(__dirname, "zips");
const STORAGE_TYPE = process.env.STORAGE_TYPE || "local";

// Seguranca basica + logs
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(morgan("combined"));

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Sessao
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.TRUST_PROXY === "1",
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 3600000,
      sameSite: "lax",
    },
  })
);

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

// Validacao de storage no startup
async function validateStorage() {
  try {
    await fs.promises.mkdir(ZIP_DIR, { recursive: true });
    const testFile = path.join(ZIP_DIR, ".write-test");
    await fs.promises.writeFile(testFile, "test");
    await fs.promises.unlink(testFile);
    console.log(`Armazenamento [${STORAGE_TYPE}] validado: ${ZIP_DIR}`);
  } catch (err) {
    console.error(`FATAL: Diretorio ${ZIP_DIR} nao e gravavel:`, err.message);
    process.exit(1);
  }
}

// Rota raiz
app.get("/", (req, res) => {
  if (req.session?.authenticated) {
    return res.redirect("/admin/list");
  }
  return res.redirect("/login");
});

// Rota de saude
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Endpoint de download por nome: /download/:name
app.get("/download/:name", async (req, res) => {
  try {
    const rawName = req.params.name;

    // Validacao simples do nome (letras, numeros, -, _, .)
    if (!/^[\w.-]+$/.test(rawName)) {
      return res.status(400).json({ error: "Nome de arquivo invalido." });
    }

    // Forca extensao .zip (se ja vier com .zip, mantemos)
    const fileName = rawName.endsWith(".zip") ? rawName : `${rawName}.zip`;

    // Resolve caminho seguro dentro de ZIP_DIR (evita path traversal)
    const base = path.resolve(ZIP_DIR);
    const candidate = path.resolve(path.join(ZIP_DIR, fileName));
    if (!candidate.startsWith(base + path.sep) && candidate !== base) {
      return res.status(400).json({ error: "Caminho invalido." });
    }

    // Verifica se existe e e arquivo
    const stat = await fs.promises.stat(candidate).catch(() => null);
    if (!stat || !stat.isFile()) {
      return res.status(404).json({ error: "Arquivo nao encontrado." });
    }

    // Cabecalhos de download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(candidate)}"`
    );

    // Cache opcional
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

// Lista simples dos zips disponiveis (JSON - publico)
app.get("/list", async (_req, res) => {
  try {
    const base = path.resolve(ZIP_DIR);
    const files = await fs.promises.readdir(base);
    const zips = [];
    for (const f of files) {
      if (!f.endsWith(".zip")) continue;
      const full = path.join(base, f);
      const stat = await fs.promises.stat(full).catch(() => null);
      if (stat?.isFile())
        zips.push({ name: f.replace(/\.zip$/, ""), size: stat.size });
    }
    res.json({ count: zips.length, items: zips });
  } catch (e) {
    res.status(500).json({ error: "Falha ao listar arquivos" });
  }
});

// Registrar rotas de autenticacao e plugins admin
authRoutes(app);
pluginRoutes(app, ZIP_DIR);

// Iniciar servidor
validateStorage().then(() => {
  app.listen(PORT, () => {
    console.log(
      `ZIP server rodando em http://0.0.0.0:${PORT} (dir: ${ZIP_DIR}, storage: ${STORAGE_TYPE})`
    );
  });
});
