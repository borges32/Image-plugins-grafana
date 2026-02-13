import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.mjs";
import { uploadPage } from "../views/uploadPage.mjs";
import { listPage } from "../views/listPage.mjs";

function configureUpload(zipDir) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, zipDir),
    filename: (_req, file, cb) => {
      // Preserve original filename exactly as uploaded
      cb(null, file.originalname);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter: (_req, file, cb) => {
      if (path.extname(file.originalname).toLowerCase() !== ".zip") {
        return cb(new Error("Apenas arquivos .zip sao permitidos"));
      }
      cb(null, true);
    },
  });
}

export function pluginRoutes(app, zipDir) {
  const upload = configureUpload(zipDir);

  // --- Upload page ---
  app.get("/admin/upload", requireAuth, (req, res) => {
    res.send(uploadPage({ msg: req.query.msg, error: req.query.error }));
  });

  // --- Handle upload ---
  app.post("/admin/upload", requireAuth, (req, res) => {
    upload.single("plugin")(req, res, (err) => {
      if (err) {
        const message =
          err instanceof multer.MulterError
            ? `Erro no upload: ${err.message}`
            : err.message;
        return res.redirect(
          `/admin/upload?error=${encodeURIComponent(message)}`
        );
      }
      if (!req.file) {
        return res.redirect(
          `/admin/upload?error=${encodeURIComponent("Nenhum arquivo selecionado.")}`
        );
      }
      return res.redirect(
        `/admin/list?msg=${encodeURIComponent(`Upload realizado: ${req.file.originalname}`)}`
      );
    });
  });

  // --- Admin list page ---
  app.get("/admin/list", requireAuth, async (req, res) => {
    try {
      const base = path.resolve(zipDir);
      const files = await fs.promises.readdir(base);
      const plugins = [];

      for (const f of files) {
        if (!f.endsWith(".zip")) continue;
        const full = path.join(base, f);
        const stat = await fs.promises.stat(full).catch(() => null);
        if (stat?.isFile()) {
          plugins.push({
            name: f,
            size: stat.size,
            modified: stat.mtime,
          });
        }
      }

      // Sort by modification date descending (newest first)
      plugins.sort((a, b) => b.modified - a.modified);

      res.send(listPage(plugins, { msg: req.query.msg, error: req.query.error }));
    } catch (e) {
      console.error(e);
      res.status(500).send("Erro ao listar plugins");
    }
  });

  // --- Delete plugin ---
  app.post("/admin/delete/:name", requireAuth, async (req, res) => {
    try {
      const rawName = req.params.name;

      // Validate filename
      if (!/^[\w.-]+$/.test(rawName)) {
        return res.redirect(
          `/admin/list?error=${encodeURIComponent("Nome de arquivo invalido.")}`
        );
      }

      // Ensure .zip extension
      const fileName = rawName.endsWith(".zip") ? rawName : `${rawName}.zip`;

      // Path traversal protection
      const base = path.resolve(zipDir);
      const candidate = path.resolve(path.join(zipDir, fileName));
      if (!candidate.startsWith(base + path.sep) && candidate !== base) {
        return res.redirect(
          `/admin/list?error=${encodeURIComponent("Caminho invalido.")}`
        );
      }

      // Check file exists
      const stat = await fs.promises.stat(candidate).catch(() => null);
      if (!stat || !stat.isFile()) {
        return res.redirect(
          `/admin/list?error=${encodeURIComponent("Arquivo nao encontrado.")}`
        );
      }

      await fs.promises.unlink(candidate);

      return res.redirect(
        `/admin/list?msg=${encodeURIComponent(`Excluido: ${fileName}`)}`
      );
    } catch (e) {
      console.error(e);
      return res.redirect(
        `/admin/list?error=${encodeURIComponent("Erro ao excluir arquivo.")}`
      );
    }
  });
}
