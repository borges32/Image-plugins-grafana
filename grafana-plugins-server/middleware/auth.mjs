export function requireAuth(req, res, next) {
  if (req.session?.authenticated) {
    return next();
  }
  if (req.headers.accept?.includes("application/json")) {
    return res.status(401).json({ error: "Nao autenticado" });
  }
  return res.redirect("/login");
}
