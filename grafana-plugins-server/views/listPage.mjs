import { layout } from "./layout.mjs";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function listPage(plugins, { msg, error } = {}) {
  const rows = plugins
    .map(
      (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${formatSize(p.size)}</td>
      <td>${formatDate(p.modified)}</td>
      <td>
        <div class="actions">
          <a href="/download/${encodeURIComponent(p.name)}" class="btn btn-download">Baixar</a>
          <form method="POST" action="/admin/delete/${encodeURIComponent(p.name)}"
                onsubmit="return confirm('Tem certeza que deseja excluir ${p.name.replace(/'/g, "\\'")}?')">
            <button type="submit" class="btn-delete">Excluir</button>
          </form>
        </div>
      </td>
    </tr>`
    )
    .join("");

  const tableOrEmpty =
    plugins.length > 0
      ? `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Modificado</th>
          <th>A\u00e7\u00f5es</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
      : '<div class="empty-state">Nenhum plugin encontrado.</div>';

  const body = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h1 style="margin-bottom:0">Plugins Dispon\u00edveis (${plugins.length})</h1>
        <a href="/admin/upload" class="btn btn-primary">Upload</a>
      </div>
      ${msg ? `<div class="flash flash-success">${msg}</div>` : ""}
      ${error ? `<div class="flash flash-error">${error}</div>` : ""}
      ${tableOrEmpty}
    </div>`;

  return layout({ title: "Plugins", body, authenticated: true });
}
