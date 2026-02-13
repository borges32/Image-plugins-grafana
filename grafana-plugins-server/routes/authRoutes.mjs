import bcrypt from "bcryptjs";
import { loginPage } from "../views/loginPage.mjs";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
let ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || null;

// Fallback: hash plaintext password at startup (dev convenience)
if (!ADMIN_HASH && process.env.ADMIN_PASSWORD) {
  ADMIN_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  console.warn(
    "AVISO: Usando ADMIN_PASSWORD em texto plano. Use ADMIN_PASSWORD_HASH em producao."
  );
}

if (!ADMIN_HASH) {
  console.error(
    "FATAL: Defina ADMIN_PASSWORD_HASH ou ADMIN_PASSWORD nas variaveis de ambiente."
  );
  process.exit(1);
}

export function authRoutes(app) {
  app.get("/login", (req, res) => {
    if (req.session?.authenticated) {
      return res.redirect("/admin/list");
    }
    const error = req.query.error === "1";
    res.send(loginPage(error));
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (
      username === ADMIN_USER &&
      (await bcrypt.compare(password || "", ADMIN_HASH))
    ) {
      req.session.authenticated = true;
      req.session.username = username;
      return res.redirect("/admin/list");
    }
    return res.redirect("/login?error=1");
  });

  app.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
}
